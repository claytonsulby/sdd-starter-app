import { PressureSensorSample } from "@/lib/domain-layer/entities/pressure-sensor-sample";
import { PressureSensorRepository } from "@/lib/interface-layer/repository/pressure-sensor-repository";
import { PressureSensorSampleUseCase } from "./pressure-sensor-use-case";

/**
 * [Prompt]
 * implement #file:sample-from-all-sensors.ts and #file:sample-from-one-sensor.ts use cases
*/
export class SampleFromOneSensorsUseCase implements PressureSensorSampleUseCase<void, PressureSensorSample> {
    constructor(
        private pressureSensorRepository: PressureSensorRepository
    ) {}
    async execute(): Promise<PressureSensorSample> {
        if (!this.pressureSensorRepository.isConnected()) {
            await this.pressureSensorRepository.connect();
        }

        return this.pressureSensorRepository.readSample();
    }
}