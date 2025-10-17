"use client";

import { useEffect, useRef } from "react";
import type { Layout, PlotData } from "plotly.js";

type Vector3 = [number, number, number];
type Matrix3 = [Vector3, Vector3, Vector3];

const BASE_COVARIANCE: Matrix3 = [
    [1, 0.5, 0.5],
    [0.5, 1, 0.5],
    [0.5, 0.5, 1],
];

const HALF_COVARIANCE: Matrix3 = BASE_COVARIANCE.map((row) =>
    row.map((value) => value * 0.5)
) as Matrix3;

const randomNormal = (): number => {
    const u1 = Math.random();
    const u2 = Math.random();
    const radius = Math.sqrt(-2 * Math.log(u1));
    const angle = 2 * Math.PI * u2;
    return radius * Math.cos(angle);
};

const cholesky = (matrix: Matrix3): Matrix3 => {
    const result: Matrix3 = [
        [0, 0, 0],
        [0, 0, 0],
        [0, 0, 0],
    ];

    for (let i = 0; i < 3; i += 1) {
        for (let j = 0; j <= i; j += 1) {
            let sum = 0;
            for (let k = 0; k < j; k += 1) {
                sum += result[i][k] * result[j][k];
            }

            if (i === j) {
                result[i][j] = Math.sqrt(Math.max(matrix[i][i] - sum, 0));
            } else {
                const denominator = result[j][j] || 1;
                result[i][j] = (matrix[i][j] - sum) / denominator;
            }
        }
    }

    return result;
};

const multiply = (matrix: Matrix3, vector: Vector3): Vector3 => {
    return matrix.map((row) =>
        row.reduce((acc, value, index) => acc + value * vector[index], 0)
    ) as Vector3;
};

const sampleMultivariateNormal = (
    mean: Vector3,
    covariance: Matrix3,
    count: number
): Vector3[] => {
    const transform = cholesky(covariance);
    const samples: Vector3[] = [];

    for (let i = 0; i < count; i += 1) {
        const z: Vector3 = [randomNormal(), randomNormal(), randomNormal()];
        const delta = multiply(transform, z);
        samples.push([
            mean[0] + delta[0],
            mean[1] + delta[1],
            mean[2] + delta[2],
        ]);
    }

    return samples;
};

const buildTrace = (points: Vector3[]): Partial<PlotData> => {
    const x = points.map((point) => point[0]);
    const y = points.map((point) => point[1]);
    const z = points.map((point) => point[2]);

    return {
        type: "scatter3d",
        mode: "markers",
        x,
        y,
        z,
    } satisfies Partial<PlotData>;
};

const loadPlotly = async (): Promise<typeof import("plotly.js")> => {
    const plotlyModule = await import("plotly.js-dist-min");
    const candidate = plotlyModule as unknown as {
        default?: typeof import("plotly.js");
    };
    return candidate.default ?? (plotlyModule as unknown as typeof import("plotly.js"));
};

const PlotlyPage = () => {
    const plotContainerRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        let isMounted = true;
        let plotlyInstance: typeof import("plotly.js") | null = null;

        const renderPlot = async () => {
            plotlyInstance = await loadPlotly();

            if (!isMounted || !plotContainerRef.current || !plotlyInstance) {
                return;
            }

            const trace1: Partial<PlotData> = {
                ...buildTrace(sampleMultivariateNormal([0, 0, 0], BASE_COVARIANCE, 200)),
                opacity: 0.8,
                marker: {
                    size: 12,
                    line: {
                        width: 0.5,
                        color: "rgba(217, 217, 217, 0.14)",
                    },
                },
            };

            const trace2: Partial<PlotData> = {
                ...buildTrace(sampleMultivariateNormal([0, 0, 0], HALF_COVARIANCE, 100)),
                opacity: 0.9,
                marker: {
                    color: "rgb(127, 127, 127)",
                    symbol: "circle",
                    line: {
                        width: 1,
                        color: "rgb(204, 204, 204)",
                    },
                },
            };

            const layout: Partial<Layout> = {
                margin: { l: 0, r: 0, t: 0, b: 0 },
                scene: {
                    xaxis: { title: { text: "X" } },
                    yaxis: { title: { text: "Y" } },
                    zaxis: { title: { text: "Z" } },
                },
            } satisfies Partial<Layout>;

            await plotlyInstance.newPlot(plotContainerRef.current, [trace1, trace2], layout, {
                responsive: true,
            });
        };

        renderPlot();

        return () => {
            isMounted = false;
            if (plotContainerRef.current && plotlyInstance) {
                plotlyInstance.purge(plotContainerRef.current as HTMLDivElement);
            }
        };
    }, []);

    return (
        <main className="mx-auto flex min-h-screen max-w-5xl flex-col gap-6 p-6">
            <section>
                <h1 className="text-2xl font-semibold">3D Scatter Demo (Plotly.js)</h1>
                <p className="mt-2 text-sm text-neutral-600">
                    Two multivariate normal samples rendered in 3D. Refresh the page to regenerate the
                    distributions.
                </p>
                <p className="mt-2 text-sm text-blue-600">
                    <a
                        href="https://juliaplots.org/PlotlyJS.jl/stable/examples/3d/"
                        target="_blank"
                        rel="noreferrer noopener"
                        className="underline"
                    >
                        Reference: PlotlyJS.jl 3D examples
                    </a>
                </p>
            </section>

            <div ref={plotContainerRef} className="h-[600px] w-full" />
        </main>
    );
};

export default PlotlyPage;