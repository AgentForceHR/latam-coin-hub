import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { useWeb3 } from '@/contexts/Web3Context';
import {
  Wallet,
  TrendingUp,
  Lock,
  Users,
  Vote,
  AlertTriangle,
  ExternalLink,
  Gift,
  MessageSquare,
  Bug,
  Coins,
  ArrowUpRight,
  Info
} from 'lucide-react';
import { ethers } from 'ethers';

const CONTRACTS = {
  mockUSDC: import.meta.env.VITE_MOCK_USDC_ADDRESS || '',
  mockUSDT: import.meta.env.VITE_MOCK_USDT_ADDRESS || '',
  estableToken: import.meta.env.VITE_EST_TOKEN_ADDRESS || '',
  usdcVault: import.meta.env.VITE_USDC_VAULT_ADDRESS || '',
  usdtVault: import.meta.env.VITE_USDT_VAULT_ADDRESS || '',
};

const ERC20_ABI = [
  'function balanceOf(address) view returns (uint256)',
  'function approve(address spender, uint256 amount) returns (bool)',
  'function faucet() external',
  'function decimals() view returns (uint8)',
];

const VAULT_ABI = [
  'function deposit(uint256 amount) external',
  'function withdraw(uint256 amount) external',
  'function claimYield() external',
  'function stakeEst(uint256 amount) external',
  'function unstakeEst(uint256 amount) external',
  'function getUserInfo(address) view returns (uint256, uint256, uint256, uint256)',
];

