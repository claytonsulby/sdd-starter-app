/**
 * [Prompt]
 * One interface representing data from one sample of a pressure sensor reading
 * from a arduino nano over serial
 */
export interface PressureSensorSample {
  sensorId: string;
  receivedAt: Date;
  pressurePascal: number;
}
