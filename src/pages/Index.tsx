import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Shield, QrCode, Activity, ChevronRight, Sparkles, Heart, Star } from 'lucide-react';
import { useEffect } from 'react';
import LoadingSpinner from '@/components/ui/loading-spinner';
import Logo from '@/components/Logo';
import SEOHead from '@/components/seo/SEOHead';

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      navigate('/dashboard');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const features = [
    {
      icon: <Heart className="w-6 h-6" />,
      title: 'Complete Health Profiles',
      description: 'Track vaccinations, allergies, medical history, and more for all your pets.',
    },
    {
      icon: <QrCode className="w-6 h-6" />,
      title: 'Emergency QR Access',
      description: 'Generate QR codes for instant access to critical pet information in emergencies.',
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: 'Secure & Private',
      description: 'Your pet data is encrypted and only accessible to you and emergency responders.',
    },
    {
      icon: <Activity className="w-6 h-6" />,
      title: 'Health Timeline',
      description: 'Comprehensive timeline of all health events, visits, and treatments.',
    },
  ];

  return (
    <>
      <SEOHead 
        title="PetRepo - Intelligent Pet Health Management System"
        description="Keep your pets healthy with comprehensive health tracking, emergency QR codes, vaccination reminders, and smart health management for dogs and cats."
        keywords="pet health, dog health tracker, cat health management, emergency pet QR code, pet vaccination tracker, pet medical records, pet care app"
      />
      
      <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/10">
        {/* Hero Section */}
        <header className="relative overflow-hidden" role="banner">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,hsl(var(--primary)/0.1),transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,hsl(var(--accent)/0.1),transparent_50%)]" />
          
          <div className="container mx-auto px-4 py-6 relative">
            <nav className="flex items-center justify-between" aria-label="Main navigation">
              <Logo />
              <div className="flex gap-3">
                <Button variant="ghost" onClick={() => navigate('/auth')}>
                  Sign In
                </Button>
                <Button onClick={() => navigate('/auth')} className="shadow-md shadow-primary/20">
                  Get Started
                </Button>
              </div>
            </nav>
          </div>

          <div className="container mx-auto px-4 py-20 md:py-32 relative">
            <div className="max-w-3xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8 border border-primary/20">
                <Sparkles className="w-4 h-4" />
                <span>Intelligent Pet Health Management</span>
              </div>
              
              <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
                Keep Your Pets{' '}
                <span className="bg-gradient-to-r from-primary via-primary-light to-accent bg-clip-text text-transparent">
                  Healthy & Safe
                </span>
              </h1>
              
              <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
                A comprehensive health record system for your furry friends. Track medical history, 
                generate emergency QR codes, and never miss an important health milestone.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  size="lg" 
                  onClick={() => navigate('/auth')}
                  className="text-lg px-8 h-14 shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all"
                >
                  Start Free Today
                  <ChevronRight className="w-5 h-5 ml-2" />
                </Button>
                <Button 
                  size="lg" 
                  variant="outline"
                  className="text-lg px-8 h-14"
                  onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  Learn More
                </Button>
              </div>
              
              {/* Trust badges */}
              <div className="flex items-center justify-center gap-2 mt-8 text-sm text-muted-foreground">
                <div className="flex -space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  ))}
                </div>
                <span>Trusted by 5,000+ pet parents</span>
              </div>
            </div>
          </div>

          <div className="absolute -bottom-px left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
        </header>

        {/* Features Section */}
        <main>
          <section id="features" className="py-20 md:py-32" aria-labelledby="features-heading">
            <div className="container mx-auto px-4">
              <div className="text-center mb-16">
                <h2 id="features-heading" className="text-3xl md:text-4xl font-bold mb-4">
                  Everything You Need for Pet Health
                </h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                From daily health tracking to emergency preparedness, PetRepo has you covered.
              </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
                {features.map((feature, index) => (
                  <Card 
                    key={index} 
                    className="border-border/50 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 group bg-card/50 backdrop-blur-sm"
                  >
                    <CardContent className="pt-6">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 text-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                        {feature.icon}
                      </div>
                      <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                      <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </section>

          {/* How it Works */}
          <section className="py-16 bg-muted/30" aria-labelledby="how-it-works-heading">
            <div className="container mx-auto px-4">
              <h2 id="how-it-works-heading" className="text-3xl font-bold text-center mb-12">How It Works</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
                {[
                  { step: '1', title: 'Create Profile', desc: 'Add your pet\'s basic info and medical details' },
                  { step: '2', title: 'Get QR Code', desc: 'Generate a unique emergency QR code for your pet' },
                  { step: '3', title: 'Stay Protected', desc: 'Anyone can scan to view emergency info instantly' },
                ].map((item, i) => (
                  <div key={i} className="text-center">
                    <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground text-xl font-bold flex items-center justify-center mx-auto mb-4">
                      {item.step}
                    </div>
                    <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                    <p className="text-muted-foreground text-sm">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Stats Section */}
          <section className="py-16" aria-label="Statistics">
            <div className="container mx-auto px-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto text-center">
                {[
                  { value: '10K+', label: 'Happy Pets' },
                  { value: '5K+', label: 'Pet Parents' },
                  { value: '99.9%', label: 'Uptime' },
                  { value: '24/7', label: 'Emergency Access' },
                ].map((stat, i) => (
                  <div key={i}>
                    <p className="text-3xl md:text-4xl font-bold text-primary mb-1">{stat.value}</p>
                    <p className="text-muted-foreground text-sm">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="py-20" aria-labelledby="cta-heading">
            <div className="container mx-auto px-4">
              <div className="max-w-4xl mx-auto bg-gradient-to-r from-primary via-primary-dark to-accent rounded-3xl p-12 md:p-16 text-center text-primary-foreground shadow-2xl shadow-primary/20 relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,white/10,transparent_50%)]" />
                <div className="relative">
                  <h2 id="cta-heading" className="text-3xl md:text-4xl font-bold mb-4">
                    Ready to Protect Your Pets?
                  </h2>
                  <p className="text-lg mb-8 opacity-90 max-w-xl mx-auto">
                    Join thousands of pet owners who trust PetRepo for their pet's health management.
                  </p>
                  <Button 
                    size="lg" 
                    variant="secondary"
                    onClick={() => navigate('/auth')}
                    className="text-lg px-10 h-14 shadow-lg"
                  >
                    Create Free Account
                    <ChevronRight className="w-5 h-5 ml-2" />
                  </Button>
                </div>
              </div>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="py-8 border-t bg-card/30" role="contentinfo">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <Logo size="sm" />
              <p className="text-sm text-muted-foreground">
                © {new Date().getFullYear()} PetRepo. All rights reserved.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
};

export default Index;
