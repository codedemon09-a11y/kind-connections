import React from 'react';
import { Link } from 'react-router-dom';
import { Gamepad2, Mail, Phone, Shield, AlertTriangle, Zap, Trophy, Heart } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="relative border-t border-primary/20 bg-card/50 mt-auto overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 cyber-lines opacity-5" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/5 rounded-full blur-[100px]" />
      <div className="absolute top-0 right-0 w-72 h-72 bg-neon-pink/5 rounded-full blur-[100px]" />
      
      <div className="container relative py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-primary/30 to-neon-pink/30 flex items-center justify-center border border-primary/50 group-hover:glow-primary transition-all duration-500">
                <Gamepad2 className="w-5 h-5 text-primary" />
              </div>
              <span className="font-display font-bold text-xl text-gradient">
                BattleArena
              </span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              India's premier esports tournament platform for BGMI & Free Fire champions.
            </p>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Zap className="w-4 h-4 text-primary" />
              <span>Powered by passion for gaming</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="font-display font-semibold text-foreground flex items-center gap-2">
              <Trophy className="w-4 h-4 text-primary" />
              Quick Links
            </h4>
            <nav className="flex flex-col gap-3 text-sm">
              {[
                { label: 'All Tournaments', href: '/tournaments' },
                { label: 'Rules & Guidelines', href: '/rules' },
                { label: 'How It Works', href: '/how-it-works' },
                { label: 'Leaderboard', href: '/leaderboard' }
              ].map((link) => (
                <Link 
                  key={link.href}
                  to={link.href} 
                  className="text-muted-foreground hover:text-primary transition-colors duration-300 flex items-center gap-2 group"
                >
                  <span className="w-1 h-1 rounded-full bg-primary/50 group-hover:bg-primary transition-colors duration-300" />
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Legal */}
          <div className="space-y-4">
            <h4 className="font-display font-semibold text-foreground flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary" />
              Legal
            </h4>
            <nav className="flex flex-col gap-3 text-sm">
              {[
                { label: 'Terms of Service', href: '/terms' },
                { label: 'Privacy Policy', href: '/privacy' },
                { label: 'Refund Policy', href: '/refund' },
                { label: 'Fair Play Policy', href: '/fair-play' }
              ].map((link) => (
                <Link 
                  key={link.href}
                  to={link.href} 
                  className="text-muted-foreground hover:text-primary transition-colors duration-300 flex items-center gap-2 group"
                >
                  <span className="w-1 h-1 rounded-full bg-primary/50 group-hover:bg-primary transition-colors duration-300" />
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h4 className="font-display font-semibold text-foreground flex items-center gap-2">
              <Mail className="w-4 h-4 text-primary" />
              Contact Us
            </h4>
            <div className="flex flex-col gap-3 text-sm">
              <a 
                href="mailto:support@battlearena.com" 
                className="flex items-center gap-3 text-muted-foreground hover:text-primary transition-colors duration-300 group"
              >
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors duration-300">
                  <Mail className="w-4 h-4 text-primary" />
                </div>
                support@battlearena.com
              </a>
              <a 
                href="tel:+919876543210" 
                className="flex items-center gap-3 text-muted-foreground hover:text-primary transition-colors duration-300 group"
              >
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors duration-300">
                  <Phone className="w-4 h-4 text-primary" />
                </div>
                +91 98765 43210
              </a>
            </div>
          </div>
        </div>

        {/* Disclaimers */}
        <div className="mt-12 pt-8 border-t border-primary/10 space-y-4">
          <div className="flex items-start gap-4 p-5 rounded-xl gaming-card border border-success/20">
            <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center flex-shrink-0">
              <Shield className="w-5 h-5 text-success" />
            </div>
            <div className="text-sm text-muted-foreground space-y-1">
              <p className="font-semibold text-foreground">Skill-Based Gaming Platform</p>
              <p>This platform hosts skill-based esports tournaments. Winning depends on player skill, not chance. This is not a gambling or betting platform.</p>
            </div>
          </div>
          
          <div className="flex items-start gap-4 p-5 rounded-xl gaming-card border border-warning/20">
            <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-5 h-5 text-warning" />
            </div>
            <div className="text-sm text-muted-foreground space-y-1">
              <p className="font-semibold text-foreground">Disclaimer</p>
              <p>We are not affiliated with BGMI, Krafton, Garena, or Free Fire. All game trademarks belong to their respective owners. Entry fees are non-refundable once the match has started.</p>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-6 border-t border-primary/10 text-center">
          <p className="text-sm text-muted-foreground flex items-center justify-center gap-2">
            Made with <Heart className="w-4 h-4 text-destructive fill-destructive" /> by BattleArena Team
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            &copy; {new Date().getFullYear()} BattleArena. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;