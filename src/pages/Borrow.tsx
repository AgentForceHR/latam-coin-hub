import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DollarSign, AlertTriangle } from "lucide-react";
import { useState } from "react";

const mockPositions = [
  { asset: "USDC", borrowed: "$500", collateral: "1.2 ETH", healthFactor: 2.5, status: "Healthy" },
  { asset: "BRL", borrowed: "R$ 1,250", collateral: "0.8 BTC", healthFactor: 1.8, status: "Healthy" },
];

const Borrow = () => {
  const [collateralRatio, setCollateralRatio] = useState([175]);

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Borrow Assets</h1>
            <p className="text-muted-foreground">Access overcollateralized loans with competitive interest rates</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Borrow Form */}
            <Card className="glass-card shadow-card">
              <CardHeader>
                <CardTitle>New Borrow Position</CardTitle>
                <CardDescription>
                  Provide collateral to borrow stablecoins
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="collateral">Collateral Asset</Label>
                  <Input id="collateral" placeholder="Select asset..." />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="collateralAmount">Collateral Amount</Label>
                  <Input id="collateralAmount" type="number" placeholder="0.00" />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label>Collateralization Ratio</Label>
                    <span className="text-sm font-medium">{collateralRatio[0]}%</span>
                  </div>
                  <Slider
                    value={collateralRatio}
                    onValueChange={setCollateralRatio}
                    min={150}
                    max={200}
                    step={5}
                    className="py-4"
                  />
                  <p className="text-xs text-muted-foreground">
                    Minimum 150% - Recommended 175%+
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="borrowAmount">Borrow Amount</Label>
                  <Input id="borrowAmount" type="number" placeholder="0.00" />
                </div>

                <div className="p-4 rounded-lg bg-warning/10 border border-warning/20">
                  <div className="flex gap-2 text-warning">
                    <AlertTriangle className="h-5 w-5 flex-shrink-0" />
                    <div className="text-sm">
                      <p className="font-medium mb-1">Liquidation Risk</p>
                      <p className="text-xs text-muted-foreground">
                        If your health factor drops below 1.0, your position may be liquidated with a 1-5% penalty
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Interest Rate</span>
                    <span className="font-medium">3.2% APY</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Health Factor</span>
                    <span className="font-medium text-success">2.5</span>
                  </div>
                </div>

                <Button className="w-full gradient-hero" size="lg">
                  <DollarSign className="mr-2 h-4 w-4" />
                  Borrow Assets
                </Button>
              </CardContent>
            </Card>

            {/* Info Card */}
            <Card className="glass-card shadow-card">
              <CardHeader>
                <CardTitle>How Borrowing Works</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h3 className="font-semibold">1. Provide Collateral</h3>
                  <p className="text-sm text-muted-foreground">
                    Deposit crypto assets as collateral to secure your loan
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold">2. Choose Collateralization</h3>
                  <p className="text-sm text-muted-foreground">
                    Set your collateral ratio between 150-200%. Higher ratios mean lower liquidation risk
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold">3. Borrow Stablecoins</h3>
                  <p className="text-sm text-muted-foreground">
                    Receive USD, BRL, or ARS-pegged stablecoins at competitive rates
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold">4. Monitor Health Factor</h3>
                  <p className="text-sm text-muted-foreground">
                    Keep your health factor above 1.0 to avoid liquidation. Green = Safe, Yellow = Caution, Red = Danger
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-accent/10 border border-accent/20">
                  <p className="text-sm">
                    <span className="font-semibold">Pro Tip:</span> Maintain a health factor of 2.0+ for maximum safety
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Active Positions */}
          <Card className="glass-card shadow-card">
            <CardHeader>
              <CardTitle>Your Borrow Positions</CardTitle>
              <CardDescription>
                Monitor and manage your active loans
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Asset</TableHead>
                    <TableHead>Borrowed</TableHead>
                    <TableHead>Collateral</TableHead>
                    <TableHead>Health Factor</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockPositions.map((position) => (
                    <TableRow key={position.asset}>
                      <TableCell className="font-medium">{position.asset}</TableCell>
                      <TableCell>{position.borrowed}</TableCell>
                      <TableCell>{position.collateral}</TableCell>
                      <TableCell>
                        <span className="text-success font-semibold">{position.healthFactor}</span>
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-success/20 text-success border-success/50">
                          {position.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button size="sm" variant="outline">
                          Repay
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Borrow;
