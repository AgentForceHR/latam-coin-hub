import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLanguage } from '@/contexts/LanguageContext';
import { translations } from '@/lib/translations';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import TokenFaucet from '@/components/TokenFaucet';
import GasFaucet from '@/components/GasFaucet';
import DemoFlow from '@/components/DemoFlow';
import { Sparkles, ArrowLeft, Users, Calendar, Gift, Wallet } from 'lucide-react';
import { toast } from 'sonner';
import { useWeb3 } from '@/contexts/Web3Context';

const Beta = () => {
  const { language } = useLanguage();
  const t = translations[language];
  const { address, isConnected, connect } = useWeb3();

  const [email, setEmail] = useState('');
  const [nickname, setNickname] = useState('');
  const [loading, setLoading] = useState(false);
  const [remaining, setRemaining] = useState<number | null>(null);
  const [showTestingSection, setShowTestingSection] = useState(false);

  useEffect(() => {
    fetchRemainingSpots();
  }, []);

  const fetchRemainingSpots = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/beta/count');
      if (response.ok) {
        const data = await response.json();
        setRemaining(data.remaining);
      }
    } catch (error) {
      console.error('Error fetching remaining spots:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !nickname) {
      toast.error('Please fill in all fields');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('http://localhost:3001/api/beta/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          nickname,
          language,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message || t.betaSuccess);
        setEmail('');
        setNickname('');
        fetchRemainingSpots();
      } else {
        toast.error(data.error || 'Registration failed');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
      <div className="absolute top-4 right-4 z-50">
        <LanguageSwitcher />
      </div>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Link to="/" className="inline-flex items-center gap-2 text-yellow-500 hover:text-yellow-400 mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          {t.betaBackToMain}
        </Link>

        <div className="text-center mb-12 mt-8">
          <div className="inline-flex items-center gap-2 mb-6">
            <Sparkles className="w-12 h-12 text-yellow-500" />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-yellow-500 mb-4">
            {t.betaTitle}
          </h1>
          <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto mb-6">
            {t.betaSubtitle}
          </p>
          <div className="flex flex-wrap justify-center gap-4 mb-6">
            <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20 px-4 py-2">
              <Calendar className="w-4 h-4 mr-2" />
              Oct 30 Start
            </Badge>
            <Badge variant="secondary" className="bg-blue-500/10 text-blue-500 border-blue-500/20 px-4 py-2">
              <Gift className="w-4 h-4 mr-2" />
              EST Airdrop
            </Badge>
            {remaining !== null && (
              <Badge variant="secondary" className="bg-red-500/10 text-red-500 border-red-500/20 px-4 py-2">
                <Users className="w-4 h-4 mr-2" />
                {remaining} {t.betaSpotsRemaining}
              </Badge>
            )}
          </div>
        </div>

        <Card className="bg-black/50 border-yellow-500/20 backdrop-blur-sm">
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-gray-300">
                  {t.betaEmail}
                </label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@email.com"
                  className="bg-black/50 border-yellow-500/30 text-white placeholder:text-gray-500 focus:border-yellow-500"
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="nickname" className="text-sm font-medium text-gray-300">
                  {t.betaNickname}
                </label>
                <Input
                  id="nickname"
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder="@tuapodo"
                  className="bg-black/50 border-yellow-500/30 text-white placeholder:text-gray-500 focus:border-yellow-500"
                  required
                />
              </div>

              <Button
                type="submit"
                disabled={loading || remaining === 0}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-6 text-lg"
              >
                {loading ? 'Registering...' : t.betaSubmit}
              </Button>
            </form>

            <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
              <p className="text-sm text-yellow-500 text-center font-medium">
                {t.betaNote}
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="mt-12 grid md:grid-cols-3 gap-6">
          <Card className="bg-black/30 border-yellow-500/10 backdrop-blur-sm">
            <CardContent className="p-6 text-center">
              <Calendar className="w-8 h-8 text-yellow-500 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-white mb-2">1 Week Trial</h3>
              <p className="text-sm text-gray-400">Starting October 30, 2025</p>
            </CardContent>
          </Card>

          <Card className="bg-black/30 border-blue-500/10 backdrop-blur-sm">
            <CardContent className="p-6 text-center">
              <Gift className="w-8 h-8 text-blue-500 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-white mb-2">EST Airdrop</h3>
              <p className="text-sm text-gray-400">Exclusive token rewards for testers</p>
            </CardContent>
          </Card>

          <Card className="bg-black/30 border-yellow-500/10 backdrop-blur-sm">
            <CardContent className="p-6 text-center">
              <Users className="w-8 h-8 text-yellow-500 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-white mb-2">Limited to 100</h3>
              <p className="text-sm text-gray-400">First come, first served</p>
            </CardContent>
          </Card>
        </div>

        <div className="mt-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-4">
              Start Testing Now
            </h2>
            <p className="text-gray-300 max-w-2xl mx-auto">
              Get test tokens and explore the yield optimization features on Base Sepolia testnet
            </p>
          </div>

          <Tabs defaultValue="tokens" className="max-w-6xl mx-auto">
            <TabsList className="grid w-full grid-cols-3 bg-black/50 border border-yellow-500/20">
              <TabsTrigger value="tokens" className="data-[state=active]:bg-yellow-500/20">
                Test Tokens
              </TabsTrigger>
              <TabsTrigger value="gas" className="data-[state=active]:bg-blue-500/20">
                Gas Faucets
              </TabsTrigger>
              <TabsTrigger value="demo" className="data-[state=active]:bg-purple-500/20">
                Quick Demo
              </TabsTrigger>
            </TabsList>

            <TabsContent value="tokens" className="mt-6">
              <div className="grid md:grid-cols-1 gap-6">
                <TokenFaucet onClaimSuccess={() => setShowTestingSection(true)} />
              </div>
            </TabsContent>

            <TabsContent value="gas" className="mt-6">
              <div className="grid md:grid-cols-1 gap-6">
                <GasFaucet />
              </div>
            </TabsContent>

            <TabsContent value="demo" className="mt-6">
              <div className="grid md:grid-cols-1 gap-6">
                <DemoFlow />
              </div>
            </TabsContent>
          </Tabs>

          {isConnected && (
            <div className="mt-8 text-center">
              <Card className="bg-black/30 border-green-500/20 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Wallet className="w-5 h-5 text-green-500" />
                    <span className="text-sm text-green-400 font-medium">
                      Connected: {address?.slice(0, 6)}...{address?.slice(-4)}
                    </span>
                  </div>
                  <Link to="/beta/test">
                    <Button className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-semibold">
                      Open Full Testing Dashboard
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        <footer className="mt-16 text-center text-gray-500 text-sm">
          <p>Stablecoin DeFi © 2025</p>
          <p className="mt-2">Follow us: <a href="https://x.com/StablecoinDeFiLATAM" target="_blank" rel="noopener noreferrer" className="text-yellow-500 hover:underline">@StablecoinDeFiLATAM</a></p>
        </footer>
      </div>
    </div>
  );
};

export default Beta;
