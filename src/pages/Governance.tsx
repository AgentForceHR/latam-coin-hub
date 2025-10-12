import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Users, ThumbsUp, ThumbsDown, Clock } from "lucide-react";

const mockProposals = [
  {
    id: 1,
    title: "Add MXN Stablecoin Peg",
    description: "Proposal to add Mexican Peso (MXN) as a new stablecoin peg to expand LATAM coverage",
    votesFor: 12500,
    votesAgainst: 3200,
    status: "Active",
    endsIn: "3 days",
  },
  {
    id: 2,
    title: "Increase Morpho Vault APY Pool",
    description: "Allocate additional treasury funds to boost yields in USDC-BRL vault",
    votesFor: 8900,
    votesAgainst: 1100,
    status: "Active",
    endsIn: "5 days",
  },
  {
    id: 3,
    title: "Lower Collateralization Ratio to 140%",
    description: "Reduce minimum collateralization ratio from 150% to 140% for experienced borrowers",
    votesFor: 5200,
    votesAgainst: 8700,
    status: "Active",
    endsIn: "2 days",
  },
];

const Governance = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      
      <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Governance</h1>
            <p className="text-muted-foreground">Participate in protocol decisions by voting on proposals</p>
          </div>

          {/* Voting Power Card */}
          <Card className="glass-card shadow-glow mb-8">
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Your Voting Power</h2>
                  <p className="text-muted-foreground">
                    Stake LATAM tokens to increase your voting influence
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-4xl font-bold text-primary mb-1">1,250 Votes</div>
                  <div className="text-sm text-muted-foreground">From staked LATAM tokens</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Active Proposals */}
          <div className="space-y-6 mb-8">
            {mockProposals.map((proposal) => {
              const totalVotes = proposal.votesFor + proposal.votesAgainst;
              const forPercentage = (proposal.votesFor / totalVotes) * 100;
              const againstPercentage = (proposal.votesAgainst / totalVotes) * 100;

              return (
                <Card key={proposal.id} className="glass-card shadow-card">
                  <CardHeader>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className="bg-success/20 text-success border-success/50">
                            {proposal.status}
                          </Badge>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            {proposal.endsIn}
                          </div>
                        </div>
                        <CardTitle className="text-2xl mb-2">{proposal.title}</CardTitle>
                        <CardDescription>{proposal.description}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="flex items-center gap-2 text-success">
                          <ThumbsUp className="h-4 w-4" />
                          For: {proposal.votesFor.toLocaleString()} ({forPercentage.toFixed(1)}%)
                        </span>
                        <span className="flex items-center gap-2 text-destructive">
                          <ThumbsDown className="h-4 w-4" />
                          Against: {proposal.votesAgainst.toLocaleString()} ({againstPercentage.toFixed(1)}%)
                        </span>
                      </div>
                      <Progress value={forPercentage} className="h-3" />
                    </div>

                    <div className="flex gap-4">
                      <Button className="flex-1 bg-success/20 hover:bg-success/30 text-success border border-success/50">
                        <ThumbsUp className="mr-2 h-4 w-4" />
                        Vote For
                      </Button>
                      <Button className="flex-1 bg-destructive/20 hover:bg-destructive/30 text-destructive border border-destructive/50">
                        <ThumbsDown className="mr-2 h-4 w-4" />
                        Vote Against
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Delegate Section */}
          <Card className="glass-card shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Delegate Voting Power
              </CardTitle>
              <CardDescription>
                Delegate your votes to a trusted community member or validator
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4">
                <input
                  type="text"
                  placeholder="Enter delegate address (0x...)"
                  className="flex-1 px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <Button className="gradient-hero">
                  Delegate Votes
                </Button>
              </div>
              <p className="text-sm text-muted-foreground mt-4">
                Delegating allows experienced community members to vote on your behalf. You can revoke delegation at any time.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Governance;
