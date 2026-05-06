import { useEffect, useRef, useCallback } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { useVisualizerStore } from '@/store/useVisualizerStore';
import type { ThreatEvent, NetworkNode, NodeState } from '@/types';

interface WebSocketMessage {
  type: 'event' | 'node_update' | 'simulation_status';
  data: ThreatEvent | Partial<NetworkNode> & { node_id: string } | { active: boolean; scenario: string };
}

const MAX_RECONNECT_DELAY = 30000;
const BASE_RECONNECT_DELAY = 1000;

/**
 * WebSocket hook with auto-reconnect and exponential backoff.
 * Stub implementation — will connect to backend in Wave 4.
 */
export function useWebSocket(url: string) {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectAttempts = useRef(0);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const setConnectionStatus = useAppStore((s) => s.setConnectionStatus);
  const addEvent = useAppStore((s) => s.addEvent);
  const updateNode = useAppStore((s) => s.updateNode);
  const connectRef = useRef<() => void>(() => {});

  const connect = useCallback(() => {
    if (!url) return;

    try {
      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => {
        setConnectionStatus('connected');
        reconnectAttempts.current = 0;
      };

      ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);

          switch (message.type) {
            case 'event': {
              const eventData = message.data as ThreatEvent;
              addEvent(eventData);

              // Update node risk state in the 3D visualizer
              if (eventData.is_malicious) {
                let newState: NodeState = 'healthy';
                if (eventData.risk_score >= 80) newState = 'compromised';
                else if (eventData.risk_score >= 40) newState = 'suspicious';
                
                useVisualizerStore.getState().updateNodeState(
                  eventData.target_node_id,
                  newState,
                  eventData.risk_score
                );
              }
              break;
            }
            case 'node_update': {
              const nodeData = message.data as Partial<NetworkNode> & { node_id: string };
              updateNode(nodeData.node_id, nodeData);
              break;
            }
            default:
              break;
          }
        } catch (err) {
          console.error('[WS] Failed to parse message:', err);
        }
      };

      ws.onclose = () => {
        setConnectionStatus('reconnecting');
        const delay = Math.min(
          BASE_RECONNECT_DELAY * Math.pow(2, reconnectAttempts.current),
          MAX_RECONNECT_DELAY
        );
        reconnectAttempts.current += 1;

        reconnectTimer.current = setTimeout(() => {
          connectRef.current();
        }, delay);
      };

      ws.onerror = () => {
        ws.close();
      };
    } catch (err) {
      console.error('[WS] Connection failed:', err);
      setConnectionStatus('disconnected');
    }
  }, [url, setConnectionStatus, addEvent, updateNode]);

  useEffect(() => {
    connectRef.current = connect;
  }, [connect]);

  const disconnect = useCallback(() => {
    if (reconnectTimer.current) {
      clearTimeout(reconnectTimer.current);
    }
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setConnectionStatus('disconnected');
  }, [setConnectionStatus]);

  useEffect(() => {
    // Don't auto-connect in Wave 1 — backend not ready yet
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return { connect, disconnect, ws: wsRef };
}