export default function BetaTest() {
  const { address, isConnected, connect, isConnecting, provider, signer } = useWeb3();
  const [activeTab, setActiveTab] = useState('deposit');
  const [loading, setLoading] = useState(false);

  const [usdcBalance, setUsdcBalance] = useState('0');
  const [usdtBalance, setUsdtBalance] = useState('0');
  const [estBalance, setEstBalance] = useState('0');

  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [stakeAmount, setStakeAmount] = useState('');
  const [referralCode, setReferralCode] = useState('');

  const [vaultInfo, setVaultInfo] = useState({
    deposited: '0',
    pendingYield: '0',
    estStaked: '0',
    currentAPY: '0',
  });

  useEffect(() => {
    if (isConnected && provider && address) {
      loadBalances();
      loadVaultInfo();
    }
  }, [isConnected, provider, address]);

  const loadBalances = async () => {
    if (!provider || !address) return;

    try {
      const usdcContract = new ethers.Contract(CONTRACTS.mockUSDC, ERC20_ABI, provider);
      const usdtContract = new ethers.Contract(CONTRACTS.mockUSDT, ERC20_ABI, provider);
      const estContract = new ethers.Contract(CONTRACTS.estableToken, ERC20_ABI, provider);

      const [usdc, usdt, est] = await Promise.all([
        usdcContract.balanceOf(address),
        usdtContract.balanceOf(address),
        estContract.balanceOf(address),
      ]);

      setUsdcBalance(ethers.formatUnits(usdc, 6));
      setUsdtBalance(ethers.formatUnits(usdt, 6));
      setEstBalance(ethers.formatEther(est));
    } catch (error) {
      console.error('Error loading balances:', error);
    }
  };

  const loadVaultInfo = async () => {
    if (!provider || !address) return;

    try {
      const vaultContract = new ethers.Contract(CONTRACTS.usdcVault, VAULT_ABI, provider);
      const info = await vaultContract.getUserInfo(address);

      setVaultInfo({
        deposited: ethers.formatUnits(info[0], 6),
        pendingYield: ethers.formatUnits(info[1], 6),
        estStaked: ethers.formatEther(info[2]),
        currentAPY: (Number(info[3]) / 100).toFixed(2),
      });
    } catch (error) {
      console.error('Error loading vault info:', error);
    }
  };

  const handleFaucet = async (token: 'USDC' | 'USDT' | 'EST') => {
    if (!signer) return;

    setLoading(true);
    try {
      const contractAddress = token === 'USDC' ? CONTRACTS.mockUSDC :
                             token === 'USDT' ? CONTRACTS.mockUSDT :
                             CONTRACTS.estableToken;

      const contract = new ethers.Contract(contractAddress, ERC20_ABI, signer);
      const tx = await contract.faucet();

      toast.loading('Getting test tokens...', { id: 'faucet' });
      await tx.wait();

      toast.success(`Received test ${token} tokens!`, { id: 'faucet' });
      await loadBalances();
    } catch (error: any) {
      toast.error(error.message || 'Failed to get test tokens', { id: 'faucet' });
    } finally {
      setLoading(false);
    }
  };

  const handleDeposit = async () => {
    if (!signer || !depositAmount) return;

    setLoading(true);
    try {
      const amount = ethers.parseUnits(depositAmount, 6);

      const usdcContract = new ethers.Contract(CONTRACTS.mockUSDC, ERC20_ABI, signer);
      const approveTx = await usdcContract.approve(CONTRACTS.usdcVault, amount);

      toast.loading('Approving USDC...', { id: 'deposit' });
      await approveTx.wait();

      const vaultContract = new ethers.Contract(CONTRACTS.usdcVault, VAULT_ABI, signer);
      const depositTx = await vaultContract.deposit(amount);

      toast.loading('Depositing USDC...', { id: 'deposit' });
      await depositTx.wait();

      toast.success('Deposit successful!', { id: 'deposit' });
      setDepositAmount('');
      await loadBalances();
      await loadVaultInfo();
    } catch (error: any) {
      toast.error(error.message || 'Deposit failed', { id: 'deposit' });
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async () => {
    if (!signer || !withdrawAmount) return;

    setLoading(true);
    try {
      const amount = ethers.parseUnits(withdrawAmount, 6);
      const vaultContract = new ethers.Contract(CONTRACTS.usdcVault, VAULT_ABI, signer);

      const tx = await vaultContract.withdraw(amount);
      toast.loading('Withdrawing...', { id: 'withdraw' });
      await tx.wait();

      toast.success('Withdrawal successful!', { id: 'withdraw' });
      setWithdrawAmount('');
      await loadBalances();
      await loadVaultInfo();
    } catch (error: any) {
      toast.error(error.message || 'Withdrawal failed', { id: 'withdraw' });
    } finally {
      setLoading(false);
    }
  };

  const handleClaimYield = async () => {
    if (!signer) return;

    setLoading(true);
    try {
      const vaultContract = new ethers.Contract(CONTRACTS.usdcVault, VAULT_ABI, signer);
      const tx = await vaultContract.claimYield();

      toast.loading('Claiming yield...', { id: 'claim' });
      await tx.wait();

      toast.success('Yield claimed!', { id: 'claim' });
      await loadBalances();
      await loadVaultInfo();
    } catch (error: any) {
      toast.error(error.message || 'Claim failed', { id: 'claim' });
    } finally {
      setLoading(false);
    }
  };

  const handleStakeEst = async () => {
    if (!signer || !stakeAmount) return;

    setLoading(true);
    try {
      const amount = ethers.parseEther(stakeAmount);

      const estContract = new ethers.Contract(CONTRACTS.estableToken, ERC20_ABI, signer);
      const approveTx = await estContract.approve(CONTRACTS.usdcVault, amount);

      toast.loading('Approving EST...', { id: 'stake' });
      await approveTx.wait();

      const vaultContract = new ethers.Contract(CONTRACTS.usdcVault, VAULT_ABI, signer);
      const stakeTx = await vaultContract.stakeEst(amount);

      toast.loading('Staking EST...', { id: 'stake' });
      await stakeTx.wait();

      toast.success('EST staked successfully!', { id: 'stake' });
      setStakeAmount('');
      await loadBalances();
      await loadVaultInfo();
    } catch (error: any) {
      toast.error(error.message || 'Staking failed', { id: 'stake' });
    } finally {
      setLoading(false);
    }
  };

  const handleReferral = () => {
    if (!referralCode) {
      toast.error('Please enter a referral code');
      return;
    }

    localStorage.setItem('estable_referral', referralCode);
    toast.success('Referral code applied!');
    setReferralCode('');
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen pt-20 pb-12 bg-gradient-to-b from-background to-muted/20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <Alert className="mb-8 border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20">
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800 dark:text-yellow-200">
              <strong>TESTNET ONLY</strong> - This is a beta testing environment on Base Sepolia.
              All tokens have NO REAL VALUE. For testing purposes only.
            </AlertDescription>
          </Alert>

          <Card className="max-w-2xl mx-auto text-center">
            <CardHeader>
              <CardTitle className="text-3xl">Welcome to Estable Beta</CardTitle>
              <CardDescription>
                Connect your wallet to start testing yield optimization on Base Sepolia
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2 text-sm text-muted-foreground">
                <p className="flex items-center justify-center gap-2">
                  <Info className="h-4 w-4" />
                  Network: Base Sepolia (Chain ID: 84532)
                </p>
                <p>Supported wallets: MetaMask, Rabby</p>
              </div>
              <Button
                size="lg"
                onClick={connect}
                disabled={isConnecting}
                className="gradient-hero"
              >
                <Wallet className="mr-2 h-5 w-5" />
                {isConnecting ? 'Connecting...' : 'Connect Wallet'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-12 bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <Alert className="mb-8 border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20">
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800 dark:text-yellow-200 flex items-center justify-between">
            <span>
              <strong>TESTNET ONLY</strong> - Base Sepolia testnet. All tokens have NO REAL VALUE.
            </span>
            <a
              href="https://sepolia.basescan.org"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 hover:underline"
            >
              View Explorer <ExternalLink className="h-3 w-3" />
            </a>
          </AlertDescription>
        </Alert>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">USDC Balance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Number(usdcBalance).toFixed(2)}</div>
              <Button
                size="sm"
                variant="outline"
                className="mt-2 w-full"
                onClick={() => handleFaucet('USDC')}
                disabled={loading}
              >
                <Gift className="mr-2 h-3 w-3" />
                Get Test USDC
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">USDT Balance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Number(usdtBalance).toFixed(2)}</div>
              <Button
                size="sm"
                variant="outline"
                className="mt-2 w-full"
                onClick={() => handleFaucet('USDT')}
                disabled={loading}
              >
                <Gift className="mr-2 h-3 w-3" />
                Get Test USDT
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">EST Balance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Number(estBalance).toFixed(2)}</div>
              <Button
                size="sm"
                variant="outline"
                className="mt-2 w-full"
                onClick={() => handleFaucet('EST')}
                disabled={loading}
              >
                <Gift className="mr-2 h-3 w-3" />
                Get Test EST
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-primary/10 to-secondary/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Current APY</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{vaultInfo.currentAPY}%</div>
              <p className="text-xs text-muted-foreground mt-1">
                Base: 10% + EST Boost: up to +5%
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Yield Optimization</CardTitle>
              <CardDescription>Deposit stablecoins and earn optimized yields</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="deposit">Deposit</TabsTrigger>
                  <TabsTrigger value="withdraw">Withdraw</TabsTrigger>
                  <TabsTrigger value="stake">Stake EST</TabsTrigger>
                </TabsList>

                <TabsContent value="deposit" className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Deposit Amount (USDC)</label>
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Available: {Number(usdcBalance).toFixed(2)} USDC
                    </p>
                  </div>
                  <Button
                    className="w-full"
                    onClick={handleDeposit}
                    disabled={loading || !depositAmount}
                  >
                    <Coins className="mr-2 h-4 w-4" />
                    Deposit USDC
                  </Button>
                </TabsContent>

                <TabsContent value="withdraw" className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Withdraw Amount (USDC)</label>
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Deposited: {Number(vaultInfo.deposited).toFixed(2)} USDC
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      className="flex-1"
                      onClick={handleWithdraw}
                      disabled={loading || !withdrawAmount}
                    >
                      Withdraw
                    </Button>
                    <Button
                      className="flex-1"
                      variant="outline"
                      onClick={handleClaimYield}
                      disabled={loading || Number(vaultInfo.pendingYield) === 0}
                    >
                      Claim Yield ({Number(vaultInfo.pendingYield).toFixed(4)})
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="stake" className="space-y-4">
                  <Alert>
                    <TrendingUp className="h-4 w-4" />
                    <AlertDescription>
                      Stake EST tokens to boost your APY by up to +5%. Stake amount up to 50% of your deposit for maximum boost.
                    </AlertDescription>
                  </Alert>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Stake Amount (EST)</label>
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={stakeAmount}
                      onChange={(e) => setStakeAmount(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Available: {Number(estBalance).toFixed(2)} EST |
                      Currently Staked: {Number(vaultInfo.estStaked).toFixed(2)} EST
                    </p>
                  </div>
                  <Button
                    className="w-full"
                    onClick={handleStakeEst}
                    disabled={loading || !stakeAmount}
                  >
                    <Lock className="mr-2 h-4 w-4" />
                    Stake EST
                  </Button>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Referral Program
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Enter Referral Code</label>
                  <Input
                    placeholder="REF123ABC"
                    value={referralCode}
                    onChange={(e) => setReferralCode(e.target.value)}
                  />
                </div>
                <Button className="w-full" variant="outline" onClick={handleReferral}>
                  Apply Code
                </Button>
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-xs text-muted-foreground text-center">
                    Your referral code: <br />
                    <code className="text-sm font-mono text-foreground">
                      {address?.slice(0, 10).toUpperCase()}
                    </code>
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Vote className="h-5 w-5" />
                  Mock Governance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Proposal: Increase base APY to 12%
                  </p>
                  <Progress value={65} className="h-2" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>For: 65%</span>
                    <span>Against: 35%</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button className="flex-1" size="sm" variant="outline">
                    Vote For
                  </Button>
                  <Button className="flex-1" size="sm" variant="outline">
                    Vote Against
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Feedback
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  className="w-full"
                  variant="outline"
                  onClick={() => window.open('https://forms.gle/example', '_blank')}
                >
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Submit Feedback
                </Button>
                <Button
                  className="w-full"
                  variant="outline"
                  onClick={() => window.open('https://discord.gg/estable', '_blank')}
                >
                  <Bug className="mr-2 h-4 w-4" />
                  Report Bug
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
