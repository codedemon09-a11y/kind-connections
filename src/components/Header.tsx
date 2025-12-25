import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { NotificationToggle } from '@/components/NotificationToggle';
import { 
  Menu, 
  X, 
  Gamepad2, 
  Wallet, 
  User, 
  LogOut, 
  Shield,
  Home,
  Trophy,
  History,
  Sparkles,
  Zap
} from 'lucide-react';

const Header: React.FC = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const location = useLocation();

  const navItems = [
    { label: 'Home', href: '/', icon: Home },
    { label: 'Tournaments', href: '/tournaments', icon: Gamepad2 },
    { label: 'Leaderboard', href: '/leaderboard', icon: Trophy },
    ...(isAuthenticated ? [
      { label: 'Wallet', href: '/wallet', icon: Wallet },
      { label: 'History', href: '/match-history', icon: History },
    ] : []),
    ...(isAdmin ? [{ label: 'Admin', href: '/admin', icon: Shield }] : []),
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-primary/20 bg-background/90 backdrop-blur-xl">
      {/* Animated top border */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />
      
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-primary/30 to-neon-pink/30 flex items-center justify-center border border-primary/50 group-hover:glow-primary transition-all duration-500">
            <Gamepad2 className="w-5 h-5 text-primary group-hover:scale-110 transition-transform duration-300" />
            <div className="absolute -inset-1 rounded-xl bg-primary/20 blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10" />
          </div>
          <div className="hidden sm:flex flex-col">
            <span className="font-display font-bold text-xl text-gradient tracking-wider">
              BattleArena
            </span>
            <span className="text-[10px] text-muted-foreground tracking-widest uppercase">
              Esports Platform
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className={`relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 group ${
                isActive(item.href)
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {isActive(item.href) && (
                <div className="absolute inset-0 rounded-lg bg-primary/10 border border-primary/30" />
              )}
              <item.icon className={`w-4 h-4 relative z-10 ${isActive(item.href) ? 'animate-glow-pulse' : 'group-hover:text-primary'} transition-colors duration-300`} />
              <span className="relative z-10">{item.label}</span>
              {!isActive(item.href) && (
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-[2px] bg-primary group-hover:w-3/4 transition-all duration-300" />
              )}
            </Link>
          ))}
        </nav>

        {/* Auth Buttons */}
        <div className="hidden md:flex items-center gap-3">
          <NotificationToggle />
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <Link to="/profile">
                <Button variant="ghost" size="sm" className="gap-2 border border-transparent hover:border-primary/30 hover:bg-primary/5">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-neon-pink flex items-center justify-center">
                    <User className="w-3 h-3 text-primary-foreground" />
                  </div>
                  <span className="max-w-[100px] truncate">{user?.displayName || user?.email?.split('@')[0] || 'Player'}</span>
                </Button>
              </Link>
              <Button 
                variant="outline" 
                size="icon" 
                onClick={logout}
                className="border-destructive/30 hover:bg-destructive/10 hover:border-destructive/50 hover:text-destructive"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <Link to="/login">
              <Button size="sm" className="gap-2 glow-primary hover:glow-primary-intense transition-all duration-300">
                <Zap className="w-4 h-4" />
                Join Now
              </Button>
            </Link>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2 rounded-lg hover:bg-primary/10 border border-transparent hover:border-primary/30 transition-all duration-300"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X className="w-6 h-6 text-primary" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-primary/20 bg-background/98 backdrop-blur-xl animate-slide-up">
          <nav className="container py-4 space-y-1">
            {navItems.map((item, index) => (
              <Link
                key={item.href}
                to={item.href}
                onClick={() => setIsMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 animate-slide-up ${
                  isActive(item.href)
                    ? 'bg-primary/10 text-primary border border-primary/30'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50 border border-transparent'
                }`}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <item.icon className={`w-5 h-5 ${isActive(item.href) ? 'text-primary' : ''}`} />
                {item.label}
              </Link>
            ))}
            <div className="pt-3 mt-3 border-t border-primary/20">
              {isAuthenticated ? (
                <>
                  <Link
                    to="/profile"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/50 border border-transparent transition-all duration-300"
                  >
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-neon-pink flex items-center justify-center">
                      <User className="w-3 h-3 text-primary-foreground" />
                    </div>
                    Profile
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      setIsMenuOpen(false);
                    }}
                    className="flex w-full items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-destructive hover:bg-destructive/10 border border-transparent transition-all duration-300"
                  >
                    <LogOut className="w-5 h-5" />
                    Logout
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setIsMenuOpen(false)}
                  className="block"
                >
                  <Button className="w-full gap-2 glow-primary">
                    <Zap className="w-4 h-4" />
                    Join Now
                  </Button>
                </Link>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;