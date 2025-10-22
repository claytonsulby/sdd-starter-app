'use client';

import { SampleFromAllSensorsUseCase } from "@/lib/application-layer/use-cases/sample-from-all-sensors";
import { SampleFromOneSensorsUseCase } from "@/lib/application-layer/use-cases/sample-from-one-sensor";
import { PressureSensorController } from "@/lib/interface-layer/controllers/pressure-sensor-controller";
import { PressureSensorSampleAggregatePresenter } from "@/lib/interface-layer/presenters/pressure-sensor-sample-aggregate.presenter";
import { PressureSensorSamplePresenter } from "@/lib/interface-layer/presenters/pressure-sensor-sample.presenter";
import { PressureSensorRepository } from "@/lib/interface-layer/repository/pressure-sensor-repository";
import {
	SerialArduinoPressureSensorRepository,
	SerialArduinoRepositoryOptions,
} from "@/lib/interface-layer/repository/serial-arduino-pressure-sensor.repository";

/**
 * [Prompt]
 * implement a clean architecture application container in 
 * #file:application-container.ts that is like the commented out code 
 * in #file:example-controller.ts but uses the interfaces in #file:lib 
 */
export interface PressureSensorApplicationContainerOptions<
	SingleSampleViewModel,
	AggregateViewModel,
> {
	samplePresenter: PressureSensorSamplePresenter<SingleSampleViewModel>;
	aggregatePresenter: PressureSensorSampleAggregatePresenter<AggregateViewModel>;
	repository?: PressureSensorRepository;
	repositoryFactory?: () => PressureSensorRepository;
	serialRepositoryOptions?: SerialArduinoRepositoryOptions;
}

export class PressureSensorApplicationContainer<
	SingleSampleViewModel,
	AggregateViewModel,
> {
	private readonly samplePresenter: PressureSensorSamplePresenter<SingleSampleViewModel>;
	private readonly aggregatePresenter: PressureSensorSampleAggregatePresenter<AggregateViewModel>;
	private readonly options: PressureSensorApplicationContainerOptions<
		SingleSampleViewModel,
		AggregateViewModel
	>;

	private repositoryInstance?: PressureSensorRepository;
	private sampleFromOneUseCase?: SampleFromOneSensorsUseCase;
	private sampleFromAllUseCase?: SampleFromAllSensorsUseCase;
	private controllerInstance?: PressureSensorController<
		SingleSampleViewModel,
		AggregateViewModel
	>;

	constructor(
		options: PressureSensorApplicationContainerOptions<
			SingleSampleViewModel,
			AggregateViewModel
		>,
	) {
		this.options = options;
		this.samplePresenter = options.samplePresenter;
		this.aggregatePresenter = options.aggregatePresenter;
	}

	getRepository(): PressureSensorRepository {
		if (!this.repositoryInstance) {
			if (this.options.repository) {
				this.repositoryInstance = this.options.repository;
			} else if (this.options.repositoryFactory) {
				this.repositoryInstance = this.options.repositoryFactory();
			} else {
				this.repositoryInstance = new SerialArduinoPressureSensorRepository(
					this.options.serialRepositoryOptions,
				);
			}
		}
		return this.repositoryInstance;
	}

	getSampleFromOneSensorUseCase(): SampleFromOneSensorsUseCase {
		if (!this.sampleFromOneUseCase) {
			this.sampleFromOneUseCase = new SampleFromOneSensorsUseCase(
				this.getRepository(),
			);
		}
		return this.sampleFromOneUseCase;
	}

	getSampleFromAllSensorsUseCase(): SampleFromAllSensorsUseCase {
		if (!this.sampleFromAllUseCase) {
			this.sampleFromAllUseCase = new SampleFromAllSensorsUseCase(
				this.getRepository(),
			);
		}
		return this.sampleFromAllUseCase;
	}

	getController(): PressureSensorController<
		SingleSampleViewModel,
		AggregateViewModel
	> {
		if (!this.controllerInstance) {
			this.controllerInstance = new PressureSensorController(
				this.getSampleFromOneSensorUseCase(),
				this.getSampleFromAllSensorsUseCase(),
				this.samplePresenter,
				this.aggregatePresenter,
				this.getRepository(),
			);
		}
		return this.controllerInstance;
	}

	reset(): void {
		this.repositoryInstance = undefined;
		this.sampleFromOneUseCase = undefined;
		this.sampleFromAllUseCase = undefined;
		this.controllerInstance = undefined;
	}
}
