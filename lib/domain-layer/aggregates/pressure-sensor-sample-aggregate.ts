import { PressureSensorSample } from "../entities/pressure-sensor-sample";

/**
 * [Prompt]
 * an aggregate type of multiple sensor readings from multiple sensors
 */
export interface SensorDataStream {
	sensorId: string;
	readings: PressureSensorSample[];
}

export interface PressureSensorSampleAggregate {
	aggregateId: string;
	sampleFrequencyHz: number;
	sensors: SensorDataStream[];
}