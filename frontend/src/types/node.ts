export type NodeState = 'healthy' | 'suspicious' | 'compromised';

export type NodeRole =
  | 'api-gateway'
  | 'web-server'
  | 'database'
  | 'firewall'
  | 'iot-device'
  | 'dns-server'
  | 'mail-server';

export interface NetworkNode {
  node_id: string;
  ip_address: string;
  role: NodeRole;
  location: string;
  state: NodeState;
  last_seen: string;
  tags: string[];
  current_risk_score: number;
}
