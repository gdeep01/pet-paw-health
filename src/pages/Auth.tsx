import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Mail, Lock, User, ArrowRight, Loader2, Eye, EyeOff, Check } from 'lucide-react';
import Logo from '@/components/Logo';
import SEOHead from '@/components/seo/SEOHead';
import { cn } from '@/lib/utils';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const getPasswordStrength = (pass: string) => {
    if (pass.length === 0) return { strength: 0, label: '' };
    if (pass.length < 6) return { strength: 1, label: 'Too short' };
    let score = 0;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;
    if (score <= 1) return { strength: 1, label: 'Weak' };
    if (score === 2) return { strength: 2, label: 'Fair' };
    if (score === 3) return { strength: 3, label: 'Good' };
    return { strength: 4, label: 'Strong' };
  };

  const passwordStrength = getPasswordStrength(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) {
          toast({
            title: 'Login Failed',
            description: error.message,
            variant: 'destructive',
          });
        } else {
          toast({
            title: 'Welcome back!',
            description: 'Successfully logged in.',
          });
          navigate('/dashboard');
        }
      } else {
        const { error } = await signUp(email, password, fullName);
        if (error) {
          toast({
            title: 'Sign Up Failed',
            description: error.message,
            variant: 'destructive',
          });
        } else {
          toast({
            title: 'Account Created!',
            description: 'Welcome to PetPaw.',
          });
          navigate('/dashboard');
        }
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'An unexpected error occurred',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const features = [
    'Complete health profiles for all your pets',
    'Emergency QR codes for instant access',
    'Track vaccinations and medical history',
    'Secure and private data storage',
  ];

  return (
    <>
      <SEOHead 
        title={isLogin ? 'Sign In - PetPaw' : 'Create Account - PetPaw'}
        description="Sign in to PetPaw to manage your pet's health records, track vaccinations, and access emergency QR codes."
      />
      
      <div className="min-h-screen flex">
        {/* Left Panel */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary via-primary-dark to-accent p-12 items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-20 left-20 w-32 h-32 bg-white/20 rounded-full blur-3xl" />
            <div className="absolute bottom-32 right-20 w-48 h-48 bg-white/20 rounded-full blur-3xl" />
          </div>
          
          <div className="relative z-10 text-center text-primary-foreground max-w-md">
            <div className="w-24 h-24 bg-white/20 rounded-3xl flex items-center justify-center mx-auto mb-8 backdrop-blur-sm shadow-2xl">
              <svg viewBox="0 0 24 24" className="w-12 h-12 text-white" fill="currentColor">
                <ellipse cx="12" cy="15" rx="5" ry="4.5" />
                <ellipse cx="6.5" cy="8" rx="2.5" ry="3" />
                <ellipse cx="17.5" cy="8" rx="2.5" ry="3" />
                <ellipse cx="8" cy="11.5" rx="2" ry="2.5" />
                <ellipse cx="16" cy="11.5" rx="2" ry="2.5" />
              </svg>
            </div>
            <h1 className="text-4xl font-bold mb-4">PetPaw</h1>
            <p className="text-xl opacity-90 mb-10">Intelligent Pet Health Management</p>
            
            <div className="space-y-4 text-left">
              {features.map((feature, i) => (
                <div key={i} className="flex items-center gap-3 opacity-90">
                  <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-sm">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Panel */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-6 bg-background">
          <Card className="w-full max-w-md border-0 shadow-none lg:shadow-2xl lg:border bg-card">
            <CardHeader className="space-y-4 text-center pb-2">
              <div className="lg:hidden flex justify-center mb-2">
                <Logo size="lg" showText={false} />
              </div>
              <CardTitle className="text-2xl lg:text-3xl font-bold">
                {isLogin ? 'Welcome Back' : 'Create Account'}
              </CardTitle>
              <CardDescription className="text-base">
                {isLogin ? 'Sign in to access your pet health dashboard' : 'Start managing your pet\'s health today'}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="space-y-5">
                {!isLogin && (
                  <div className="space-y-2">
                    <Label htmlFor="fullName" className="text-sm font-medium">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        id="fullName"
                        type="text"
                        placeholder="John Doe"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required={!isLogin}
                        className="h-12 pl-11 bg-muted/50 border-muted-foreground/20 focus:bg-background transition-colors"
                      />
                    </div>
                  </div>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="h-12 pl-11 bg-muted/50 border-muted-foreground/20 focus:bg-background transition-colors"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                      className="h-12 pl-11 pr-11 bg-muted/50 border-muted-foreground/20 focus:bg-background transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  
                  {!isLogin && password.length > 0 && (
                    <div className="space-y-2 pt-1">
                      <div className="flex gap-1">
                        {[1, 2, 3, 4].map((level) => (
                          <div
                            key={level}
                            className={cn(
                              'h-1.5 flex-1 rounded-full transition-colors',
                              passwordStrength.strength >= level
                                ? level <= 1 ? 'bg-destructive'
                                : level <= 2 ? 'bg-orange-500'
                                : level <= 3 ? 'bg-yellow-500'
                                : 'bg-green-500'
                                : 'bg-muted'
                            )}
                          />
                        ))}
                      </div>
                      <p className={cn(
                        'text-xs',
                        passwordStrength.strength <= 1 ? 'text-destructive'
                        : passwordStrength.strength <= 2 ? 'text-orange-500'
                        : passwordStrength.strength <= 3 ? 'text-yellow-600'
                        : 'text-green-600'
                      )}>
                        {passwordStrength.label}
                      </p>
                    </div>
                  )}
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full h-12 text-base font-semibold shadow-lg shadow-primary/20 hover:shadow-xl transition-all" 
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      {isLogin ? 'Signing in...' : 'Creating account...'}
                    </>
                  ) : (
                    <>
                      {isLogin ? 'Sign In' : 'Create Account'}
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </>
                  )}
                </Button>
              </form>
              
              <div className="mt-8 text-center">
                <div className="relative mb-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="bg-card px-4 text-muted-foreground">
                      {isLogin ? 'New to PetPaw?' : 'Already have an account?'}
                    </span>
                  </div>
                </div>
                
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => { setIsLogin(!isLogin); setPassword(''); }}
                  className="w-full h-11"
                >
                  {isLogin ? 'Create an account' : 'Sign in instead'}
                </Button>
              </div>
              
              <p className="text-xs text-center text-muted-foreground mt-6">
                By continuing, you agree to our Terms of Service and Privacy Policy
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default Auth;
