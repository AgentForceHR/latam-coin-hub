import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Wallet, Menu } from "lucide-react";
import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useLanguage } from "@/contexts/LanguageContext";
import LanguageSwitcher from "./LanguageSwitcher";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useLanguage();

  const navLinks = [
    { name: t("dashboard"), href: "/dashboard" },
    { name: t("earn"), href: "/earn" },
    { name: t("borrow"), href: "/borrow" },
    { name: t("governance"), href: "/governance" },
  ];

  return (
    <nav className="fixed top-0 w-full z-50 glass-card border-b border-border">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg gradient-hero" />
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              LATAM DeFi
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                {link.name}
              </Link>
            ))}
            <LanguageSwitcher />
            <Button variant="default" className="gradient-hero">
              <Wallet className="mr-2 h-4 w-4" />
              {t("connectWallet")}
            </Button>
          </div>

          {/* Mobile Navigation */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent>
              <div className="flex flex-col space-y-4 mt-8">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    to={link.href}
                    onClick={() => setIsOpen(false)}
                    className="text-lg text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.name}
                  </Link>
                ))}
                <div className="flex items-center gap-2">
                  <LanguageSwitcher />
                  <span className="text-sm text-muted-foreground">Language</span>
                </div>
                <Button variant="default" className="gradient-hero w-full">
                  <Wallet className="mr-2 h-4 w-4" />
                  {t("connectWallet")}
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
