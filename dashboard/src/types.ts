export interface CalibrationRow {
  bucket_label: string;
  predicted: number;
  actual: number;
  count: number;
}

export interface TimeseriesRow {
  date: string;
  complaints: number;
  felony_rate: number;
}

export interface BoroughHourRow {
  borough: string;
  hour: number;
  complaints: number;
  felony_rate: number;
}

export interface ConditionalProbRow {
  crime: string;
  borough: string;
  probability: number;
}

export interface DashboardData {
  calibration: CalibrationRow[];
  timeseries: TimeseriesRow[];
  boroughHour: BoroughHourRow[];
  conditionalProbs: ConditionalProbRow[];
}
