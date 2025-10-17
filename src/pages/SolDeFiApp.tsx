import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar, DollarSign, TrendingUp, Wallet, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface PriceData {
  price: number;
  currency: string;
  lbp_period: {
    start: string;
    end: string;
  };
  status: string;
}

interface DashboardData {
  sdf_balance: number;
  kyc_status: string;
  vesting: {
    start_date: string;
    progress: number;
    months_total: number;
  };
  total_invested: number;
  transactions: any[];
}

const SolDeFiApp = () => {
  const [language, setLanguage] = useState<string>('en');
  const [priceData, setPriceData] = useState<PriceData | null>(null);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [bnbAmount, setBnbAmount] = useState<string>('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchPrice();
    fetchDashboard();
  }, [language]);

  const fetchPrice = async () => {
    try {
      const response = await fetch(`/api/app/price?lang=${language}`);
      if (response.ok) {
        const data = await response.json();
        setPriceData(data);
      } else {
        setPriceData({
          price: 0.04,
          currency: 'USD',
          lbp_period: { start: '2025-10-30', end: '2025-11-03' },
          status: 'LBP starts Oct 30, 2025'
        });
      }
    } catch (error) {
      console.error('Failed to fetch price:', error);
      setPriceData({
        price: 0.04,
        currency: 'USD',
        lbp_period: { start: '2025-10-30', end: '2025-11-03' },
        status: 'LBP starts Oct 30, 2025'
      });
    }
  };

  const fetchDashboard = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) return;

      const response = await fetch('/api/app/dashboard', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setDashboardData(data);
    } catch (error) {
      console.error('Failed to fetch dashboard:', error);
    }
  };

  const handleBuy = async () => {
    if (!bnbAmount || parseFloat(bnbAmount) <= 0) {
      alert('Please enter a valid BNB amount');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        alert('Please login first');
        return;
      }

      const response = await fetch('/api/app/buy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          bnb_amount: parseFloat(bnbAmount),
          tx_hash: `0x${Date.now().toString(16)}`
        })
      });

      const data = await response.json();

      if (response.ok) {
        alert(`Successfully purchased ${data.sdf_tokens.toFixed(2)} SDF tokens!`);
        setBnbAmount('');
        fetchDashboard();
      } else {
        alert(data.error || 'Purchase failed');
      }
    } catch (error) {
      console.error('Buy error:', error);
      alert('Purchase failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const calculateSdfTokens = () => {
    if (!priceData || !bnbAmount) return 0;
    return parseFloat(bnbAmount) / priceData.price;
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-sm border-b border-yellow-500/20">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold text-yellow-500">SolDeFi App</div>
          <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger className="w-32 bg-black border-yellow-500/30">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="es">Español</SelectItem>
              <SelectItem value="pt">Português</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </header>

      <main className="pt-24 pb-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <Tabs defaultValue="buy" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-black border border-yellow-500/30">
              <TabsTrigger value="home">Home</TabsTrigger>
              <TabsTrigger value="buy">Buy</TabsTrigger>
              <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            </TabsList>

            <TabsContent value="home" className="space-y-6 mt-6">
              <Card className="bg-gradient-to-br from-yellow-500/10 to-black border-yellow-500/30">
                <CardHeader>
                  <CardTitle className="text-3xl text-yellow-500">Welcome to SolDeFi</CardTitle>
                  <CardDescription className="text-gray-400">
                    Join the LATAM DeFi revolution
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {priceData && (
                    <div className="flex items-center justify-between p-4 bg-black/50 rounded-lg">
                      <div>
                        <p className="text-sm text-gray-400">Current SDF Price</p>
                        <p className="text-2xl font-bold text-yellow-500">
                          ${priceData.price.toFixed(4)}
                        </p>
                      </div>
                      <Badge className="bg-blue-600">
                        {priceData.status}
                      </Badge>
                    </div>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-black/50 rounded-lg border border-yellow-500/20">
                      <Calendar className="h-8 w-8 text-yellow-500 mb-2" />
                      <p className="text-sm text-gray-400">Fair Launch</p>
                      <p className="font-bold">Oct 27-29, 2025</p>
                    </div>
                    <div className="p-4 bg-black/50 rounded-lg border border-blue-600/20">
                      <TrendingUp className="h-8 w-8 text-blue-400 mb-2" />
                      <p className="text-sm text-gray-400">LBP</p>
                      <p className="font-bold">Oct 30-Nov 3, 2025</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="buy" className="space-y-6 mt-6">
              <Card className="bg-black border-yellow-500/30">
                <CardHeader>
                  <CardTitle className="text-yellow-500">Purchase SDF Tokens</CardTitle>
                  <CardDescription>Buy SDF with BNB or USDC</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {dashboardData?.kyc_status !== 'approved' && (
                    <Alert className="bg-yellow-500/10 border-yellow-500/50">
                      <AlertCircle className="h-4 w-4 text-yellow-500" />
                      <AlertTitle className="text-yellow-500">KYC Required</AlertTitle>
                      <AlertDescription className="text-gray-400">
                        Please complete KYC verification to purchase tokens. Status: {dashboardData?.kyc_status || 'pending'}
                      </AlertDescription>
                    </Alert>
                  )}

                  <div className="space-y-2">
                    <label className="text-sm text-gray-400">BNB Amount</label>
                    <Input
                      type="number"
                      placeholder="0.0"
                      value={bnbAmount}
                      onChange={(e) => setBnbAmount(e.target.value)}
                      className="bg-black border-yellow-500/30 text-white"
                      step="0.01"
                      min="0"
                    />
                  </div>

                  {bnbAmount && priceData && (
                    <div className="p-4 bg-yellow-500/5 rounded-lg border border-yellow-500/20">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">You will receive:</span>
                        <span className="text-xl font-bold text-yellow-500">
                          {calculateSdfTokens().toFixed(2)} SDF
                        </span>
                      </div>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-sm text-gray-500">Price per SDF:</span>
                        <span className="text-sm text-gray-300">${priceData.price.toFixed(4)}</span>
                      </div>
                    </div>
                  )}

                  <Button
                    onClick={handleBuy}
                    disabled={loading || dashboardData?.kyc_status !== 'approved'}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    {loading ? 'Processing...' : 'Buy SDF'}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="dashboard" className="space-y-6 mt-6">
              {dashboardData ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="bg-black border-yellow-500/30">
                      <CardContent className="pt-6">
                        <Wallet className="h-8 w-8 text-yellow-500 mb-2" />
                        <p className="text-sm text-gray-400">SDF Balance</p>
                        <p className="text-3xl font-bold text-yellow-500">
                          {dashboardData.sdf_balance.toFixed(2)}
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="bg-black border-yellow-500/30">
                      <CardContent className="pt-6">
                        <DollarSign className="h-8 w-8 text-green-500 mb-2" />
                        <p className="text-sm text-gray-400">Total Invested</p>
                        <p className="text-3xl font-bold text-green-500">
                          {dashboardData.total_invested.toFixed(4)} BNB
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="bg-black border-yellow-500/30">
                      <CardContent className="pt-6">
                        <Badge className={
                          dashboardData.kyc_status === 'approved'
                            ? 'bg-green-500'
                            : 'bg-yellow-500'
                        }>
                          {dashboardData.kyc_status.toUpperCase()}
                        </Badge>
                        <p className="text-sm text-gray-400 mt-2">KYC Status</p>
                      </CardContent>
                    </Card>
                  </div>

                  {dashboardData.vesting.start_date && (
                    <Card className="bg-black border-yellow-500/30">
                      <CardHeader>
                        <CardTitle className="text-yellow-500">Vesting Schedule</CardTitle>
                        <CardDescription>
                          {dashboardData.vesting.months_total} months vesting period
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-400">Progress</span>
                            <span className="text-yellow-500">
                              {dashboardData.vesting.progress.toFixed(1)}%
                            </span>
                          </div>
                          <Progress
                            value={dashboardData.vesting.progress}
                            className="h-2 bg-gray-800"
                          />
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  <Card className="bg-black border-yellow-500/30">
                    <CardHeader>
                      <CardTitle className="text-yellow-500">Transaction History</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {dashboardData.transactions.length === 0 ? (
                        <p className="text-gray-500 text-center py-8">No transactions yet</p>
                      ) : (
                        <div className="space-y-2">
                          {dashboardData.transactions.map((tx: any) => (
                            <div
                              key={tx.id}
                              className="flex justify-between items-center p-3 bg-black/50 rounded-lg border border-yellow-500/20"
                            >
                              <div>
                                <p className="font-medium text-yellow-500">
                                  {parseFloat(tx.sdf_tokens).toFixed(2)} SDF
                                </p>
                                <p className="text-sm text-gray-500">
                                  {new Date(tx.timestamp).toLocaleDateString()}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-sm text-gray-400">
                                  {parseFloat(tx.bnb_amount).toFixed(4)} BNB
                                </p>
                                <p className="text-xs text-gray-600">
                                  @ ${parseFloat(tx.price).toFixed(4)}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </>
              ) : (
                <Card className="bg-black border-yellow-500/30">
                  <CardContent className="py-12 text-center">
                    <p className="text-gray-500">Please login to view your dashboard</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default SolDeFiApp;
