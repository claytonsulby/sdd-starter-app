import { PressureSensorSampleAggregate } from "@/lib/domain-layer/aggregates/pressure-sensor-sample-aggregate";

export interface PressureSensorSampleAggregatePresenter<ViewModel> {
	present(aggregate: PressureSensorSampleAggregate): Promise<ViewModel>;
}
