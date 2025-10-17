import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowRight, Coins, Shield, TrendingUp } from 'lucide-react';

interface LandingContent {
  hero: {
    headline: string;
    subtext: string;
  };
  mission: string;
  overview: string;
  fairLaunch: {
    date: string;
    amount: string;
  };
  lbp: {
    date: string;
    amount: string;
  };
  chain: string;
  cta: string;
}

const SolDeFiLanding = () => {
  const [language, setLanguage] = useState<string>('en');
  const [content, setContent] = useState<LandingContent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContent(language);
  }, [language]);

  const staticContent = {
    en: {
      hero: {
        headline: "SolDeFi: Powering LATAM DeFi",
        subtext: "Stablecoins with Morpho vaults, launching Oct 27, 2025"
      },
      mission: "Revolutionizing $415B LATAM crypto with USD-S, BRL-S, COP-S",
      overview: "SolDeFi revolutionizes LATAM stablecoin market with USD-S, BRL-S, COP-S via Morpho vaults",
      fairLaunch: { date: "Oct 27-29, 2025", amount: "$100K" },
      lbp: { date: "Oct 30-Nov 3, 2025", amount: "$400K" },
      chain: "BNB Chain",
      cta: "Join App"
    },
    es: {
      hero: {
        headline: "SolDeFi: Impulsando DeFi en LATAM",
        subtext: "Stablecoins con bóvedas Morpho, lanzamiento 27 de octubre, 2025"
      },
      mission: "Revolucionando $415B del cripto LATAM con USD-S, BRL-S, COP-S",
      overview: "SolDeFi revoluciona el mercado de stablecoins LATAM con USD-S, BRL-S, COP-S a través de bóvedas Morpho",
      fairLaunch: { date: "27-29 Oct, 2025", amount: "$100K" },
      lbp: { date: "30 Oct-3 Nov, 2025", amount: "$400K" },
      chain: "BNB Chain",
      cta: "Unirse a la App"
    },
    pt: {
      hero: {
        headline: "SolDeFi: Impulsionando DeFi na LATAM",
        subtext: "Stablecoins com cofres Morpho, lançamento 27 de outubro, 2025"
      },
      mission: "Revolucionando $415B do cripto LATAM com USD-S, BRL-S, COP-S",
      overview: "SolDeFi revoluciona o mercado de stablecoins LATAM com USD-S, BRL-S, COP-S através de cofres Morpho",
      fairLaunch: { date: "27-29 Out, 2025", amount: "$100K" },
      lbp: { date: "30 Out-3 Nov, 2025", amount: "$400K" },
      chain: "BNB Chain",
      cta: "Entrar no App"
    }
  };

  const fetchContent = async (lang: string) => {
    try {
      const response = await fetch(`/api/landing/info?lang=${lang}`);
      if (response.ok) {
        const data = await response.json();
        setContent(data.data);
      } else {
        setContent(staticContent[lang as keyof typeof staticContent] || staticContent.en);
      }
    } catch (error) {
      console.error('Failed to fetch content:', error);
      setContent(staticContent[lang as keyof typeof staticContent] || staticContent.en);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinApp = () => {
    window.location.href = '/soldefi/app';
  };

  if (loading || !content) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-yellow-500 text-2xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-sm border-b border-yellow-500/20">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold text-yellow-500">SolDeFi</div>
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

      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto text-center max-w-4xl">
          <Badge className="mb-6 bg-yellow-500/20 text-yellow-500 border-yellow-500/50 px-4 py-2 text-sm">
            {content.chain}
          </Badge>
          <h1 className="text-5xl md:text-7xl font-bold mb-6 text-yellow-500">
            {content.hero.headline}
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-8">
            {content.hero.subtext}
          </p>
          <Button
            size="lg"
            onClick={handleJoinApp}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 text-lg"
          >
            {content.cta}
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      <section className="py-20 px-4 bg-gradient-to-b from-black to-yellow-500/5">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-yellow-500">
            Mission
          </h2>
          <p className="text-xl text-center text-gray-300 mb-16 max-w-3xl mx-auto">
            {content.mission}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="bg-black border-yellow-500/30">
              <CardContent className="p-6">
                <Coins className="h-12 w-12 text-yellow-500 mb-4" />
                <h3 className="text-xl font-bold mb-2 text-yellow-500">USD-S, BRL-S, COP-S</h3>
                <p className="text-gray-400">
                  LATAM-focused stablecoins backed by Morpho vault strategies
                </p>
              </CardContent>
            </Card>

            <Card className="bg-black border-yellow-500/30">
              <CardContent className="p-6">
                <Shield className="h-12 w-12 text-yellow-500 mb-4" />
                <h3 className="text-xl font-bold mb-2 text-yellow-500">Secure Vaults</h3>
                <p className="text-gray-400">
                  Morpho-powered vaults with institutional-grade security
                </p>
              </CardContent>
            </Card>

            <Card className="bg-black border-yellow-500/30">
              <CardContent className="p-6">
                <TrendingUp className="h-12 w-12 text-yellow-500 mb-4" />
                <h3 className="text-xl font-bold mb-2 text-yellow-500">Sustainable Yields</h3>
                <p className="text-gray-400">
                  Earn competitive returns on your stablecoin holdings
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-yellow-500">
            Launch Timeline
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="bg-gradient-to-br from-yellow-500/10 to-black border-yellow-500/50">
              <CardContent className="p-8">
                <Badge className="mb-4 bg-yellow-500 text-black">Fair Launch</Badge>
                <h3 className="text-2xl font-bold mb-2 text-yellow-500">
                  {content.fairLaunch.amount}
                </h3>
                <p className="text-lg text-gray-300">{content.fairLaunch.date}</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-600/10 to-black border-blue-600/50">
              <CardContent className="p-8">
                <Badge className="mb-4 bg-blue-600 text-white">LBP</Badge>
                <h3 className="text-2xl font-bold mb-2 text-blue-400">
                  {content.lbp.amount}
                </h3>
                <p className="text-lg text-gray-300">{content.lbp.date}</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <footer className="py-8 px-4 border-t border-yellow-500/20">
        <div className="container mx-auto text-center">
          <p className="text-gray-500 text-sm">
            © 2025 SolDeFi. Powered by BNB Chain.
          </p>
          <p className="text-gray-600 text-xs mt-2">soldefi.latam</p>
        </div>
      </footer>
    </div>
  );
};

export default SolDeFiLanding;
