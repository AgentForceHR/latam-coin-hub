import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, TrendingUp, Lock, Coins, Users, DollarSign, BarChart } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const mockGrowthData = [
  { month: "Jan", apy: 5.2 },
  { month: "Feb", apy: 6.1 },
  { month: "Mar", apy: 7.5 },
  { month: "Apr", apy: 8.3 },
  { month: "May", apy: 9.8 },
  { month: "Jun", apy: 11.2 },
];

const Landing = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto">
          <div className="max-w-4xl mx-auto text-center space-y-8 animate-fade-in">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight">
              Empowering{" "}
              <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                LATAM Finance
              </span>
              {" "}with Stablecoins & DeFi
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Hedge against inflation with USD, BRL, and ARS-pegged stablecoins. Earn 4-8% APY, borrow against collateral, and participate in governance.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button size="lg" className="gradient-hero text-lg px-8 shadow-glow">
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Link to="/dashboard">
                <Button size="lg" variant="outline" className="text-lg px-8">
                  View Dashboard
                </Button>
              </Link>
            </div>
            <div className="flex flex-wrap gap-8 justify-center text-sm text-muted-foreground pt-8">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-success animate-glow" />
                <span>124% Inflation Hedge (ARG)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-accent animate-glow" />
                <span>$318B Crypto Volume</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-card/30">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="glass-card shadow-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-3xl font-bold">$1B</CardTitle>
                  <DollarSign className="h-8 w-8 text-primary" />
                </div>
                <CardDescription>Total Value Locked</CardDescription>
              </CardHeader>
            </Card>
            <Card className="glass-card shadow-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-3xl font-bold">1M+</CardTitle>
                  <Users className="h-8 w-8 text-secondary" />
                </div>
                <CardDescription>Active Users</CardDescription>
              </CardHeader>
            </Card>
            <Card className="glass-card shadow-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-3xl font-bold">$100B</CardTitle>
                  <BarChart className="h-8 w-8 text-accent" />
                </div>
                <CardDescription>Projected Volume</CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">
              Built for Latin America
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Comprehensive DeFi services designed for the unique needs of LATAM users
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="glass-card shadow-card hover:shadow-glow transition-all">
              <CardHeader>
                <Coins className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Mint Stablecoins</CardTitle>
                <CardDescription className="text-base">
                  Create USD, BRL, and ARS-pegged stablecoins to protect against inflation
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="glass-card shadow-card hover:shadow-glow transition-all">
              <CardHeader>
                <TrendingUp className="h-12 w-12 text-secondary mb-4" />
                <CardTitle>Earn 4-8% APY</CardTitle>
                <CardDescription className="text-base">
                  Deposit assets into Morpho vaults and earn competitive yields
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="glass-card shadow-card hover:shadow-glow transition-all">
              <CardHeader>
                <Lock className="h-12 w-12 text-accent mb-4" />
                <CardTitle>Borrow Assets</CardTitle>
                <CardDescription className="text-base">
                  Access overcollateralized loans with competitive interest rates
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="glass-card shadow-card hover:shadow-glow transition-all">
              <CardHeader>
                <Users className="h-12 w-12 text-warning mb-4" />
                <CardTitle>Governance</CardTitle>
                <CardDescription className="text-base">
                  Stake LATAM tokens and participate in protocol decisions
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Yield Growth Chart */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-card/30">
        <div className="container mx-auto max-w-4xl">
          <Card className="glass-card shadow-card">
            <CardHeader>
              <CardTitle className="text-2xl">Yield Growth Over Time</CardTitle>
              <CardDescription>
                Historical APY performance across our protocol
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={mockGrowthData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
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
                    dataKey="apy"
                    stroke="hsl(var(--primary))"
                    strokeWidth={3}
                    dot={{ fill: "hsl(var(--primary))", r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto">
          <Card className="glass-card shadow-glow">
            <CardContent className="p-12 text-center">
              <h2 className="text-4xl font-bold mb-4">
                Ready to Start Earning?
              </h2>
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                Join thousands of LATAM users already earning yields and protecting their wealth
              </p>
              <Button size="lg" className="gradient-hero text-lg px-8 shadow-glow">
                Connect Wallet & Start
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Landing;
