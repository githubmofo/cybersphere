import type { AttackType, Severity } from './event';

export interface MLPrediction {
  anomaly_score: number;
  predicted_class: AttackType;
  confidence: number;
  risk_score: number;
  severity: Severity;
  class_probabilities: Record<AttackType, number>;
}

export interface ModelMetadata {
  model_name: string;
  version: string;
  trained_on: string;
  accuracy: number;
  last_updated: string;
}
