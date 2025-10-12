import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet, TrendingUp, DollarSign, Coins } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useLanguage } from "@/contexts/LanguageContext";

const mockBalanceData = [
  { date: "Jan", balance: 1000 },
  { date: "Feb", balance: 1200 },
  { date: "Mar", balance: 1450 },
  { date: "Apr", balance: 1800 },
  { date: "May", balance: 2100 },
  { date: "Jun", balance: 2500 },
];

const Dashboard = () => {
  const { t } = useLanguage();
  return (
    <div className="min-h-screen">
      <Navbar />
      
      <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">{t("dashboardTitle")}</h1>
            <p className="text-muted-foreground">{t("dashboardSubtitle")}</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="glass-card shadow-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t("stablecoinBalance")}</CardTitle>
                <Coins className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$2,500.00</div>
                <p className="text-xs text-muted-foreground">
                  USD + BRL + ARS pegs
                </p>
              </CardContent>
            </Card>

            <Card className="glass-card shadow-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t("morphoYields")}</CardTitle>
                <TrendingUp className="h-4 w-4 text-success" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-success">$186.42</div>
                <p className="text-xs text-muted-foreground">
                  +12.5% {t("fromLastMonth")}
                </p>
              </CardContent>
            </Card>

            <Card className="glass-card shadow-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t("borrowPositions")}</CardTitle>
                <DollarSign className="h-4 w-4 text-warning" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$750.00</div>
                <p className="text-xs text-muted-foreground">
                  {t("healthFactor")} 2.5
                </p>
              </CardContent>
            </Card>

            <Card className="glass-card shadow-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t("stakedLatam")}</CardTitle>
                <Wallet className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">1,250 LATAM</div>
                <p className="text-xs text-muted-foreground">
                  {t("earning")} 8.5% APY
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Portfolio Chart */}
          <Card className="glass-card shadow-card mb-8">
            <CardHeader>
              <CardTitle>{t("portfolioValue")}</CardTitle>
              <CardDescription>{t("totalBalance")}</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={mockBalanceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "0.5rem",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="balance"
                    stroke="hsl(var(--primary))"
                    strokeWidth={3}
                    dot={{ fill: "hsl(var(--primary))", r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="glass-card shadow-card hover:shadow-glow transition-all cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-secondary" />
                  {t("earnMoreYield")}
                </CardTitle>
                <CardDescription>
                  {t("depositHighApy")}
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="glass-card shadow-card hover:shadow-glow transition-all cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Coins className="h-5 w-5 text-primary" />
                  {t("mintStablecoins")}
                </CardTitle>
                <CardDescription>
                  {t("createPegged")}
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="glass-card shadow-card hover:shadow-glow transition-all cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-accent" />
                  {t("borrowAssets")}
                </CardTitle>
                <CardDescription>
                  {t("accessLoans")}
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Dashboard;
