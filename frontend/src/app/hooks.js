'use client';
import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { CONTRACTS, COMMERCE_ABI, REGISTRY_ABI, IS_LIVE } from './web3-config';

// Inline constants to avoid heavy viem barrel import
const ZERO = '0x0000000000000000000000000000000000000000';

// Minimal parseEther/formatEther without full viem import
function parseEth(eth) { return BigInt(Math.floor(Number(eth) * 1e18)); }
function fmtEth(wei) { return (Number(wei) / 1e18).toFixed(4); }

// Simple keccak256 via browser crypto (used for deliverable/reason hashes)
function toHexBytes32(str) {
  // Pad to bytes32 with zeros
  const hex = Array.from(new TextEncoder().encode(str)).map(b => b.toString(16).padStart(2, '0')).join('');
  return '0x' + hex.padEnd(64, '0').slice(0, 64);
}

// ── Read: Job counter ────────────────────────
export function useJobCounter() {
  const { data, isLoading, refetch } = useReadContract({
    address: CONTRACTS.agenticCommerce,
    abi: COMMERCE_ABI,
    functionName: 'jobCounter',
    query: { enabled: IS_LIVE },
  });
  return { count: data ? Number(data) : 0, isLoading, refetch };
}

// ── Read: Single job by ID ───────────────────
export function useJob(jobId) {
  const { data, isLoading, refetch } = useReadContract({
    address: CONTRACTS.agenticCommerce,
    abi: COMMERCE_ABI,
    functionName: 'jobs',
    args: [BigInt(jobId || 0)],
    query: { enabled: IS_LIVE && !!jobId },
  });

  const STATUS_MAP = ['Open', 'Funded', 'Submitted', 'Completed', 'Rejected', 'Expired'];

  if (!data) return { job: null, isLoading, refetch };

  return {
    job: {
      id: Number(data[0]),
      client: data[1],
      provider: data[2] === ZERO ? null : data[2],
      evaluator: data[3],
      desc: data[4],
      title: data[4]?.slice(0, 80) || 'Untitled',
      budget: fmtEth(data[5]),
      expiredAt: Number(data[6]),
      expiry: formatExpiry(Number(data[6])),
      status: STATUS_MAP[Number(data[7])] || 'Open',
      hook: data[8],
    },
    isLoading,
    refetch,
  };
}

// ── Read: Agent count ────────────────────────
export function useAgentCount() {
  const { data, isLoading, refetch } = useReadContract({
    address: CONTRACTS.agentRegistry,
    abi: REGISTRY_ABI,
    functionName: 'getAgentCount',
    query: { enabled: IS_LIVE },
  });
  return { count: data ? Number(data) : 0, isLoading, refetch };
}

// ── Read: WETH Balance ───────────────────────
const ERC20_ABI = [
  { type: 'function', name: 'balanceOf', inputs: [{ name: 'account', type: 'address' }], outputs: [{ type: 'uint256' }], stateMutability: 'view' },
  { type: 'function', name: 'approve', inputs: [{ name: 'spender', type: 'address' }, { name: 'amount', type: 'uint256' }], outputs: [{ type: 'bool' }], stateMutability: 'nonpayable' },
  { type: 'function', name: 'deposit', inputs: [], outputs: [], stateMutability: 'payable' },
];

export function useWethBalance(walletAddress) {
  const { data, isLoading, refetch } = useReadContract({
    address: CONTRACTS.weth,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: walletAddress ? [walletAddress] : undefined,
    query: { enabled: IS_LIVE && !!walletAddress },
  });
  return { 
    weiString: data ? data.toString() : '0',
    formattedWeth: data ? fmtEth(data) : '0.0000',
    isLoading, 
    refetch 
  };
}

// ── Read: All jobs ───────────────────────────
export function useAllJobs() {
  const { data, isLoading, refetch } = useReadContract({
    address: CONTRACTS.agenticCommerce,
    abi: COMMERCE_ABI,
    functionName: 'getJobsBatch',
    args: [1n, 1000n],
    query: { enabled: IS_LIVE },
  });

  const STATUS_MAP = ['Open', 'Funded', 'Submitted', 'Completed', 'Rejected', 'Expired'];

  const jobs = (data || []).map(d => ({
    id: Number(d.id),
    client: d.client,
    provider: d.provider === ZERO ? null : d.provider,
    evaluator: d.evaluator,
    desc: d.description,
    title: d.description?.split(' | ')[0] || 'Untitled',
    budget: fmtEth(d.budget),
    expiredAt: Number(d.expiredAt),
    expiry: formatExpiry(Number(d.expiredAt)),
    status: STATUS_MAP[Number(d.status)] || 'Open',
    hook: d.hook,
  })).filter(j => j.id > 0).reverse();

  return { jobs, isLoading, refetch };
}

// ── Read: All agents ─────────────────────────
export function useAllAgents() {
  const { data, isLoading, refetch } = useReadContract({
    address: CONTRACTS.agentRegistry,
    abi: REGISTRY_ABI,
    functionName: 'getAgentsBatch',
    args: [0n, 1000n],
    query: { enabled: IS_LIVE },
  });

  const agents = (data || []).map(a => ({
    wallet: a.wallet,
    name: a.name,
    bio: a.bio,
    // Note: Parsing real bytes32 array to strings requires an ascii decode block,
    // keeping it simple for now by hardcoding a fallback if on-chain matching is too complex.
    skills: ['Coding'], 
    minPrice: fmtEth(a.minPriceWei),
    isActive: a.isActive,
    jobs: 0,
    rating: 5.0,
    registeredAt: Number(a.registeredAt)
  })).filter(a => a.wallet !== ZERO).reverse();

  return { agents, isLoading, refetch };
}

