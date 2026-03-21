'use client';
import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { baseSepolia } from 'wagmi/chains';

// ── Contract addresses (deployed on Base Sepolia) ─────────
export const CONTRACTS = {
  agenticCommerce: '0x423F4fE54fd06b87b29472D94fdCA1356a11e0d5',
  agentRegistry:   '0xF55A3CF45c41F75eB8f9747f9cf2b2F2526996D6',
  weth:            '0x4200000000000000000000000000000000000006', // WETH on Base
};

// True = contracts deployed, read from chain. False = use simulated data.
export const IS_LIVE = CONTRACTS.agenticCommerce !== '0x0000000000000000000000000000000000000000';

// ── Wagmi + RainbowKit config ────────────────────────────
export const config = getDefaultConfig({
  appName: 'Escovra',
  projectId: '64bcfdddf05f7a7975eed40e5e261d16',
  chains: [baseSepolia],
  ssr: true,
});

// ── ABIs (minimal for reading) ───────────────────────────
export const COMMERCE_ABI = [
  // Read
  { type: 'function', name: 'jobCounter', inputs: [], outputs: [{ type: 'uint256' }], stateMutability: 'view' },
  { type: 'function', name: 'jobs', inputs: [{ name: 'id', type: 'uint256' }], outputs: [
    { name: 'id', type: 'uint256' },
    { name: 'client', type: 'address' },
    { name: 'provider', type: 'address' },
    { name: 'evaluator', type: 'address' },
    { name: 'description', type: 'string' },
    { name: 'budget', type: 'uint256' },
    { name: 'expiredAt', type: 'uint256' },
    { name: 'status', type: 'uint8' },
    { name: 'hook', type: 'address' },
  ], stateMutability: 'view' },
  { type: 'function', name: 'paymentToken', inputs: [], outputs: [{ type: 'address' }], stateMutability: 'view' },
  { type: 'function', name: 'platformFeeBP', inputs: [], outputs: [{ type: 'uint256' }], stateMutability: 'view' },
  // Write
  { type: 'function', name: 'createJob', inputs: [
    { name: 'provider', type: 'address' },
    { name: 'evaluator', type: 'address' },
    { name: 'description', type: 'string' },
    { name: 'expiredAt', type: 'uint256' },
    { name: 'hook', type: 'address' },
  ], outputs: [{ type: 'uint256' }], stateMutability: 'nonpayable' },
  { type: 'function', name: 'setProvider', inputs: [{ name: 'jobId', type: 'uint256' }, { name: 'provider', type: 'address' }], outputs: [], stateMutability: 'nonpayable' },
  { type: 'function', name: 'setBudget', inputs: [{ name: 'jobId', type: 'uint256' }, { name: 'amount', type: 'uint256' }], outputs: [], stateMutability: 'nonpayable' },
  { type: 'function', name: 'fund', inputs: [{ name: 'jobId', type: 'uint256' }], outputs: [], stateMutability: 'nonpayable' },
  { type: 'function', name: 'submit', inputs: [{ name: 'jobId', type: 'uint256' }, { name: 'deliverable', type: 'bytes32' }, { name: 'data', type: 'bytes' }], outputs: [], stateMutability: 'nonpayable' },
  { type: 'function', name: 'complete', inputs: [{ name: 'jobId', type: 'uint256' }, { name: 'reason', type: 'bytes32' }, { name: 'data', type: 'bytes' }], outputs: [], stateMutability: 'nonpayable' },
  { type: 'function', name: 'reject', inputs: [{ name: 'jobId', type: 'uint256' }, { name: 'reason', type: 'bytes32' }, { name: 'data', type: 'bytes' }], outputs: [], stateMutability: 'nonpayable' },
  // Events
  { type: 'event', name: 'JobCreated', inputs: [
    { name: 'jobId', type: 'uint256', indexed: true },
    { name: 'client', type: 'address', indexed: true },
    { name: 'provider', type: 'address', indexed: true },
    { name: 'evaluator', type: 'address', indexed: false },
    { name: 'expiredAt', type: 'uint256', indexed: false },
    { name: 'hook', type: 'address', indexed: false },
    { name: 'description', type: 'string', indexed: false },
  ]},
  { type: 'event', name: 'JobFunded', inputs: [
    { name: 'jobId', type: 'uint256', indexed: true },
    { name: 'client', type: 'address', indexed: true },
    { name: 'amount', type: 'uint256', indexed: false },
  ]},
  { type: 'event', name: 'JobCompleted', inputs: [
    { name: 'jobId', type: 'uint256', indexed: true },
    { name: 'evaluator', type: 'address', indexed: true },
    { name: 'reason', type: 'bytes32', indexed: false },
  ]},
  { type: 'event', name: 'PaymentReleased', inputs: [
    { name: 'jobId', type: 'uint256', indexed: true },
    { name: 'provider', type: 'address', indexed: true },
    { name: 'amount', type: 'uint256', indexed: false },
  ]},
];

export const REGISTRY_ABI = [
  { type: 'function', name: 'getAgentCount', inputs: [], outputs: [{ type: 'uint256' }], stateMutability: 'view' },
  { type: 'function', name: 'getAgent', inputs: [{ name: 'wallet', type: 'address' }], outputs: [{
    type: 'tuple', components: [
      { name: 'wallet', type: 'address' },
      { name: 'name', type: 'string' },
      { name: 'bio', type: 'string' },
      { name: 'skills', type: 'bytes32[]' },
      { name: 'minPriceWei', type: 'uint256' },
      { name: 'isActive', type: 'bool' },
      { name: 'registeredAt', type: 'uint256' },
    ]
  }], stateMutability: 'view' },
  { type: 'function', name: 'getAgentsBatch', inputs: [{ name: 'from', type: 'uint256' }, { name: 'to', type: 'uint256' }], outputs: [{
    type: 'tuple[]', components: [
      { name: 'wallet', type: 'address' },
      { name: 'name', type: 'string' },
      { name: 'bio', type: 'string' },
      { name: 'skills', type: 'bytes32[]' },
      { name: 'minPriceWei', type: 'uint256' },
      { name: 'isActive', type: 'bool' },
      { name: 'registeredAt', type: 'uint256' },
    ]
  }], stateMutability: 'view' },
  { type: 'function', name: 'agentList', inputs: [{ name: 'index', type: 'uint256' }], outputs: [{ type: 'address' }], stateMutability: 'view' },
  { type: 'function', name: 'isRegistered', inputs: [{ name: 'addr', type: 'address' }], outputs: [{ type: 'bool' }], stateMutability: 'view' },
  // Write
  { type: 'function', name: 'register', inputs: [
    { name: 'name', type: 'string' },
    { name: 'bio', type: 'string' },
    { name: 'skills', type: 'bytes32[]' },
    { name: 'minPriceWei', type: 'uint256' },
  ], outputs: [], stateMutability: 'nonpayable' },
  // Events
  { type: 'event', name: 'AgentRegistered', inputs: [
    { name: 'wallet', type: 'address', indexed: true },
    { name: 'name', type: 'string', indexed: false },
    { name: 'skills', type: 'bytes32[]', indexed: false },
    { name: 'minPriceWei', type: 'uint256', indexed: false },
  ]},
];
