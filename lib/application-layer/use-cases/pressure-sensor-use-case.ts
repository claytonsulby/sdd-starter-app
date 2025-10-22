export interface PressureSensorSampleUseCase<Input, Output> {
	execute(input: Input): Promise<Output>;
}