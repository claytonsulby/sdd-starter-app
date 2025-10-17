"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type SerialPermissionFilter = {
    usbVendorId?: number;
    usbProductId?: number;
};

type SerialPortRequestOptions = {
    filters?: SerialPermissionFilter[];
};

type SerialOptions = {
    baudRate: number;
};

type SerialPort = {
    readable: ReadableStream<Uint8Array> | null;
    writable: WritableStream<Uint8Array> | null;
    open(options: SerialOptions): Promise<void>;
    close(): Promise<void>;
    getInfo(): { usbVendorId?: number; usbProductId?: number };
};

type SerialConnectionEvent = Event & {
    target: SerialPort | null;
};

type Serial = {
    getPorts(): Promise<SerialPort[]>;
    requestPort(options?: SerialPortRequestOptions): Promise<SerialPort>;
    addEventListener(type: "connect" | "disconnect", listener: (event: SerialConnectionEvent) => void): void;
    removeEventListener(type: "connect" | "disconnect", listener: (event: SerialConnectionEvent) => void): void;
};

type SerialPortWithInfo = SerialPort & {
    getInfo(): { usbVendorId?: number; usbProductId?: number };
};

const getWebSerial = (): Serial | undefined => {
    if (typeof navigator === "undefined") {
        return undefined;
    }

    return (navigator as Navigator & { serial?: Serial }).serial;
};

const BAUD_RATE = 115200;

