import { createPublicClient, http, type Address } from 'viem';
import { bscTestnet } from 'viem/chains';

export const morphoClient = createPublicClient({
  chain: bscTestnet,
  transport: http(),
});

export interface MorphoVault {
  id: string;
  address: Address;
  name: string;
  asset: Address;
  apy: number;
  tvl: bigint;
  description: string;
}

const MORPHO_ADAPTER_ABI = [
  {
    inputs: [
      { name: 'vaultId', type: 'bytes32' },
      { name: 'amount', type: 'uint256' }
    ],
    name: 'depositToVault',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      { name: 'vaultId', type: 'bytes32' },
      { name: 'shares', type: 'uint256' }
    ],
    name: 'withdrawFromVault',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      { name: 'user', type: 'address' },
      { name: 'vaultId', type: 'bytes32' }
    ],
    name: 'getUserBalance',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      { name: 'user', type: 'address' },
      { name: 'vaultId', type: 'bytes32' }
    ],
    name: 'getUserShares',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [{ name: 'vaultId', type: 'bytes32' }],
    name: 'getVaultInfo',
    outputs: [
      {
        components: [
          { name: 'vaultAddress', type: 'address' },
          { name: 'asset', type: 'address' },
          { name: 'name', type: 'string' },
          { name: 'active', type: 'bool' }
        ],
        name: '',
        type: 'tuple'
      }
    ],
    stateMutability: 'view',
    type: 'function'
  }
] as const;

export const morphoService = {
  async getVaults(): Promise<MorphoVault[]> {
    return [
      {
        id: 'usdc-vault',
        address: '0x0000000000000000000000000000000000000000' as Address,
        name: 'USDC Yield Vault',
        asset: '0x0000000000000000000000000000000000000000' as Address,
        apy: 6.5,
        tvl: BigInt(5000000000000000000),
        description: 'Earn yields on USDC with Morpho-inspired strategies'
      },
      {
        id: 'brl-vault',
        address: '0x0000000000000000000000000000000000000000' as Address,
        name: 'BRL Stablecoin Vault',
        asset: '0x0000000000000000000000000000000000000000' as Address,
        apy: 8.2,
        tvl: BigInt(2500000000000000000),
        description: 'High yields on Brazilian Real stablecoins'
      },
      {
        id: 'ars-vault',
        address: '0x0000000000000000000000000000000000000000' as Address,
        name: 'ARS Stablecoin Vault',
        asset: '0x0000000000000000000000000000000000000000' as Address,
        apy: 12.5,
        tvl: BigInt(1500000000000000000),
        description: 'Premium yields on Argentine Peso stablecoins'
      }
    ];
  },

  async deposit(
    adapterAddress: Address,
    vaultId: string,
    amount: bigint,
    walletClient: any
  ) {
    const vaultIdBytes = `0x${Buffer.from(vaultId).toString('hex').padEnd(64, '0')}` as `0x${string}`;

    const { request } = await morphoClient.simulateContract({
      address: adapterAddress,
      abi: MORPHO_ADAPTER_ABI,
      functionName: 'depositToVault',
      args: [vaultIdBytes, amount],
      account: walletClient.account
    });

    return await walletClient.writeContract(request);
  },

  async withdraw(
    adapterAddress: Address,
    vaultId: string,
    shares: bigint,
    walletClient: any
  ) {
    const vaultIdBytes = `0x${Buffer.from(vaultId).toString('hex').padEnd(64, '0')}` as `0x${string}`;

    const { request } = await morphoClient.simulateContract({
      address: adapterAddress,
      abi: MORPHO_ADAPTER_ABI,
      functionName: 'withdrawFromVault',
      args: [vaultIdBytes, shares],
      account: walletClient.account
    });

    return await walletClient.writeContract(request);
  },

  async getUserPosition(
    adapterAddress: Address,
    userAddress: Address,
    vaultId: string
  ): Promise<{ balance: bigint; shares: bigint }> {
    const vaultIdBytes = `0x${Buffer.from(vaultId).toString('hex').padEnd(64, '0')}` as `0x${string}`;

    const balance = await morphoClient.readContract({
      address: adapterAddress,
      abi: MORPHO_ADAPTER_ABI,
      functionName: 'getUserBalance',
      args: [userAddress, vaultIdBytes]
    }) as bigint;

    const shares = await morphoClient.readContract({
      address: adapterAddress,
      abi: MORPHO_ADAPTER_ABI,
      functionName: 'getUserShares',
      args: [userAddress, vaultIdBytes]
    }) as bigint;

    return { balance, shares };
  }
};
