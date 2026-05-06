export type AttackType =
  | 'DDoS'
  | 'brute-force'
  | 'port-scan'
  | 'botnet'
  | 'malware'
  | 'normal';

export type Severity = 'Low' | 'Medium' | 'High' | 'Critical';

export interface ThreatEvent {
  event_id: string;
  timestamp: string;
  source_node_id: string;
  target_node_id: string;
  protocol: string;
  bytes: number;
  is_malicious: boolean;
  attack_type: AttackType;
  anomaly_score: number;
  risk_score: number;
  severity: Severity;
}