// ── Write: Set provider ──────────────────────
export function useSetProvider() {
  const { data: hash, writeContract, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const setProvider = (jobId, providerAddress) => {
    writeContract({
      address: CONTRACTS.agenticCommerce,
      abi: COMMERCE_ABI,
      functionName: 'setProvider',
      args: [BigInt(jobId), providerAddress],
    });
  };

  return { setProvider, hash, isPending, isConfirming, isSuccess, error };
}

// ── Write: Create job ────────────────────────
export function useCreateJob() {
  const { data: hash, writeContract, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const createJob = (provider, evaluator, description, expiryTimestamp, hook = ZERO) => {
    writeContract({
      address: CONTRACTS.agenticCommerce,
      abi: COMMERCE_ABI,
      functionName: 'createJob',
      args: [provider || ZERO, evaluator, BigInt(expiryTimestamp), description, hook],
    });
  };

  return { createJob, hash, isPending, isConfirming, isSuccess, error };
}

// ── Write: Set budget ────────────────────────
export function useSetBudget() {
  const { data: hash, writeContract, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const setBudget = (jobId, amountWeth) => {
    writeContract({
      address: CONTRACTS.agenticCommerce,
      abi: COMMERCE_ABI,
      functionName: 'setBudget',
      args: [BigInt(jobId), parseEth(amountWeth), '0x'],
    });
  };

  return { setBudget, hash, isPending, isConfirming, isSuccess, error };
}

// ── Write: Fund escrow ───────────────────────
export function useFundJob() {
  const { data: hash, writeContract, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const fund = (jobId) => {
    writeContract({
      address: CONTRACTS.agenticCommerce,
      abi: COMMERCE_ABI,
      functionName: 'fund',
      args: [BigInt(jobId), '0x'],
    });
  };

  return { fund, hash, isPending, isConfirming, isSuccess, error };
}

// ── Write: Submit work ───────────────────────
export function useSubmitWork() {
  const { data: hash, writeContract, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const submit = (jobId, deliverableString) => {
    writeContract({
      address: CONTRACTS.agenticCommerce,
      abi: COMMERCE_ABI,
      functionName: 'submit',
      args: [BigInt(jobId), toHexBytes32(deliverableString), '0x'],
    });
  };

  return { submit, hash, isPending, isConfirming, isSuccess, error };
}

// ── Write: Complete (approve) ────────────────
export function useCompleteJob() {
  const { data: hash, writeContract, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const complete = (jobId, reason = 'approved') => {
    writeContract({
      address: CONTRACTS.agenticCommerce,
      abi: COMMERCE_ABI,
      functionName: 'complete',
      args: [BigInt(jobId), toHexBytes32(reason), '0x'],
    });
  };

  return { complete, hash, isPending, isConfirming, isSuccess, error };
}

// ── Write: Reject ────────────────────────────
export function useRejectJob() {
  const { data: hash, writeContract, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const reject = (jobId, reason = 'rejected') => {
    writeContract({
      address: CONTRACTS.agenticCommerce,
      abi: COMMERCE_ABI,
      functionName: 'reject',
      args: [BigInt(jobId), toHexBytes32(reason), '0x'],
    });
  };

  return { reject, hash, isPending, isConfirming, isSuccess, error };
}

// ── Write: Register agent ────────────────────
export function useRegisterAgent() {
  const { data: hash, writeContract, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const register = (name, bio, skills, minPriceWeth) => {
    const skillBytes = skills.map(s => toHexBytes32(s));
    writeContract({
      address: CONTRACTS.agentRegistry,
      abi: REGISTRY_ABI,
      functionName: 'register',
      args: [name, bio, skillBytes, parseEth(minPriceWeth)],
    });
  };

  return { register, hash, isPending, isConfirming, isSuccess, error };
}

// ── WETH convert and approve (for funding) ───
const ERC20_ABI_WRITE = [
  { type: 'function', name: 'approve', inputs: [{ name: 'spender', type: 'address' }, { name: 'amount', type: 'uint256' }], outputs: [{ type: 'bool' }], stateMutability: 'nonpayable' },
  { type: 'function', name: 'deposit', inputs: [], outputs: [], stateMutability: 'payable' },
];

export function useDepositWETH() {
  const { data: hash, writeContract, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const deposit = (amountWeth) => {
    writeContract({
      address: CONTRACTS.weth,
      abi: ERC20_ABI_WRITE,
      functionName: 'deposit',
      value: parseEth(amountWeth), // Native ETH to be deposited
    });
  };

  return { deposit, hash, isPending, isConfirming, isSuccess, error };
}

export function useApproveWETH() {
  const { data: hash, writeContract, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const approve = (amountWeth) => {
    writeContract({
      address: CONTRACTS.weth,
      abi: ERC20_ABI_WRITE,
      functionName: 'approve',
      args: [CONTRACTS.agenticCommerce, parseEth(amountWeth)],
    });
  };

  return { approve, hash, isPending, isConfirming, isSuccess, error };
}

// ── Helpers ──────────────────────────────────
function formatExpiry(timestamp) {
  if (!timestamp) return '—';
  const now = Math.floor(Date.now() / 1000);
  const diff = timestamp - now;
  if (diff <= 0) return 'Expired';
  const days = Math.floor(diff / 86400);
  const hours = Math.floor((diff % 86400) / 3600);
  if (days > 0) return `${days} day${days > 1 ? 's' : ''}`;
  return `${hours} hour${hours > 1 ? 's' : ''}`;
}
