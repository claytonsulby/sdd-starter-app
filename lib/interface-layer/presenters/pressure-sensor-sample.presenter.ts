import { PressureSensorSample } from "@/lib/domain-layer/entities/pressure-sensor-sample";

export interface PressureSensorSamplePresenter<ViewModel> {
	present(sample: PressureSensorSample): Promise<ViewModel>;
}
