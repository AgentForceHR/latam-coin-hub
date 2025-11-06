import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useWeb3 } from '@/contexts/Web3Context';
import { ethers } from 'ethers';
import { toast } from 'sonner';
import { Coins, Clock, CheckCircle2, Loader2 } from 'lucide-react';

const ERC20_ABI = [
  'function faucet() external',
  'function balanceOf(address) view returns (uint256)',
  'function approve(address spender, uint256 amount) returns (bool)',
  'function decimals() view returns (uint8)',
];

interface TokenFaucetProps {
  onClaimSuccess?: () => void;
}

export default function TokenFaucet({ onClaimSuccess }: TokenFaucetProps) {
  const { address, isConnected, signer, connect } = useWeb3();
  const [loading, setLoading] = useState(false);
  const [lastClaimTime, setLastClaimTime] = useState<number | null>(null);
  const [timeUntilNextClaim, setTimeUntilNextClaim] = useState<string>('');
  const [claimed, setClaimed] = useState(false);

  const CONTRACTS = {
    mockUSDC: import.meta.env.VITE_MOCK_USDC_ADDRESS || '',
    mockUSDT: import.meta.env.VITE_MOCK_USDT_ADDRESS || '',
    estToken: import.meta.env.VITE_EST_TOKEN_ADDRESS || '',
    yieldVault: import.meta.env.VITE_YIELD_VAULT_ADDRESS || '',
    estStake: import.meta.env.VITE_EST_STAKE_ADDRESS || '',
  };

  const COOLDOWN_PERIOD = 24 * 60 * 60 * 1000;

  useEffect(() => {
    if (address) {
      checkLastClaimTime();
    }
  }, [address]);

  useEffect(() => {
    const interval = setInterval(() => {
      updateTimeRemaining();
    }, 1000);

    return () => clearInterval(interval);
  }, [lastClaimTime]);

  const checkLastClaimTime = () => {
    const storageKey = `faucet_claim_${address}`;
    const lastClaim = localStorage.getItem(storageKey);

    if (lastClaim) {
      const claimTime = parseInt(lastClaim);
      setLastClaimTime(claimTime);
    }
  };

  const updateTimeRemaining = () => {
    if (!lastClaimTime) {
      setTimeUntilNextClaim('');
      return;
    }

    const now = Date.now();
    const timeSinceClaim = now - lastClaimTime;
    const timeRemaining = COOLDOWN_PERIOD - timeSinceClaim;

    if (timeRemaining <= 0) {
      setTimeUntilNextClaim('');
      setLastClaimTime(null);
      return;
    }

    const hours = Math.floor(timeRemaining / (60 * 60 * 1000));
    const minutes = Math.floor((timeRemaining % (60 * 60 * 1000)) / (60 * 1000));
    const seconds = Math.floor((timeRemaining % (60 * 1000)) / 1000);

    setTimeUntilNextClaim(`${hours}h ${minutes}m ${seconds}s`);
  };

  const canClaim = (): boolean => {
    if (!lastClaimTime) return true;

    const now = Date.now();
    return now - lastClaimTime >= COOLDOWN_PERIOD;
  };

  const handleClaimTokens = async () => {
    if (!signer || !address) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (!canClaim()) {
      toast.error(`Please wait ${timeUntilNextClaim} before claiming again`);
      return;
    }

    if (!CONTRACTS.mockUSDC || !CONTRACTS.mockUSDT || !CONTRACTS.estToken) {
      toast.error('Contract addresses not configured. Please deploy contracts first.');
      return;
    }

    setLoading(true);
    const toastId = 'claim-tokens';

    try {
      toast.loading('Claiming test tokens...', { id: toastId });

      const usdcContract = new ethers.Contract(CONTRACTS.mockUSDC, ERC20_ABI, signer);
      const usdtContract = new ethers.Contract(CONTRACTS.mockUSDT, ERC20_ABI, signer);
      const estContract = new ethers.Contract(CONTRACTS.estToken, ERC20_ABI, signer);

      toast.loading('Claiming 1,000 mUSDC...', { id: toastId });
      const usdcTx = await usdcContract.faucet();
      await usdcTx.wait();

      toast.loading('Claiming 1,000 mUSDT...', { id: toastId });
      const usdtTx = await usdtContract.faucet();
      await usdtTx.wait();

      toast.loading('Claiming 1,000 EST...', { id: toastId });
      const estTx = await estContract.faucet();
      await estTx.wait();

      if (CONTRACTS.yieldVault) {
        toast.loading('Approving tokens for vault...', { id: toastId });
        await autoApproveTokens();
      }

      const now = Date.now();
      const storageKey = `faucet_claim_${address}`;
      localStorage.setItem(storageKey, now.toString());
      setLastClaimTime(now);
      setClaimed(true);

      toast.success('Tokens claimed successfully! Ready for yield testing.', { id: toastId });

      if (onClaimSuccess) {
        onClaimSuccess();
      }
    } catch (error: any) {
      console.error('Claim error:', error);
      toast.error(error.message || 'Failed to claim tokens. Please try again.', { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  const autoApproveTokens = async () => {
    if (!signer || !CONTRACTS.yieldVault) return;

    try {
      const maxApproval = ethers.MaxUint256;

      const usdcContract = new ethers.Contract(CONTRACTS.mockUSDC, ERC20_ABI, signer);
      const usdtContract = new ethers.Contract(CONTRACTS.mockUSDT, ERC20_ABI, signer);
      const estContract = new ethers.Contract(CONTRACTS.estToken, ERC20_ABI, signer);

      const approvals = [
        usdcContract.approve(CONTRACTS.yieldVault, maxApproval),
        usdtContract.approve(CONTRACTS.yieldVault, maxApproval),
      ];

      if (CONTRACTS.estStake) {
        approvals.push(estContract.approve(CONTRACTS.estStake, maxApproval));
      }

      const txs = await Promise.all(approvals);
      await Promise.all(txs.map(tx => tx.wait()));
    } catch (error) {
      console.error('Auto-approval error:', error);
    }
  };

  if (!isConnected) {
    return (
      <Card className="border-yellow-500/20 bg-gradient-to-br from-yellow-500/5 to-orange-500/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Coins className="h-5 w-5 text-yellow-500" />
            Test Token Faucet
          </CardTitle>
          <CardDescription>
            Connect your wallet to claim test tokens for yield testing
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={connect} className="w-full" size="lg">
            Connect Wallet to Claim Tokens
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-yellow-500/20 bg-gradient-to-br from-yellow-500/5 to-orange-500/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Coins className="h-5 w-5 text-yellow-500" />
          Test Token Faucet
        </CardTitle>
        <CardDescription>
          Claim test tokens once every 24 hours for beta testing
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="flex flex-col items-center justify-center p-4 bg-background/50 rounded-lg border">
            <div className="text-2xl font-bold text-blue-500">1,000</div>
            <div className="text-sm text-muted-foreground">mUSDC</div>
          </div>
          <div className="flex flex-col items-center justify-center p-4 bg-background/50 rounded-lg border">
            <div className="text-2xl font-bold text-green-500">1,000</div>
            <div className="text-sm text-muted-foreground">mUSDT</div>
          </div>
          <div className="flex flex-col items-center justify-center p-4 bg-background/50 rounded-lg border">
            <div className="text-2xl font-bold text-yellow-500">1,000</div>
            <div className="text-sm text-muted-foreground">EST</div>
          </div>
        </div>

        {timeUntilNextClaim && !canClaim() && (
          <Alert className="border-orange-500/50 bg-orange-500/10">
            <Clock className="h-4 w-4 text-orange-500" />
            <AlertDescription className="text-orange-700 dark:text-orange-300">
              Next claim available in: <strong>{timeUntilNextClaim}</strong>
            </AlertDescription>
          </Alert>
        )}

        {claimed && canClaim() && (
          <Alert className="border-green-500/50 bg-green-500/10">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            <AlertDescription className="text-green-700 dark:text-green-300">
              Tokens claimed successfully! You can claim again now.
            </AlertDescription>
          </Alert>
        )}

        <Button
          onClick={handleClaimTokens}
          disabled={loading || !canClaim()}
          className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-semibold"
          size="lg"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Claiming Tokens...
            </>
          ) : !canClaim() ? (
            <>
              <Clock className="mr-2 h-5 w-5" />
              Cooldown Active
            </>
          ) : (
            <>
              <Coins className="mr-2 h-5 w-5" />
              Claim Test Tokens
            </>
          )}
        </Button>

        <div className="flex flex-wrap gap-2 justify-center">
          <Badge variant="outline" className="text-xs">
            Auto-approves for vaults
          </Badge>
          <Badge variant="outline" className="text-xs">
            24h cooldown
          </Badge>
          <Badge variant="outline" className="text-xs">
            Base Sepolia testnet
          </Badge>
        </div>

        <Alert className="border-blue-500/50 bg-blue-500/5">
          <AlertDescription className="text-xs text-muted-foreground">
            After claiming, tokens are automatically approved for vault deposits. You can immediately start testing yield optimization!
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}
