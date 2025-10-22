'use client';

import { PressureSensorSample } from "@/lib/domain-layer/entities/pressure-sensor-sample";
import { PressureSensorRepository } from "@/lib/interface-layer/repository/pressure-sensor-repository";

/**
 * [Prompt]
 * implement #file:pressure-sensor-repository.ts for 
 * connecting to an arduino over serial
 */
type SerialPortLike = {
	readable: ReadableStream<Uint8Array> | null;
	open(options: { baudRate: number }): Promise<void>;
	close(): Promise<void>;
};

type NavigatorWithSerial = Navigator & {
	serial?: {
		requestPort: (options?: SerialPortRequestOptions) => Promise<SerialPortLike>;
	};
};

type SerialPortRequestOptions = {
	filters?: Array<{ usbVendorId?: number; usbProductId?: number }>;
};

type PendingRequest = {
	resolve: (sample: PressureSensorSample) => void;
	reject: (error: unknown) => void;
};

export interface SerialArduinoRepositoryOptions {
	sensorId?: string;
	baudRate?: number;
	requestPort?: () => Promise<SerialPortLike>;
}

export class SerialArduinoPressureSensorRepository
	implements PressureSensorRepository
{
	private port: SerialPortLike | null = null;
	private reader: ReadableStreamDefaultReader<Uint8Array> | null = null;
	private buffer = "";
	private readonly listeners = new Set<
		(sample: PressureSensorSample) => void
	>();
	private readonly pendingRequests: PendingRequest[] = [];
	private readonly sampleQueue: PressureSensorSample[] = [];
	private readLoopPromise: Promise<void> | null = null;
	private readonly sensorId: string;
	private readonly baudRate: number;
	private readonly requestPort: () => Promise<SerialPortLike>;
	private readonly decoder = new TextDecoder();

	constructor(options: SerialArduinoRepositoryOptions = {}) {
		this.sensorId = options.sensorId ?? "arduino-nano-pressure";
		this.baudRate = options.baudRate ?? 115200;
		this.requestPort =
			options.requestPort ?? this.defaultRequestPort.bind(this);
	}

	async connect(): Promise<void> {
		if (this.isConnected()) {
			return;
		}

		const port = await this.requestPort();
		await port.open({ baudRate: this.baudRate });

		this.port = port;
		this.reader = port.readable?.getReader() ?? null;

		if (!this.reader) {
			await this.disconnect();
			throw new Error("Selected serial port is not readable");
		}

		// Launch background loop that ingests newline-delimited samples.
		this.readLoopPromise = this.readLoop();
	}

	async disconnect(): Promise<void> {
		if (!this.port && !this.reader) {
			return;
		}

		const { reader, port } = this;

		this.port = null;
		this.buffer = "";

		if (reader) {
			try {
				await reader.cancel();
			} catch {
				// Ignore cancellation errors; port teardown continues.
			}
			reader.releaseLock();
			this.reader = null;
		}

		if (port) {
			try {
				await port.close();
			} catch {
				// Ignore close errors; connection considered closed regardless.
			}
		}

		this.flushPendingRequests(
			new Error("Serial connection closed before sample could be read"),
		);
	}

	isConnected(): boolean {
		return Boolean(this.port);
	}

	async readSample(): Promise<PressureSensorSample> {
		if (this.sampleQueue.length > 0) {
			return this.sampleQueue.shift()!;
		}

		return new Promise<PressureSensorSample>((resolve, reject) => {
			this.pendingRequests.push({ resolve, reject });
		});
	}

	onSample(
		callback: (sample: PressureSensorSample) => void,
	): () => void {
		this.listeners.add(callback);
		return () => {
			this.listeners.delete(callback);
		};
	}

	private async readLoop(): Promise<void> {
		const reader = this.reader;

		if (!reader) {
			return;
		}

		try {
			while (this.port) {
				const { value, done } = await reader.read();

				if (done) {
					break;
				}

				if (value) {
					this.buffer += this.decoder.decode(value, { stream: true });
					this.processBuffer();
				}
			}

			const remainder = this.buffer.trim();
			if (remainder) {
				this.buffer = "";
				const sample = this.parseSample(remainder);
				if (sample) {
					this.emitSample(sample);
				}
			}
		} catch (error) {
			this.flushPendingRequests(error);
		} finally {
			await this.disconnect();
		}
	}

	private processBuffer(): void {
		const segments = this.buffer.split(/\r?\n/);
		this.buffer = segments.pop() ?? "";

		for (const segment of segments) {
			const sample = this.parseSample(segment.trim());
			if (!sample) {
				continue;
			}
			this.emitSample(sample);
		}
	}

	private emitSample(sample: PressureSensorSample): void {
		if (this.pendingRequests.length > 0) {
			const pending = this.pendingRequests.shift();
			pending?.resolve(sample);
		} else {
			this.sampleQueue.push(sample);
		}

		for (const listener of this.listeners) {
			try {
				listener(sample);
			} catch {
				// Listener exceptions should not disrupt other subscribers.
			}
		}
	}

	private parseSample(segment: string): PressureSensorSample | null {
		if (!segment) {
			return null;
		}

		try {
			const parsed = JSON.parse(segment) as Partial<PressureSensorSample> & {
				pressure?: unknown;
				value?: unknown;
			};
			const pressure = this.coercePressure(parsed);

			if (pressure === null) {
				return null;
			}

			return {
				sensorId: parsed.sensorId ?? this.sensorId,
				receivedAt: parsed.receivedAt
					? new Date(parsed.receivedAt)
					: new Date(),
				pressurePascal: pressure,
			};
		} catch {
			const numeric = Number(segment);
			if (!Number.isFinite(numeric)) {
				return null;
			}

			return {
				sensorId: this.sensorId,
				receivedAt: new Date(),
				pressurePascal: numeric,
			};
		}
	}

	private coercePressure(parsed: {
		pressurePascal?: unknown;
		pressure?: unknown;
		value?: unknown;
	}): number | null {
		const raw =
			parsed.pressurePascal ?? parsed.pressure ?? parsed.value ?? null;

		if (raw === null) {
			return null;
		}

		const numeric = Number(raw);
		return Number.isFinite(numeric) ? numeric : null;
	}

	private flushPendingRequests(error: unknown): void {
		const reason =
			error ?? new Error("Serial connection closed before sample could be read");
		while (this.pendingRequests.length > 0) {
			const pending = this.pendingRequests.shift();
			pending?.reject(reason);
		}
		this.sampleQueue.length = 0;
	}

	private async defaultRequestPort(): Promise<SerialPortLike> {
		if (typeof navigator === "undefined") {
			throw new Error("Web Serial API is not available in this environment");
		}

		const serial = (navigator as NavigatorWithSerial).serial;

		if (!serial) {
			throw new Error("Web Serial API is not available in this environment");
		}

		const port = await serial.requestPort();
		return port;
	}
}
