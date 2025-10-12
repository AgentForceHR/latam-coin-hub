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
import { useLanguage } from "@/contexts/LanguageContext";

const mockPositions = [
  { asset: "USDC", borrowed: "$500", collateral: "1.2 ETH", healthFactor: 2.5, status: "Healthy" },
  { asset: "BRL", borrowed: "R$ 1,250", collateral: "0.8 BTC", healthFactor: 1.8, status: "Healthy" },
];

const Borrow = () => {
  const { t } = useLanguage();
  const [collateralRatio, setCollateralRatio] = useState([175]);

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">{t("borrowTitle")}</h1>
            <p className="text-muted-foreground">{t("borrowSubtitle")}</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Borrow Form */}
            <Card className="glass-card shadow-card">
              <CardHeader>
                <CardTitle>{t("newPosition")}</CardTitle>
                <CardDescription>
                  {t("provideCollateral")}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="collateral">{t("collateralAsset")}</Label>
                  <Input id="collateral" placeholder={t("selectAsset")} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="collateralAmount">{t("collateralAmount")}</Label>
                  <Input id="collateralAmount" type="number" placeholder="0.00" />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label>{t("collateralRatio")}</Label>
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
                    {t("minimum")}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="borrowAmount">{t("borrowAmount")}</Label>
                  <Input id="borrowAmount" type="number" placeholder="0.00" />
                </div>

                <div className="p-4 rounded-lg bg-warning/10 border border-warning/20">
                  <div className="flex gap-2 text-warning">
                    <AlertTriangle className="h-5 w-5 flex-shrink-0" />
                    <div className="text-sm">
                      <p className="font-medium mb-1">{t("liquidationRisk")}</p>
                      <p className="text-xs text-muted-foreground">
                        {t("liquidationWarning")}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{t("interestRate")}</span>
                    <span className="font-medium">3.2% APY</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{t("healthFactor")}</span>
                    <span className="font-medium text-success">2.5</span>
                  </div>
                </div>

                <Button className="w-full gradient-hero" size="lg">
                  <DollarSign className="mr-2 h-4 w-4" />
                  {t("borrowAssets")}
                </Button>
              </CardContent>
            </Card>

            {/* Info Card */}
            <Card className="glass-card shadow-card">
              <CardHeader>
                <CardTitle>{t("howBorrowing")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h3 className="font-semibold">{t("step1")}</h3>
                  <p className="text-sm text-muted-foreground">
                    {t("step1Description")}
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold">{t("step2")}</h3>
                  <p className="text-sm text-muted-foreground">
                    {t("step2Description")}
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold">{t("step3")}</h3>
                  <p className="text-sm text-muted-foreground">
                    {t("step3Description")}
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold">{t("step4")}</h3>
                  <p className="text-sm text-muted-foreground">
                    {t("step4Description")}
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-accent/10 border border-accent/20">
                  <p className="text-sm">
                    <span className="font-semibold">{t("proTip")}</span> {t("proTipText")}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Active Positions */}
          <Card className="glass-card shadow-card">
            <CardHeader>
              <CardTitle>{t("yourPositions")}</CardTitle>
              <CardDescription>
                {t("monitorLoans")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("asset")}</TableHead>
                    <TableHead>{t("borrowed")}</TableHead>
                    <TableHead>{t("collateral")}</TableHead>
                    <TableHead>{t("healthFactor")}</TableHead>
                    <TableHead>{t("status")}</TableHead>
                    <TableHead className="text-right">{t("action")}</TableHead>
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
                          {t("healthy")}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button size="sm" variant="outline">
                          {t("repay")}
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
