'use client'

import { FormEvent, useState } from 'react'

export default function WifiPage() {
    const [endpoint, setEndpoint] = useState('http://localhost:3001/api/status')
    const [isLoading, setIsLoading] = useState(false)
    const [result, setResult] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        setIsLoading(true)
        setResult(null)
        setError(null)

        try {
            const response = await fetch(endpoint, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                },
            })

            if (!response.ok) {
                throw new Error(`Device responded with ${response.status}`)
            }

            const body = await response.json()
            setResult(JSON.stringify(body, null, 2))
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Unknown error'
            setError(message)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <main className="mx-auto flex max-w-xl flex-col gap-6 p-6">
            <section className="space-y-2">
                <h1 className="text-2xl font-semibold">Local Device Hello World</h1>
                <p className="text-sm text-gray-600">
                    Point this page at your microcontroller&apos;s HTTPS endpoint. The device must serve JSON and include
                    CORS plus Private Network Access headers that allow this origin. For quick local testing, the
                    default URL targets this app&apos;s mock endpoint at /api/status.
                </p>
            </section>

            <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
                <label className="flex flex-col gap-1">
                    <span className="text-sm font-medium">Device URL</span>
                    <input
                        className="rounded border border-gray-300 px-3 py-2"
                        type="url"
                        required
                        value={endpoint}
                        onChange={(event) => setEndpoint(event.target.value)}
                        placeholder="https://device.local/status"
                        autoComplete="off"
                    />
                </label>

                <button
                    className="rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
                    type="submit"
                    disabled={isLoading}
                >
                    {isLoading ? 'Contacting device…' : 'Fetch device status'}
                </button>
            </form>

            <section className="space-y-2">
                <h2 className="text-lg font-semibold">Response</h2>
                {result && (
                    <pre className="overflow-x-auto rounded border border-green-200 bg-green-50 p-4 text-sm text-green-900">
                        {result}
                    </pre>
                )}
                {error && (
                    <p className="rounded border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</p>
                )}
                {!result && !error && !isLoading && (
                    <p className="text-sm text-gray-500">Submit the form to see the device response.</p>
                )}
            </section>
        </main>
    )
}