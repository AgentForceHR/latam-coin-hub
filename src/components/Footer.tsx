import { Link } from "react-router-dom";
import { Twitter, Send, FileText, Book } from "lucide-react";

const Footer = () => {
  return (
    <footer className="border-t border-border bg-card/50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg gradient-hero" />
              <span className="text-lg font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                LATAM DeFi
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              Empowering Latin American finance through decentralized stablecoins and DeFi protocols.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Protocol</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link to="/dashboard" className="hover:text-foreground transition-colors">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link to="/earn" className="hover:text-foreground transition-colors">
                  Earn Yields
                </Link>
              </li>
              <li>
                <Link to="/borrow" className="hover:text-foreground transition-colors">
                  Borrow
                </Link>
              </li>
              <li>
                <Link to="/governance" className="hover:text-foreground transition-colors">
                  Governance
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Resources</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a href="#" className="hover:text-foreground transition-colors flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Whitepaper
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-foreground transition-colors flex items-center gap-2">
                  <Book className="h-4 w-4" />
                  Documentation
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Community</h3>
            <div className="flex space-x-4">
              <a
                href="#"
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Telegram"
              >
                <Send className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border text-center text-sm text-muted-foreground">
          <p>© 2025 LATAM DeFi. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
