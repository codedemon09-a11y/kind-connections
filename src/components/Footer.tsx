import React from 'react';
import { Link } from 'react-router-dom';
import { Gamepad2, Mail, Phone, Shield, AlertTriangle } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="border-t border-border/50 bg-card/50 mt-auto">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center border border-primary/30">
                <Gamepad2 className="w-5 h-5 text-primary" />
              </div>
              <span className="font-display font-bold text-xl text-gradient">
                BattleArena
              </span>
            </Link>
            <p className="text-sm text-muted-foreground">
              India's trusted esports tournament platform for BGMI & Free Fire.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="font-display font-semibold text-foreground">Quick Links</h4>
            <nav className="flex flex-col gap-2 text-sm">
              <Link to="/tournaments" className="text-muted-foreground hover:text-primary transition-colors">
                All Tournaments
              </Link>
              <Link to="/rules" className="text-muted-foreground hover:text-primary transition-colors">
                Rules & Guidelines
              </Link>
              <Link to="/how-it-works" className="text-muted-foreground hover:text-primary transition-colors">
                How It Works
              </Link>
            </nav>
          </div>

          {/* Legal */}
          <div className="space-y-4">
            <h4 className="font-display font-semibold text-foreground">Legal</h4>
            <nav className="flex flex-col gap-2 text-sm">
              <Link to="/terms" className="text-muted-foreground hover:text-primary transition-colors">
                Terms of Service
              </Link>
              <Link to="/privacy" className="text-muted-foreground hover:text-primary transition-colors">
                Privacy Policy
              </Link>
              <Link to="/refund" className="text-muted-foreground hover:text-primary transition-colors">
                Refund Policy
              </Link>
            </nav>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h4 className="font-display font-semibold text-foreground">Contact</h4>
            <div className="flex flex-col gap-3 text-sm">
              <a href="mailto:support@battlearena.com" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                <Mail className="w-4 h-4" />
                support@battlearena.com
              </a>
              <a href="tel:+919876543210" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                <Phone className="w-4 h-4" />
                +91 98765 43210
              </a>
            </div>
          </div>
        </div>

        {/* Disclaimers */}
        <div className="mt-10 pt-8 border-t border-border/50 space-y-4">
          <div className="flex items-start gap-3 p-4 rounded-lg bg-secondary/30 border border-border/50">
            <Shield className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
            <div className="text-xs text-muted-foreground space-y-1">
              <p className="font-semibold text-foreground">Skill-Based Gaming Platform</p>
              <p>This platform hosts skill-based esports tournaments. Winning depends on player skill, not chance. This is not a gambling or betting platform.</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3 p-4 rounded-lg bg-secondary/30 border border-border/50">
            <AlertTriangle className="w-5 h-5 text-warning mt-0.5 flex-shrink-0" />
            <div className="text-xs text-muted-foreground space-y-1">
              <p className="font-semibold text-foreground">Disclaimer</p>
              <p>We are not affiliated with BGMI, Krafton, Garena, or Free Fire. All game trademarks belong to their respective owners. Entry fees are non-refundable once the match has started.</p>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-6 border-t border-border/50 text-center text-xs text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} BattleArena. All rights reserved.</p>
          <p className="mt-1">The platform reserves the right to modify, cancel, or disqualify players to ensure fair play.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
