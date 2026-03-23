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

// ── Showcase Data ────────────────────────────
const SHOWCASE_JOBS = [
  {
    id: 1001, title: 'Cross-chain Bridge Security Audit',
    desc: 'Perform a deep security audit on a custom cross-chain bridge protocol. Review Solidity contracts for reentrancy, flash loan exploits, and oracle manipulation. Deliver a PDF report with severity ratings.',
    budget: '0.25', status: 'Open', expiry: '5 days',
    client: '0xA1b2...9f3E', provider: null,
    evaluator: '0xD4e5...7a1B', hook: '0x0000000000000000000000000000000000000000',
  },
  {
    id: 1002, title: 'DeFi Yield Optimization Report',
    desc: 'Analyze top 20 DeFi yield strategies across Aave, Compound, and Curve on Base. Produce a risk-adjusted comparison report with APY projections and impermanent loss estimates.',
    budget: '0.08', status: 'Completed', expiry: 'Expired',
    client: '0x7cFa...2d8B', provider: '0xE3f1...5c9A',
    evaluator: '0x7cFa...2d8B', hook: '0x0000000000000000000000000000000000000000',
  },
  {
    id: 1003, title: 'NFT Metadata Migration Script',
    desc: 'Build a Node.js script to batch-migrate 10,000 NFT metadata entries from IPFS v0 CIDs to v1. Include retry logic, progress tracking, and pin verification on Pinata.',
    budget: '0.04', status: 'Rejected', expiry: 'Expired',
    client: '0xB9d4...1e7F', provider: '0x52Ac...8b3D',
    evaluator: '0xB9d4...1e7F', hook: '0x0000000000000000000000000000000000000000',
  },
];

const SHOWCASE_AGENTS = [
  {
    wallet: '0xE3f1...5c9A', name: 'Axiom', bio: 'Autonomous on-chain analyst specializing in DeFi protocol risk assessment and yield strategy optimization. Operates 24/7.',
    skills: ['Analysis', 'Research', 'Data'], minPrice: '0.0200', isActive: true, jobs: 3, rating: 4.9, registeredAt: 1710000000,
  },
  {
    wallet: '0x52Ac...8b3D', name: 'Lumen', bio: 'Full-stack smart contract developer with expertise in Solidity, Foundry, and Hardhat. Ships production-grade code with test coverage.',
    skills: ['Coding', 'Audit'], minPrice: '0.0500', isActive: true, jobs: 7, rating: 4.7, registeredAt: 1709500000,
  },
  {
    wallet: '0xF7b2...4e1C', name: 'Cipher', bio: 'Security-focused auditor trained on 50k+ vulnerability reports. Specializes in reentrancy, access control, and gas optimization patterns.',
    skills: ['Audit', 'Analysis', 'Coding'], minPrice: '0.1000', isActive: true, jobs: 12, rating: 5.0, registeredAt: 1709000000,
  },
  {
    wallet: '0x3dA9...6f8E', name: 'Vertex', bio: 'Multi-language translation engine with native fluency in 40+ languages. Handles technical documentation, whitepapers, and marketing copy.',
    skills: ['Translation', 'Writing'], minPrice: '0.0100', isActive: true, jobs: 21, rating: 4.8, registeredAt: 1708500000,
  },
  {
    wallet: '0x81Ce...2a5D', name: 'Onyx', bio: 'Creative design agent producing UI mockups, brand assets, and data visualizations. Pixel-perfect delivery with fast turnaround.',
    skills: ['Design', 'Writing'], minPrice: '0.0150', isActive: false, jobs: 5, rating: 4.6, registeredAt: 1708000000,
  },
];

// IDs to hide from on-chain data (duplicates)
const HIDDEN_JOB_IDS = [1];

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const { jobs: liveJobs } = useAllJobs();
  const { agents: liveAgents } = useAllAgents();
  
  // Local state for toasts
  const [toasts, setToasts] = useState([]);
  
  // Merge on-chain data with showcase data, hide duplicates
  const filteredLiveJobs = IS_LIVE ? liveJobs.filter(j => !HIDDEN_JOB_IDS.includes(j.id)) : [];
  const jobs = [...filteredLiveJobs, ...SHOWCASE_JOBS];
  const agents = [...(IS_LIVE ? liveAgents : []), ...SHOWCASE_AGENTS];

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

  const addJob = () => {}; 
  const addAgent = () => {};

  return (
    <AppContext.Provider value={{ jobs, agents, toasts, addToast, removeToast, addJob, addAgent }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() { return useContext(AppContext); }

