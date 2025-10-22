"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { PressureSensorApplicationContainer } from "@/lib/application-container";
import type { PressureSensorSampleAggregatePresenter } from "@/lib/interface-layer/presenters/pressure-sensor-sample-aggregate.presenter";
import type { PressureSensorSamplePresenter } from "@/lib/interface-layer/presenters/pressure-sensor-sample.presenter";

/**
 * [Prompt]
 * Replace this serial code implementation with the application 
 * root's controller for a clean architecture example
 */
type SampleViewModel = {
    sensorId: string;
    timestamp: string;
    pressurePascal: number;
};

type AggregateViewModel = {
    aggregateId: string;
    sampleFrequencyHz: number;
    sensors: Array<{
        sensorId: string;
        readings: SampleViewModel[];
    }>;
};

function describeError(error: unknown): string {
    return error instanceof Error ? error.message : String(error);
}

export default function CleanArchitecturePage() {
    const [log, setLog] = useState<string[]>([]);
    const appendLog = useCallback((entry: string) => {
        setLog((prev) => {
            const next = [...prev, `${new Date().toLocaleTimeString()} ${entry}`];
            return next.slice(-200);
        });
    }, []);

    const { controller, repository } = useMemo(() => {
        const samplePresenter: PressureSensorSamplePresenter<SampleViewModel> = {
            async present(sample) {
                return {
                    sensorId: sample.sensorId,
                    timestamp: sample.receivedAt.toISOString(),
                    pressurePascal: sample.pressurePascal,
                };
            },
        };

        const aggregatePresenter: PressureSensorSampleAggregatePresenter<AggregateViewModel> = {
            async present(aggregate) {
                const sensors = await Promise.all(
                    aggregate.sensors.map(async (sensor) => ({
                        sensorId: sensor.sensorId,
                        readings: await Promise.all(
                            sensor.readings.map((reading) => samplePresenter.present(reading)),
                        ),
                    })),
                );

                return {
                    aggregateId: aggregate.aggregateId,
                    sampleFrequencyHz: aggregate.sampleFrequencyHz,
                    sensors,
                };
            },
        };

        const container = new PressureSensorApplicationContainer<
            SampleViewModel,
            AggregateViewModel
        >({
            samplePresenter,
            aggregatePresenter,
        });

        return {
            controller: container.getController(),
            repository: container.getRepository(),
        };
    }, []);

    const [isConnected, setIsConnected] = useState(() => repository.isConnected());
    const [isConnecting, setIsConnecting] = useState(false);
    const [isStreaming, setIsStreaming] = useState(false);
    const [latestSample, setLatestSample] = useState<SampleViewModel | null>(null);
    const [latestAggregate, setLatestAggregate] = useState<AggregateViewModel | null>(null);
    const [streamSamples, setStreamSamples] = useState<SampleViewModel[]>([]);

    const connect = useCallback(async () => {
        setIsConnecting(true);
        try {
            await controller.ensureConnected();
            setIsConnected(true);
            appendLog("Connected to pressure sensor.");
        } catch (error) {
            appendLog(`Connect failed: ${describeError(error)}`);
        } finally {
            setIsConnecting(false);
        }
    }, [controller, appendLog]);

    const disconnect = useCallback(async () => {
        try {
            await controller.disconnect();
            setIsConnected(false);
            setIsStreaming(false);
            setStreamSamples([]);
            appendLog("Disconnected from pressure sensor.");
        } catch (error) {
            appendLog(`Disconnect failed: ${describeError(error)}`);
        }
    }, [controller, appendLog]);

    const sampleOnce = useCallback(async () => {
        try {
            const sample = await controller.sampleSingleSensor();
            setLatestSample(sample);
            appendLog(
                `Sampled ${sample.pressurePascal.toFixed(2)} Pa from ${sample.sensorId}`,
            );
        } catch (error) {
            appendLog(`Sample failed: ${describeError(error)}`);
        }
    }, [controller, appendLog]);

    const sampleAggregate = useCallback(async () => {
        try {
            const aggregate = await controller.sampleAllSensors();
            setLatestAggregate(aggregate);
            appendLog(`Aggregate captured (${aggregate.aggregateId}).`);
        } catch (error) {
            appendLog(`Aggregate failed: ${describeError(error)}`);
        }
    }, [controller, appendLog]);

    useEffect(() => {
        if (!isStreaming) {
            return;
        }

        let unsubscribe: (() => void) | undefined;
        let cancelled = false;

        (async () => {
            try {
                await controller.ensureConnected();
                if (cancelled) {
                    return;
                }
                setIsConnected(true);
                unsubscribe = controller.subscribeToSamples(
                    (sample) => {
                        setStreamSamples((prev) => [sample, ...prev].slice(0, 50));
                        setLatestSample(sample);
                    },
                    (error) => {
                        appendLog(`Stream error: ${describeError(error)}`);
                    },
                );
                appendLog("Streaming subscription active.");
            } catch (error) {
                appendLog(`Unable to start stream: ${describeError(error)}`);
                setIsStreaming(false);
            }
        })();

        return () => {
            cancelled = true;
            if (unsubscribe) {
                unsubscribe();
                appendLog("Streaming subscription stopped.");
            }
        };
    }, [controller, isStreaming, appendLog]);

    useEffect(() => {
        return () => {
            void controller.disconnect();
        };
    }, [controller]);

    const toggleStreaming = useCallback(() => {
        setIsStreaming((prev) => !prev);
    }, []);

    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <h1 className="text-xl font-semibold">Clean Architecture Demo</h1>
                <p className="text-sm text-slate-500">
                    This page composes the pressure-sensor application via the clean architecture
                    container and its controller.
                </p>
                <div className="text-sm">
                    <span className="font-medium">Connection:</span>{" "}
                    <span className={isConnected ? "text-green-600" : "text-slate-500"}>
                        {isConnected ? "Connected" : "Disconnected"}
                    </span>
                </div>
            </div>

            <div className="flex flex-wrap gap-3">
                <button
                    onClick={connect}
                    disabled={isConnecting || isConnected}
                    className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-500 disabled:opacity-60"
                >
                    {isConnecting ? "Connecting..." : "Connect"}
                </button>
                <button
                    onClick={disconnect}
                    disabled={!isConnected}
                    className="rounded bg-red-600 px-4 py-2 text-white hover:bg-red-500 disabled:opacity-60"
                >
                    Disconnect
                </button>
                <button
                    onClick={sampleOnce}
                    disabled={!isConnected}
                    className="rounded bg-slate-900 px-4 py-2 text-white hover:bg-slate-800 disabled:opacity-60"
                >
                    Sample Once
                </button>
                <button
                    onClick={sampleAggregate}
                    disabled={!isConnected}
                    className="rounded bg-slate-700 px-4 py-2 text-white hover:bg-slate-600 disabled:opacity-60"
                >
                    Capture Aggregate
                </button>
                <button
                    onClick={toggleStreaming}
                    disabled={!isConnected}
                    className="rounded bg-green-600 px-4 py-2 text-white hover:bg-green-500 disabled:opacity-60"
                >
                    {isStreaming ? "Stop Streaming" : "Start Streaming"}
                </button>
            </div>

            {latestSample && (
                <div className="space-y-1">
                    <h2 className="font-medium">Latest Sample</h2>
                    <div className="rounded border border-slate-200 bg-white p-3 text-sm">
                        <div className="font-mono text-xs text-slate-500">
                            {latestSample.timestamp}
                        </div>
                        <div className="flex items-baseline gap-2">
                            <span className="font-semibold">{latestSample.pressurePascal.toFixed(2)}</span>
                            <span className="text-xs text-slate-500">Pa</span>
                        </div>
                        <div className="text-xs text-slate-500">
                            Sensor: {latestSample.sensorId}
                        </div>
                    </div>
                </div>
            )}

            {latestAggregate && (
                <div className="space-y-2">
                    <h2 className="font-medium">Latest Aggregate</h2>
                    <div className="rounded border border-slate-200 bg-white p-3 text-sm">
                        <div className="flex flex-wrap gap-4 text-xs text-slate-500">
                            <span>ID: {latestAggregate.aggregateId}</span>
                            <span>Frequency: {latestAggregate.sampleFrequencyHz} Hz</span>
                            <span>Sensors: {latestAggregate.sensors.length}</span>
                        </div>
                        {latestAggregate.sensors.map((sensor) => (
                            <div key={sensor.sensorId} className="mt-3 space-y-1">
                                <div className="text-xs font-semibold text-slate-600">
                                    Sensor {sensor.sensorId}
                                </div>
                                <ul className="space-y-1">
                                    {sensor.readings.slice(0, 3).map((reading, index) => (
                                        <li key={`${sensor.sensorId}-${index}`} className="flex items-center justify-between text-xs">
                                            <span className="font-mono text-[11px] text-slate-500">
                                                {reading.timestamp}
                                            </span>
                                            <span>{reading.pressurePascal.toFixed(2)} Pa</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {streamSamples.length > 0 && (
                <div className="space-y-2">
                    <h2 className="font-medium">Streaming Samples</h2>
                    <ul className="space-y-1 text-xs">
                        {streamSamples.slice(0, 10).map((sample, index) => (
                            <li
                                key={`${sample.sensorId}-${sample.timestamp}-${index}`}
                                className="flex items-center justify-between rounded border border-slate-200 bg-white px-3 py-1"
                            >
                                <span className="font-mono text-[11px] text-slate-500">
                                    {sample.timestamp}
                                </span>
                                <span className="font-semibold">{sample.pressurePascal.toFixed(2)} Pa</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            <div className="space-y-2">
                <h2 className="font-medium">Log</h2>
                <pre className="h-64 overflow-auto rounded border border-slate-200 bg-slate-950 p-3 text-xs text-slate-100">
                    {log.join("\n") || "Waiting for events..."}
                </pre>
            </div>
        </div>
    );
}