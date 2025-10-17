'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { bluetooth } from 'webbluetooth/dist/browser'

type ScannedDevice = {
    key: string
    name: string
    id?: string
    rssi?: number
    txPower?: number
    manufacturerData?: string[]
    serviceData?: string[]
    lastSeen: number
}

type ExtendedBluetooth = Bluetooth & {
    requestLEScan?: (options?: BluetoothLEScanOptions) => Promise<BluetoothLEScan>
}

const hexFromDataView = (view: DataView) => {
    const parts: string[] = []
    for (let i = 0; i < view.byteLength; i += 1) {
        parts.push(view.getUint8(i).toString(16).padStart(2, '0'))
    }
    return parts.join(' ')
}

const BluetoothPage = () => {
    const [availability, setAvailability] = useState<boolean | null>(null)
    const [devices, setDevices] = useState<ScannedDevice[]>([])
    const [error, setError] = useState<string | null>(null)
    const [isScanning, setIsScanning] = useState(false)
    const [isStarting, setIsStarting] = useState(false)
    const [isStopping, setIsStopping] = useState(false)
    const [pickerOpen, setPickerOpen] = useState(false)
    const scanRef = useRef<BluetoothLEScan | null>(null)
    const deviceKeys = useRef(new WeakMap<BluetoothDevice, string>())
    const watchedDevices = useRef(new Set<BluetoothDevice>())
    const watchAbortControllers = useRef(new Map<string, AbortController>())
    const stopRequestedRef = useRef(false)
    const pendingScanTokenRef = useRef<symbol | null>(null)

    const extendedBluetooth = useMemo(() => bluetooth as ExtendedBluetooth, [])
    const [supportsScanning, setSupportsScanning] = useState<boolean | null>(null)

    useEffect(() => {
        setSupportsScanning(typeof extendedBluetooth?.requestLEScan === 'function')
    }, [extendedBluetooth])

    useEffect(() => {
        let cancelled = false
        if (!extendedBluetooth || !extendedBluetooth.getAvailability) {
            setAvailability(false)
            return
        }
        extendedBluetooth
            .getAvailability()
            .then(value => {
                if (!cancelled) setAvailability(value)
            })
            .catch(() => {
                if (!cancelled) setAvailability(false)
            })

        return () => {
            cancelled = true
        }
    }, [extendedBluetooth])

    const ensureDeviceKey = useCallback((device: BluetoothDevice) => {
        const known = deviceKeys.current.get(device)
        if (known) return known
        const generated =
            device.id?.trim() ||
            device.name?.trim() ||
            (typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`)
        deviceKeys.current.set(device, generated)
        return generated
    }, [])

    const applyDeviceUpdate = useCallback(
        (device: BluetoothDevice, update: Partial<Omit<ScannedDevice, 'key'>> = {}) => {
            const deviceKey = ensureDeviceKey(device)
            setDevices(prev => {
                const next = new Map(prev.map(item => [item.key, item]))
                const existing = next.get(deviceKey)
                next.set(deviceKey, {
                    key: deviceKey,
                    name: update.name ?? device.name ?? existing?.name ?? 'Unnamed device',
                    id: update.id ?? device.id ?? existing?.id,
                    rssi: update.rssi ?? existing?.rssi,
                    txPower: update.txPower ?? existing?.txPower,
                    manufacturerData: update.manufacturerData ?? existing?.manufacturerData,
                    serviceData: update.serviceData ?? existing?.serviceData,
                    lastSeen: update.lastSeen ?? Date.now(),
                })
                return Array.from(next.values()).sort((a, b) => b.lastSeen - a.lastSeen)
            })
            return deviceKey
        },
        [ensureDeviceKey]
    )

    const handleAdvertisement = useCallback(
        (event: Event) => {
            const adv = event as BluetoothAdvertisingEvent
            const manufacturerData = adv.manufacturerData
                ? Array.from(adv.manufacturerData.entries()).map(([key, view]) => `0x${key.toString(16)}: ${hexFromDataView(view)}`)
                : undefined
            const serviceData = adv.serviceData
                ? Array.from(adv.serviceData.entries()).map(([key, view]) => `${key}: ${hexFromDataView(view)}`)
                : undefined

            applyDeviceUpdate(adv.device, {
                rssi: adv.rssi ?? undefined,
                txPower: adv.txPower ?? undefined,
                manufacturerData,
                serviceData,
                lastSeen: Date.now(),
            })
        },
        [applyDeviceUpdate]
    )

    useEffect(() => {
        const listener = handleAdvertisement as EventListener
        extendedBluetooth.addEventListener('advertisementreceived', listener)

        return () => {
            extendedBluetooth.removeEventListener('advertisementreceived', listener)
        }
    }, [extendedBluetooth, handleAdvertisement])

    const stopActiveScan = useCallback(
        (silent = false) => {
            pendingScanTokenRef.current = null
            const activeScan = scanRef.current
            if (!activeScan) return false
            try {
                activeScan.stop()
            } catch (err) {
                if (!silent) {
                    const message = err instanceof Error ? err.message : 'Unable to stop scanning.'
                    setError(message)
                }
                return false
            } finally {
                scanRef.current = null
            }
            return true
        },
        [setError]
    )

    useEffect(() => {
        const devicesRef = watchedDevices.current
        const controllersRef = watchAbortControllers.current

        return () => {
            stopRequestedRef.current = true
            stopActiveScan(true)
            devicesRef.forEach(device => {
                device.removeEventListener('advertisementreceived', handleAdvertisement as EventListener)
            })
            devicesRef.clear()
            controllersRef.forEach(controller => controller.abort())
            controllersRef.clear()
        }
    }, [handleAdvertisement, stopActiveScan])

    useEffect(() => {
        let cancelled = false
        if (!extendedBluetooth?.getDevices) return

        extendedBluetooth
            .getDevices()
            .then(grantedDevices => {
                if (cancelled) return
                grantedDevices.forEach(device => {
                    applyDeviceUpdate(device, { lastSeen: Date.now() })
                })
            })
            .catch(() => undefined)

        return () => {
            cancelled = true
        }
    }, [applyDeviceUpdate, extendedBluetooth])

    const stopScan = useCallback(() => {
        if (isStopping) return
        stopRequestedRef.current = true
        pendingScanTokenRef.current = null
        setIsStopping(true)
        try {
            stopActiveScan()
        } finally {
            setIsScanning(false)
            setIsStarting(false)
            setIsStopping(false)
        }
    }, [isStopping, stopActiveScan])

    const startScan = useCallback(async () => {
        if (supportsScanning !== true) {
            setError(
                'This browser exposes Web Bluetooth but not the experimental scanning API (navigator.bluetooth.requestLEScan). In Chrome, enable Experimental Web Platform features at chrome://flags and restart the browser.'
            )
            return
        }
        if (isStarting) return
        stopRequestedRef.current = false
        setIsStarting(true)
        setError(null)
        stopActiveScan(true)
        setIsScanning(false)
        const token = Symbol('ble-scan')
        pendingScanTokenRef.current = token
        try {
            const scan = await extendedBluetooth.requestLEScan({
                acceptAllAdvertisements: true,
                keepRepeatedDevices: true,
            })
            if (pendingScanTokenRef.current !== token || stopRequestedRef.current) {
                try {
                    scan.stop()
                } catch (innerErr) {
                    console.warn('Unable to stop cancelled Bluetooth scan', innerErr)
                }
                return
            }
            scanRef.current = scan
            setDevices([])
            setIsScanning(scan?.active ?? true)
        } catch (err) {
            if (!stopRequestedRef.current) {
                const message = err instanceof Error ? err.message : 'Unable to start scanning.'
                setError(message)
            }
            setIsScanning(false)
        } finally {
            if (pendingScanTokenRef.current === token) {
                pendingScanTokenRef.current = null
            }
            setIsStarting(false)
        }
    }, [extendedBluetooth, isStarting, stopActiveScan, supportsScanning])

    const openDevicePicker = useCallback(async () => {
        if (!extendedBluetooth?.requestDevice) {
            setError('navigator.bluetooth.requestDevice is not available in this context.')
            return
        }
        try {
            const wasScanning = isScanning || Boolean(scanRef.current)
            if (wasScanning) {
                stopRequestedRef.current = true
                pendingScanTokenRef.current = null
                stopActiveScan(true)
                setIsScanning(false)
            }
            setPickerOpen(true)
            setError(null)
            const device = await extendedBluetooth.requestDevice({ acceptAllDevices: true })
            const key = applyDeviceUpdate(device, { lastSeen: Date.now() })

            if (typeof device.watchAdvertisements === 'function') {
                const previous = watchAbortControllers.current.get(key)
                if (previous) previous.abort()

                const controller = new AbortController()
                watchAbortControllers.current.set(key, controller)

                if (watchedDevices.current.has(device)) {
                    device.removeEventListener('advertisementreceived', handleAdvertisement as EventListener)
                }
                watchedDevices.current.add(device)
                device.addEventListener('advertisementreceived', handleAdvertisement as EventListener)
                device.watchAdvertisements({ signal: controller.signal }).catch(() => {
                    controller.abort()
                    watchAbortControllers.current.delete(key)
                })
            }
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Bluetooth device request was cancelled.'
            setError(message)
        } finally {
            setPickerOpen(false)
        }
    }, [applyDeviceUpdate, extendedBluetooth, handleAdvertisement, isScanning, stopActiveScan])

    return (
        <main style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '2rem', maxWidth: '48rem', margin: '0 auto' }}>
            <section style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: 600 }}>Bluetooth Scanner</h1>
                <p>
                    Start a scan to discover nearby Bluetooth Low Energy devices. Scanning requires a compatible browser,
                    typically Chrome with experimental Web Bluetooth features enabled.
                </p>
                <p>
                    Only Bluetooth Low Energy advertisements are detectable without pairing. Audio accessories like AirPods
                    usually appear only while they are in pairing mode.
                </p>
                {supportsScanning === false && (
                    <p style={{ color: '#b45309' }}>
                        Tip: Chrome hides passive scanning behind the Experimental Web Platform features flag. Visit
                        <span> </span>
                        <code>chrome://flags/#enable-experimental-web-platform-features</code>, enable it, then restart
                        Chrome.
                    </p>
                )}
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <button
                        type="button"
                        onClick={startScan}
                        disabled={isStarting || isScanning || supportsScanning !== true}
                        style={{ padding: '0.5rem 1rem', borderRadius: '0.5rem', border: '1px solid #1d4ed8', background: isScanning || isStarting ? '#bfdbfe' : '#2563eb', color: '#fff', cursor: isStarting || isScanning || supportsScanning !== true ? 'not-allowed' : 'pointer' }}
                    >
                        {isStarting ? 'Starting…' : isScanning ? 'Scanning…' : 'Start scan'}
                    </button>
                    <button
                        type="button"
                        onClick={stopScan}
                        disabled={!isScanning && !isStarting && !isStopping}
                        style={{ padding: '0.5rem 1rem', borderRadius: '0.5rem', border: '1px solid #6b7280', background: '#f3f4f6', color: '#111827', cursor: !isScanning && !isStarting && !isStopping ? 'not-allowed' : 'pointer' }}
                    >
                        {isStopping ? 'Stopping…' : isStarting && !isScanning ? 'Cancel start' : 'Stop scan'}
                    </button>
                    <button
                        type="button"
                        onClick={openDevicePicker}
                        disabled={pickerOpen}
                        style={{ padding: '0.5rem 1rem', borderRadius: '0.5rem', border: '1px solid #047857', background: pickerOpen ? '#6ee7b7' : '#10b981', color: '#064e3b', cursor: pickerOpen ? 'not-allowed' : 'pointer' }}
                    >
                        {pickerOpen ? 'Opening…' : 'Open device picker'}
                    </button>
                </div>
                {availability === false && (
                    <p style={{ color: '#b91c1c' }}>Web Bluetooth is unavailable on this device or browser.</p>
                )}
                {error && <p style={{ color: '#b91c1c' }}>{error}</p>}
            </section>
            <section style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Discovered devices</h2>
                {devices.length === 0 ? (
                    <p>No devices discovered yet. Ensure you have a Bluetooth Low Energy device advertising nearby or use the device picker above to connect to a specific device.</p>
                ) : (
                    <ul style={{ display: 'flex', flexDirection: 'column', gap: '1rem', listStyle: 'none', padding: 0, margin: 0 }}>
                        {devices.map(device => (
                            <li key={device.key} style={{ border: '1px solid #e5e7eb', borderRadius: '0.75rem', padding: '1rem' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                                    <strong style={{ fontSize: '1.1rem' }}>{device.name}</strong>
                                    {device.id && <span>ID: {device.id}</span>}
                                    <span>Last seen: {new Date(device.lastSeen).toLocaleTimeString()}</span>
                                    {(device.rssi ?? device.txPower) !== undefined && (
                                        <span>
                                            {device.rssi !== undefined && `RSSI: ${device.rssi} dBm`}
                                            {device.rssi !== undefined && device.txPower !== undefined && ' · '}
                                            {device.txPower !== undefined && `TX power: ${device.txPower} dBm`}
                                        </span>
                                    )}
                                    {device.manufacturerData && device.manufacturerData.length > 0 && (
                                        <span>Manufacturer data: {device.manufacturerData.join(', ')}</span>
                                    )}
                                    {device.serviceData && device.serviceData.length > 0 && (
                                        <span>Service data: {device.serviceData.join(', ')}</span>
                                    )}
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </section>
        </main>
    )
}

export default BluetoothPage