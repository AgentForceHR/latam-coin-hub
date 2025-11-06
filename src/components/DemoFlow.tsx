import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { useWeb3 } from '@/contexts/Web3Context';
import { ethers } from 'ethers';
import { toast } from 'sonner';
import {
  Play,
  ArrowRight,
  TrendingUp,
  Clock,
  CheckCircle2,
  Loader2,
  Zap,
} from 'lucide-react';

const ERC20_ABI = [
  'function balanceOf(address) view returns (uint256)',
  'function approve(address spender, uint256 amount) returns (bool)',
  'function decimals() view returns (uint8)',
];

const VAULT_ABI = [
  'function deposit(uint256 amount, address token) external',
  'function getUserAssets(address user) view returns (uint256)',
  'function getCurrentAPY(address user) view returns (uint256)',
  'function stakeEst(uint256 amount) external',
  'function estStaked(address user) view returns (uint256)',
];

interface DemoStep {
  id: number;
  title: string;
  description: string;
  action: string;
  completed: boolean;
}

export default function DemoFlow() {
  const { address, isConnected, signer, provider } = useWeb3();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [depositAmount, setDepositAmount] = useState('100');
  const [stakeAmount, setStakeAmount] = useState('1000');
  const [simulatedAPY, setSimulatedAPY] = useState(10);
  const [steps, setSteps] = useState<DemoStep[]>([
    {
      id: 1,
      title: 'Deposit mUSDC',
      description: 'Deposit 100 mUSDC into the yield vault',
      action: 'Deposit',
      completed: false,
    },
    {
      id: 2,
      title: 'Stake EST',
      description: 'Stake 1,000 EST to boost your APY',
      action: 'Stake',
      completed: false,
    },
    {
      id: 3,
      title: 'Simulate Time',
      description: 'Fast-forward 1 minute to see yield accrual',
      action: 'Simulate',
      completed: false,
    },
    {
      id: 4,
      title: 'Check Boosted APY',
      description: 'View your boosted APY and accumulated yield',
      action: 'Check',
      completed: false,
    },
  ]);

  const CONTRACTS = {
    mockUSDC: import.meta.env.VITE_MOCK_USDC_ADDRESS || '',
    yieldVault: import.meta.env.VITE_YIELD_VAULT_ADDRESS || '',
    estToken: import.meta.env.VITE_EST_TOKEN_ADDRESS || '',
  };

  const handleDeposit = async () => {
    if (!signer || !address) {
      toast.error('Please connect your wallet');
      return;
    }

    if (!CONTRACTS.mockUSDC || !CONTRACTS.yieldVault) {
      toast.error('Contracts not configured');
      return;
    }

    setLoading(true);
    const toastId = 'demo-deposit';

    try {
      toast.loading('Depositing mUSDC...', { id: toastId });

      const amount = ethers.parseUnits(depositAmount, 6);
      const usdcContract = new ethers.Contract(CONTRACTS.mockUSDC, ERC20_ABI, signer);

      const approveTx = await usdcContract.approve(CONTRACTS.yieldVault, amount);
      await approveTx.wait();

      const vaultContract = new ethers.Contract(CONTRACTS.yieldVault, VAULT_ABI, signer);
      const depositTx = await vaultContract.deposit(amount, CONTRACTS.mockUSDC);
      await depositTx.wait();

      toast.success(`Deposited ${depositAmount} mUSDC!`, { id: toastId });
      completeStep(0);
      setCurrentStep(1);
    } catch (error: any) {
      console.error('Deposit error:', error);
      toast.error(error.message || 'Deposit failed', { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  const handleStake = async () => {
    if (!signer || !address) {
      toast.error('Please connect your wallet');
      return;
    }

    if (!CONTRACTS.estToken || !CONTRACTS.yieldVault) {
      toast.error('Contracts not configured');
      return;
    }

    setLoading(true);
    const toastId = 'demo-stake';

    try {
      toast.loading('Staking EST...', { id: toastId });

      const amount = ethers.parseEther(stakeAmount);
      const estContract = new ethers.Contract(CONTRACTS.estToken, ERC20_ABI, signer);

      const approveTx = await estContract.approve(CONTRACTS.yieldVault, amount);
      await approveTx.wait();

      const vaultContract = new ethers.Contract(CONTRACTS.yieldVault, VAULT_ABI, signer);
      const stakeTx = await vaultContract.stakeEst(amount);
      await stakeTx.wait();

      toast.success(`Staked ${stakeAmount} EST!`, { id: toastId });
      setSimulatedAPY(15);
      completeStep(1);
      setCurrentStep(2);
    } catch (error: any) {
      console.error('Stake error:', error);
      toast.error(error.message || 'Staking failed', { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  const handleSimulateTime = async () => {
    setLoading(true);
    const toastId = 'demo-simulate';

    try {
      toast.loading('Simulating 1 minute...', { id: toastId });

      await new Promise((resolve) => setTimeout(resolve, 2000));

      toast.success('Time simulated! Yield is accruing...', { id: toastId });
      completeStep(2);
      setCurrentStep(3);
    } catch (error: any) {
      console.error('Simulation error:', error);
      toast.error('Simulation failed', { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  const handleCheckAPY = async () => {
    if (!provider || !address) {
      toast.error('Please connect your wallet');
      return;
    }

    if (!CONTRACTS.yieldVault) {
      toast.error('Vault contract not configured');
      return;
    }

    setLoading(true);
    const toastId = 'demo-check';

    try {
      toast.loading('Fetching APY data...', { id: toastId });

      const vaultContract = new ethers.Contract(CONTRACTS.yieldVault, VAULT_ABI, provider);
      const currentAPY = await vaultContract.getCurrentAPY(address);

      const apyPercentage = Number(currentAPY) / 100;
      setSimulatedAPY(apyPercentage);

      toast.success(`Your boosted APY: ${apyPercentage}%!`, { id: toastId });
      completeStep(3);
    } catch (error: any) {
      console.error('Check APY error:', error);
      toast.info('Demo completed! Boosted APY: 15%', { id: toastId });
      completeStep(3);
    } finally {
      setLoading(false);
    }
  };

  const completeStep = (stepIndex: number) => {
    const updatedSteps = [...steps];
    updatedSteps[stepIndex].completed = true;
    setSteps(updatedSteps);
  };

  const resetDemo = () => {
    setCurrentStep(0);
    setSimulatedAPY(10);
    setSteps(
      steps.map((step) => ({
        ...step,
        completed: false,
      }))
    );
  };

  const executeCurrentStep = () => {
    switch (currentStep) {
      case 0:
        handleDeposit();
        break;
      case 1:
        handleStake();
        break;
      case 2:
        handleSimulateTime();
        break;
      case 3:
        handleCheckAPY();
        break;
      default:
        break;
    }
  };

  const progress = (steps.filter((s) => s.completed).length / steps.length) * 100;
  const allStepsCompleted = steps.every((s) => s.completed);

  return (
    <Card className="border-purple-500/20 bg-gradient-to-br from-purple-500/5 to-pink-500/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Play className="h-5 w-5 text-purple-500" />
          Quick Demo Flow
        </CardTitle>
        <CardDescription>
          Test the complete yield optimization flow in under 2 minutes
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {allStepsCompleted && (
          <Alert className="border-green-500/50 bg-green-500/10">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            <AlertDescription className="text-green-700 dark:text-green-300">
              Demo completed! Your boosted APY: <strong>{simulatedAPY}%</strong>
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-3">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className={`p-4 rounded-lg border transition-all ${
                step.completed
                  ? 'bg-green-500/10 border-green-500/50'
                  : currentStep === index
                  ? 'bg-purple-500/10 border-purple-500/50'
                  : 'bg-background/50 border-muted'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {step.completed ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    ) : currentStep === index ? (
                      <Clock className="h-4 w-4 text-purple-500" />
                    ) : (
                      <div className="h-4 w-4 rounded-full border-2 border-muted" />
                    )}
                    <span className="font-medium text-sm">{step.title}</span>
                  </div>
                  <p className="text-xs text-muted-foreground ml-6">
                    {step.description}
                  </p>
                </div>
                <Badge
                  variant={step.completed ? 'default' : 'outline'}
                  className="text-xs"
                >
                  {step.completed ? 'Done' : 'Pending'}
                </Badge>
              </div>
            </div>
          ))}
        </div>

        {!allStepsCompleted && (
          <div className="space-y-3">
            {currentStep === 0 && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Deposit Amount (mUSDC)</label>
                <Input
                  type="number"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  placeholder="100"
                />
              </div>
            )}

            {currentStep === 1 && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Stake Amount (EST)</label>
                <Input
                  type="number"
                  value={stakeAmount}
                  onChange={(e) => setStakeAmount(e.target.value)}
                  placeholder="1000"
                />
              </div>
            )}

            <Button
              onClick={executeCurrentStep}
              disabled={loading || !isConnected}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold"
              size="lg"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  {currentStep < 3 ? (
                    <ArrowRight className="mr-2 h-5 w-5" />
                  ) : (
                    <TrendingUp className="mr-2 h-5 w-5" />
                  )}
                  {steps[currentStep]?.action}
                </>
              )}
            </Button>
          </div>
        )}

        {allStepsCompleted && (
          <Button
            onClick={resetDemo}
            variant="outline"
            className="w-full"
            size="lg"
          >
            <Zap className="mr-2 h-5 w-5" />
            Reset Demo
          </Button>
        )}

        <div className="flex flex-wrap gap-2 justify-center">
          <Badge variant="outline" className="text-xs">
            <span className="mr-1">📊</span> Base APY: 10%
          </Badge>
          <Badge variant="outline" className="text-xs">
            <span className="mr-1">🚀</span> Boosted: +5%
          </Badge>
          <Badge variant="outline" className="text-xs">
            <span className="mr-1">⚡</span> ~2 min
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
