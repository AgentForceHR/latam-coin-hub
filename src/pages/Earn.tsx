import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TrendingUp, ArrowUpRight, Lock } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useState, useEffect } from "react";
import { morphoService, type MorphoVault } from "@/services/morpho";

const formatTVL = (tvl: bigint): string => {
  const tvlNum = Number(tvl) / 1e18;
  if (tvlNum >= 1e9) return `$${(tvlNum / 1e9).toFixed(1)}B`;
  if (tvlNum >= 1e6) return `$${(tvlNum / 1e6).toFixed(1)}M`;
  return `$${tvlNum.toFixed(0)}`;
};

const Earn = () => {
  const { t } = useLanguage();
  const [morphoVaults, setMorphoVaults] = useState<MorphoVault[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMorphoVaults();
  }, []);

  const loadMorphoVaults = async () => {
    try {
      const vaults = await morphoService.getVaults();
      setMorphoVaults(vaults);
    } catch (error) {
      console.error('Failed to load Morpho vaults:', error);
    } finally {
      setLoading(false);
    }
  };

  const featuredVault = morphoVaults.length > 0 ? morphoVaults[0] : null;

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">{t("earnTitle")}</h1>
            <p className="text-muted-foreground">{t("earnSubtitle")}</p>
          </div>

          {/* Featured Vault */}
          <Card className="glass-card shadow-glow mb-8">
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <Badge className="mb-2 bg-success/20 text-success border-success/50">
                    {t("featuredVault")}
                  </Badge>
                  <h2 className="text-3xl font-bold mb-2">
                    {featuredVault ? featuredVault.name : t("morphoVault")}
                  </h2>
                  <p className="text-muted-foreground">
                    {featuredVault ? featuredVault.description : t("vaultDescription")}
                  </p>
                </div>
                <div className="text-right">
                  {loading ? (
                    <div className="text-2xl text-muted-foreground">Loading...</div>
                  ) : featuredVault ? (
                    <>
                      <div className="text-4xl font-bold text-success mb-1">{featuredVault.apy}% APY</div>
                      <div className="text-sm text-muted-foreground">{formatTVL(featuredVault.tvl)} TVL</div>
                    </>
                  ) : (
                    <div className="text-4xl font-bold text-success mb-1">6.5% APY</div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Morpho Vaults Table */}
          <Card className="glass-card shadow-card mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-secondary" />
                {t("availableVaults")}
              </CardTitle>
              <CardDescription>
                {t("selectVault")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("assetPair")}</TableHead>
                    <TableHead>{t("apy")}</TableHead>
                    <TableHead>TVL</TableHead>
                    <TableHead>{t("riskLevel")}</TableHead>
                    <TableHead className="text-right">{t("action")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        Loading vaults...
                      </TableCell>
                    </TableRow>
                  ) : morphoVaults.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        No vaults available
                      </TableCell>
                    </TableRow>
                  ) : (
                    morphoVaults.map((vault) => {
                      const riskLevel = vault.apy > 10 ? "medium" : "low";
                      return (
                        <TableRow key={vault.id}>
                          <TableCell className="font-medium">{vault.name}</TableCell>
                          <TableCell>
                            <span className="text-success font-semibold">{vault.apy}%</span>
                          </TableCell>
                          <TableCell>{formatTVL(vault.tvl)}</TableCell>
                          <TableCell>
                            <Badge
                              variant={riskLevel === "low" ? "secondary" : "outline"}
                              className={riskLevel === "low" ? "bg-success/20 text-success border-success/50" : ""}
                            >
                              {riskLevel === "low" ? t("low") : t("medium")}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button size="sm" className="gradient-hero">
                              {t("deposit")}
                              <ArrowUpRight className="ml-2 h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Staking Section */}
          <Card className="glass-card shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5 text-primary" />
                {t("stakeLatam")}
              </CardTitle>
              <CardDescription>
                {t("stakeDescription")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="border-2 border-muted">
                  <CardHeader>
                    <CardTitle>3 {t("months")}</CardTitle>
                    <div className="text-3xl font-bold text-success">5% APY</div>
                  </CardHeader>
                  <CardContent>
                    <Button className="w-full" variant="outline">
                      {t("stakeNow")}
                    </Button>
                  </CardContent>
                </Card>

                <Card className="border-2 border-primary shadow-glow">
                  <CardHeader>
                    <Badge className="mb-2 bg-primary/20 text-primary border-primary/50 w-fit">
                      {t("popular")}
                    </Badge>
                    <CardTitle>6 {t("months")}</CardTitle>
                    <div className="text-3xl font-bold text-success">10% APY</div>
                  </CardHeader>
                  <CardContent>
                    <Button className="w-full gradient-hero">
                      {t("stakeNow")}
                    </Button>
                  </CardContent>
                </Card>

                <Card className="border-2 border-muted">
                  <CardHeader>
                    <CardTitle>12 {t("months")}</CardTitle>
                    <div className="text-3xl font-bold text-success">15% APY</div>
                  </CardHeader>
                  <CardContent>
                    <Button className="w-full" variant="outline">
                      {t("stakeNow")}
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Earn;