export default function SerialPage() {
    const [isSupported, setIsSupported] = useState<boolean | null>(null);
    const [ports, setPorts] = useState<SerialPortWithInfo[]>([]);
    const [activePort, setActivePort] = useState<SerialPortWithInfo | null>(null);
    const [log, setLog] = useState<string[]>([]);
    const [isConnecting, setIsConnecting] = useState(false);
    const readerRef = useRef<ReadableStreamDefaultReader<Uint8Array> | null>(null);

    const appendLog = useCallback((entry: string) => {
        setLog((prev) => {
            const next = [...prev, `${new Date().toLocaleTimeString()} ${entry}`];
            return next.slice(-200);
        });
    }, []);

    const refreshPorts = useCallback(async () => {
            const serial = getWebSerial();
            if (!serial) {
            return;
        }

        try {
                const available = (await serial.getPorts()) as SerialPortWithInfo[];
            setPorts(available);
        } catch (error) {
            appendLog(`Failed to query ports: ${(error as Error).message}`);
        }
    }, [appendLog]);

    const disconnect = useCallback(async () => {
        if (!activePort) {
            return;
        }

        try {
            const reader = readerRef.current;
            if (reader) {
                readerRef.current = null;
                await reader.cancel().catch(() => undefined);
            }

            await activePort.close();
            appendLog("Port closed.");
        } catch (error) {
            appendLog(`Close failed: ${(error as Error).message}`);
        } finally {
            setActivePort(null);
        }
    }, [activePort, appendLog]);

    useEffect(() => {
            const serial = getWebSerial();

            if (!serial) {
                if (isSupported !== false) {
                    setIsSupported(false);
                    appendLog("Web Serial API not available in this browser.");
                }
            return;
        }

            setIsSupported(true);
            refreshPorts();

        const handleConnect = () => {
            appendLog("Serial device connected.");
            refreshPorts();
        };

        const handleDisconnect = () => {
            appendLog("Serial device disconnected.");
            disconnect();
            refreshPorts();
        };

            serial.addEventListener("connect", handleConnect);
            serial.addEventListener("disconnect", handleDisconnect);

        return () => {
                serial.removeEventListener("connect", handleConnect);
                serial.removeEventListener("disconnect", handleDisconnect);
        };
        }, [appendLog, refreshPorts, disconnect, isSupported]);

    const requestPort = async () => {
            const serial = getWebSerial();
            if (!serial) {
            return;
        }

        try {
                await serial.requestPort();
            appendLog("Port access granted.");
            await refreshPorts();
        } catch (error) {
            appendLog(`Port request cancelled: ${(error as Error).message}`);
        }
    };

    const connect = async (port: SerialPortWithInfo) => {
        if (activePort && activePort !== port) {
            await disconnect();
        }

        setIsConnecting(true);

        try {
            await port.open({ baudRate: BAUD_RATE });
            setActivePort(port);
            appendLog(`Opened port at ${BAUD_RATE} baud.`);

            const reader = port.readable?.getReader();
            if (!reader) {
                appendLog("Port does not provide readable data stream.");
                return;
            }

            readerRef.current = reader;
            const decoder = new TextDecoder();

            const readLoop = async () => {
                try {
                    while (true) {
                        const { value, done } = await reader.read();
                        if (done) {
                            break;
                        }

                        if (value && value.length > 0) {
                            appendLog(`RX: ${decoder.decode(value, { stream: true }).trim()}`);
                        }
                    }
                } catch (error) {
                    appendLog(`Read error: ${(error as Error).message}`);
                } finally {
                    reader.releaseLock();
                    if (readerRef.current === reader) {
                        readerRef.current = null;
                    }
                }
            };

            // Kick off read loop; it runs until cancel/disconnect.
            readLoop();
        } catch (error) {
            appendLog(`Open failed: ${(error as Error).message}`);
            setActivePort(null);
        } finally {
            setIsConnecting(false);
        }
    };

    const write = useCallback(
        async (data: string) => {
            if (!activePort) {
                appendLog("No active port to write to.");
                return;
            }

            try {
                const writer = activePort.writable?.getWriter();
                if (!writer) {
                    appendLog("Port does not provide writable stream.");
                    return;
                }

                const encoder = new TextEncoder();
                await writer.write(encoder.encode(data));
                appendLog(`TX: ${data.trim()}`);
                writer.releaseLock();
            } catch (error) {
                appendLog(`Write failed: ${(error as Error).message}`);
            }
        },
        [activePort, appendLog]
    );

    const helloCommand = useMemo(() => 'print("Hello from Web Serial!")\r\n', []);

    if (isSupported === false) {
        return (
            <div className="space-y-4">
                <h1 className="text-xl font-semibold">Web Serial Demo</h1>
                <p className="text-red-600">This browser does not support the Web Serial API.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <h1 className="text-xl font-semibold">Web Serial Demo</h1>
                <p className="text-sm text-slate-500">
                    Connect to your Raspberry Pi Pico running MicroPython and send a hello command.
                </p>
            </div>

            <div className="flex gap-3">
                <button
                    onClick={requestPort}
                    className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-500"
                >
                    Request Port
                </button>
                <button
                    onClick={refreshPorts}
                    className="rounded border border-slate-300 px-4 py-2 text-slate-700 hover:bg-slate-100"
                >
                    Refresh Ports
                </button>
            </div>

            <div className="space-y-2">
                <h2 className="font-medium">Available Ports</h2>
                {ports.length === 0 ? (
                    <p className="text-sm text-slate-500">No ports authorized yet.</p>
                ) : (
                    <ul className="space-y-2">
                        {ports.map((port, index) => {
                            const info = port.getInfo();
                            const label = [
                                info.usbVendorId ? `VID ${info.usbVendorId.toString(16).toUpperCase()}` : null,
                                info.usbProductId ? `PID ${info.usbProductId.toString(16).toUpperCase()}` : null,
                            ]
                                .filter(Boolean)
                                .join(" : ") || `Port ${index + 1}`;

                            const isActive = activePort === port;

                            return (
                                <li key={index} className="flex flex-wrap items-center gap-2">
                                    <span className="text-sm font-mono">{label}</span>
                                    {!isActive && (
                                        <button
                                            onClick={() => connect(port)}
                                            disabled={isConnecting}
                                            className="rounded bg-green-600 px-3 py-1 text-sm text-white hover:bg-green-500 disabled:opacity-60"
                                        >
                                            {isConnecting ? "Connecting..." : "Connect"}
                                        </button>
                                    )}
                                    {isActive && (
                                        <button
                                            onClick={disconnect}
                                            className="rounded bg-red-600 px-3 py-1 text-sm text-white hover:bg-red-500"
                                        >
                                            Disconnect
                                        </button>
                                    )}
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>

            {activePort && (
                <div className="space-y-3">
                    <h2 className="font-medium">Send</h2>
                    <div className="flex flex-wrap items-center gap-3">
                        <code className="rounded bg-slate-200 px-3 py-1 text-sm text-slate-700">{helloCommand.trim()}</code>
                        <button
                            onClick={() => write(helloCommand)}
                            className="rounded bg-slate-900 px-4 py-2 text-white hover:bg-slate-800"
                        >
                            Send Hello
                        </button>
                    </div>
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