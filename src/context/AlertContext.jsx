import React, { createContext, useContext, useReducer, useEffect, useRef, useState } from 'react';

const AlertContext = createContext();

const WS_URL = 'ws://localhost:8000/ws/alerts';

const initialState = {
  alerts: [],
  simulationActive: false,
  simulationAccount: null,
  refreshGraphTrigger: 0,
  lastSimulationSummary: null,
};

function alertReducer(state, action) {
  switch (action.type) {
    case 'ADD_ALERT':
      return {
        ...state,
        alerts: [action.payload, ...state.alerts],
      };
    case 'START_SIMULATION':
      return {
        ...state,
        simulationActive: true,
        simulationAccount: action.payload.account_id,
        lastSimulationSummary: null,
      };
    case 'TRIGGER_GRAPH_REFRESH':
      return {
        ...state,
        refreshGraphTrigger: Date.now(),
      };
    case 'SIMULATION_DONE':
      return {
        ...state,
        simulationActive: false,
        lastSimulationSummary: action.payload.summary,
      };
    default:
      return state;
  }
}

export function AlertProvider({ children }) {
  const [state, dispatch] = useReducer(alertReducer, initialState);
  const [wsConnected, setWsConnected] = useState(false);
  const wsRef = useRef(null);

  useEffect(() => {
    let socket;
    const connect = () => {
      socket = new WebSocket(WS_URL);
      
      socket.onopen = () => {
        console.log('CyberFusion WebSocket connected');
        setWsConnected(true);
      };

      socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        console.log('[WS Message]', data);
        
        switch(data.event) {
          case 'NEW_ALERT':
          case 'LOGIN_ANOMALY':
          case 'ACCOUNT_COMPROMISED':
          case 'SUSPICIOUS_TRANSACTION':
            dispatch({ type: 'ADD_ALERT', payload: {
              id: Date.now(),
              type: data.type,
              severity: data.severity,
              account: data.account_id,
              msg: data.description,
              time: 'Just now',
              simulation: data.simulation || false
            }});
            if (data.event === 'NEW_ALERT' && data.simulation) {
              dispatch({ type: 'START_SIMULATION', payload: { account_id: data.account_id } });
            }
            break;
          
          case 'KILL_CHAIN_UPDATE':
            dispatch({ type: 'TRIGGER_GRAPH_REFRESH' });
            break;
          
          case 'SIMULATION_COMPLETE':
            dispatch({ type: 'SIMULATION_DONE', payload: data });
            break;
          default:
            break;
        }
      };

      socket.onclose = () => {
        setWsConnected(false);
        // Attempt reconnect after 5s
        setTimeout(connect, 5000);
      };

      socket.onerror = () => {
        setWsConnected(false);
      };

      wsRef.current = socket;
    };

    connect();
    return () => socket && socket.close();
  }, []);

  return (
    <AlertContext.Provider value={{ ...state, wsConnected, dispatch }}>
      {children}
    </AlertContext.Provider>
  );
}

export const useAlerts = () => useContext(AlertContext);
