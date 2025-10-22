import { PressureSensorSample } from "@/lib/domain-layer/entities/pressure-sensor-sample";

/**
 * [Prompt]
 * create an interface for connecting to a pressure sensor via
 * an arduino nano and reading from it's connected sensor
 */
export interface PressureSensorRepository {
	connect(): Promise<void>;
	disconnect(): Promise<void>;
	isConnected(): boolean;
	readSample(): Promise<PressureSensorSample>;
	onSample(callback: (sample: PressureSensorSample) => void): () => void;
}
