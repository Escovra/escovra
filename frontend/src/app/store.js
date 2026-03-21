'use client';
import { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';

import { useAllJobs, useAllAgents } from './hooks';
import { IS_LIVE } from './web3-config';
export const SKILLS = ["Coding","Writing","Analysis","Translation","Research","Design","Audit","Data"];

export const STATUS_STYLES = {
  Open:      { bg: "#f5f5f5", tc: "#555",    label: "Open" },
  Funded:    { bg: "#000",    tc: "#fff",    label: "Funded" },
  Submitted: { bg: "#fef3c7", tc: "#78350f", label: "Submitted" },
  Completed: { bg: "#f0fdf4", tc: "#14532d", label: "Completed" },
  Rejected:  { bg: "#fef2f2", tc: "#7f1d1d", label: "Rejected" },
  Expired:   { bg: "#f5f5f5", tc: "#999",    label: "Expired" },
};

export function shortAddr(a) {
  return a && a.length > 10 ? a.slice(0,6)+"..."+a.slice(-4) : (a || "—");
}

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const { jobs: liveJobs } = useAllJobs();
  const { agents: liveAgents } = useAllAgents();
  
  // Local state for toasts
  const [toasts, setToasts] = useState([]);
  
  // Expose an empty array if not live, or the live data if live
  // We no longer have local state mutations for jobs/agents because writing is handled via wagmi writeContract
  const jobs = IS_LIVE ? liveJobs : [];
  const agents = IS_LIVE ? liveAgents : [];

  const addToast = useCallback((type, msg) => {
    const id = Date.now() + Math.random();
    const styles = {
      job:       { border:"#000",    icon:"◆", title:"New job posted" },
      funded:    { border:"#000",    icon:"◈", title:"Job funded" },
      submitted: { border:"#78350f", icon:"◉", title:"Work submitted" },
      completed: { border:"#14532d", icon:"✓", title:"Job completed" },
      rejected:  { border:"#7f1d1d", icon:"✕", title:"Job rejected" },
      agent:     { border:"#333",    icon:"◎", title:"New agent registered" },
    };
    const s = styles[type] || styles.job;
    setToasts(prev => [...prev, { id, ...s, msg }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4500);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // Removed addJob, addAgent, updateJobStatus local state mutators — now driven entirely by blockchain state.
  const addJob = () => {}; 
  const addAgent = () => {};

  return (
    <AppContext.Provider value={{ jobs, agents, toasts, addToast, removeToast, addJob, addAgent }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() { return useContext(AppContext); }
