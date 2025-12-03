import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { LogOut, Home, Plus } from 'lucide-react';
import Logo from '@/components/Logo';

const Header = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="border-b bg-card/95 backdrop-blur-md sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <button 
            onClick={() => navigate(user ? '/dashboard' : '/')}
            className="hover:opacity-80 transition-opacity"
          >
            <Logo size="sm" />
          </button>

          {user && (
            <nav className="flex items-center gap-1">
              <Button 
                variant={isActive('/dashboard') ? 'secondary' : 'ghost'} 
                size="sm"
                onClick={() => navigate('/dashboard')}
                className="gap-2"
              >
                <Home className="w-4 h-4" />
                <span className="hidden sm:inline">Dashboard</span>
              </Button>
              <Button 
                variant={isActive('/add-pet') ? 'secondary' : 'ghost'} 
                size="sm"
                onClick={() => navigate('/add-pet')}
                className="gap-2"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Add Pet</span>
              </Button>
              <div className="w-px h-6 bg-border mx-2 hidden sm:block" />
              <Button variant="ghost" size="sm" onClick={handleSignOut} className="gap-2 text-muted-foreground hover:text-foreground">
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Sign Out</span>
              </Button>
            </nav>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
