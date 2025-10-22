import { PressureSensorSampleAggregate } from "@/lib/domain-layer/aggregates/pressure-sensor-sample-aggregate";
import { PressureSensorRepository } from "@/lib/interface-layer/repository/pressure-sensor-repository";
import { PressureSensorSampleUseCase } from "./pressure-sensor-use-case";
import { sensorSampleFrequency } from "@/lib/domain-layer/value-objects/sensor-sample-frequency";

/**
 * [Prompt]
 * implement #file:sample-from-all-sensors.ts and #file:sample-from-one-sensor.ts use cases
*/
export class SampleFromAllSensorsUseCase implements PressureSensorSampleUseCase<void, PressureSensorSampleAggregate> {
    constructor(
        private pressureSensorRepository: PressureSensorRepository
    ) {}
    async execute(): Promise<PressureSensorSampleAggregate> {
        if (!this.pressureSensorRepository.isConnected()) {
            await this.pressureSensorRepository.connect();
        }

        const sample = await this.pressureSensorRepository.readSample();

        const aggregateId =
            typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
                ? crypto.randomUUID()
                : `aggregate-${Date.now()}`;

        return {
            aggregateId,
            sampleFrequencyHz: sensorSampleFrequency,
            sensors: [
                {
                    sensorId: sample.sensorId,
                    readings: [sample],
                },
            ],
        };
    }
}