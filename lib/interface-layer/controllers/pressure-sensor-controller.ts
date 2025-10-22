import { PressureSensorSampleUseCase } from "@/lib/application-layer/use-cases/pressure-sensor-use-case";
import { PressureSensorSampleAggregate } from "@/lib/domain-layer/aggregates/pressure-sensor-sample-aggregate";
import { PressureSensorSample } from "@/lib/domain-layer/entities/pressure-sensor-sample";
import { PressureSensorRepository } from "@/lib/interface-layer/repository/pressure-sensor-repository";
import { PressureSensorSampleAggregatePresenter } from "@/lib/interface-layer/presenters/pressure-sensor-sample-aggregate.presenter";
import { PressureSensorSamplePresenter } from "@/lib/interface-layer/presenters/pressure-sensor-sample.presenter";

/**
 * [Prompt]
 * implement #file:pressure-sensor-controller.ts that is like the commented 
 * out code in #file:example-controller.ts but uses the interfaces in #file:lib 
 */
export class PressureSensorController<
	SingleSampleViewModel,
	AggregateViewModel
> {
	constructor(
		private readonly sampleFromOneSensor: PressureSensorSampleUseCase<
			void,
			PressureSensorSample
		>,
		private readonly sampleFromAllSensors: PressureSensorSampleUseCase<
			void,
			PressureSensorSampleAggregate
		>,
		private readonly samplePresenter: PressureSensorSamplePresenter<SingleSampleViewModel>,
		private readonly aggregatePresenter: PressureSensorSampleAggregatePresenter<AggregateViewModel>,
		private readonly repository: PressureSensorRepository,
	) {}

	async sampleSingleSensor(): Promise<SingleSampleViewModel> {
		const sample = await this.sampleFromOneSensor.execute(undefined);
		return this.samplePresenter.present(sample);
	}

	async sampleAllSensors(): Promise<AggregateViewModel> {
		const aggregate = await this.sampleFromAllSensors.execute(undefined);
		return this.aggregatePresenter.present(aggregate);
	}

	async ensureConnected(): Promise<void> {
		if (!this.repository.isConnected()) {
			await this.repository.connect();
		}
	}

	async disconnect(): Promise<void> {
		await this.repository.disconnect();
	}

	subscribeToSamples(
		handler: (viewModel: SingleSampleViewModel) => void,
		onError?: (error: unknown) => void,
	): () => void {
		return this.repository.onSample((sample) => {
			void this.samplePresenter
				.present(sample)
				.then(handler)
				.catch((error) => {
					onError?.(error);
				});
		});
	}
}
