import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Fuel, ExternalLink, Info, Droplets } from 'lucide-react';

const FAUCET_LINKS = [
  {
    name: 'Base Sepolia Faucet',
    url: 'https://www.base.org/faucets',
    description: 'Official Base faucet for testnet ETH',
    icon: '⚡',
    badge: 'Official',
  },
  {
    name: 'Circle USDC Faucet',
    url: 'https://faucet.circle.com',
    description: 'Get test USDC and USDT from Circle',
    icon: '💵',
    badge: 'USDC/USDT',
  },
  {
    name: 'Sepolia PoW Faucet',
    url: 'https://sepolia-faucet.pk910.de',
    description: 'Mine testnet ETH (works for Base Sepolia)',
    icon: '⛏️',
    badge: 'PoW',
  },
  {
    name: 'Alchemy Faucet',
    url: 'https://sepoliafaucet.com',
    description: 'Get ETH for Base Sepolia testnet',
    icon: '🔮',
    badge: 'Fast',
  },
];

export default function GasFaucet() {
  const openFaucet = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <Card className="border-blue-500/20 bg-gradient-to-br from-blue-500/5 to-cyan-500/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Fuel className="h-5 w-5 text-blue-500" />
          Get Test ETH for Gas
        </CardTitle>
        <CardDescription>
          You need Base Sepolia ETH to pay for transaction gas fees
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert className="border-blue-500/50 bg-blue-500/5">
          <Info className="h-4 w-4 text-blue-500" />
          <AlertDescription className="text-sm">
            Gas fees on Base Sepolia are very low (~$0.001 per transaction). Get 0.1 ETH to test all features comfortably.
          </AlertDescription>
        </Alert>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {FAUCET_LINKS.map((faucet, index) => (
            <Button
              key={index}
              variant="outline"
              className="h-auto py-4 px-4 flex flex-col items-start gap-2 hover:border-blue-500/50 hover:bg-blue-500/5 transition-all"
              onClick={() => openFaucet(faucet.url)}
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{faucet.icon}</span>
                  <span className="font-semibold text-sm">{faucet.name}</span>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {faucet.badge}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground text-left">{faucet.description}</p>
              <div className="flex items-center gap-1 text-xs text-blue-500">
                Open <ExternalLink className="h-3 w-3" />
              </div>
            </Button>
          ))}
        </div>

        <div className="p-4 bg-background/50 rounded-lg border space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Droplets className="h-4 w-4 text-blue-500" />
            Quick Guide
          </div>
          <ol className="text-xs text-muted-foreground space-y-1 ml-6 list-decimal">
            <li>Visit any faucet above and connect your wallet</li>
            <li>Request test ETH (usually 0.05-0.5 ETH per request)</li>
            <li>Wait for the transaction to complete (~30 seconds)</li>
            <li>Return here to claim test tokens and start testing!</li>
          </ol>
        </div>

        <div className="flex flex-wrap gap-2 justify-center">
          <Badge variant="outline" className="text-xs">
            <span className="mr-1">⛽</span> ~0.001 ETH per tx
          </Badge>
          <Badge variant="outline" className="text-xs">
            <span className="mr-1">🚀</span> Fast confirmations
          </Badge>
          <Badge variant="outline" className="text-xs">
            <span className="mr-1">🔒</span> Safe testnet
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
