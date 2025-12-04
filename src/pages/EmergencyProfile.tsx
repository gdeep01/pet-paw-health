import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Heart, Phone, Syringe, Calendar, Droplet, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { differenceInYears, differenceInMonths, format } from 'date-fns';
import LoadingSpinner from '@/components/ui/loading-spinner';
import SEOHead from '@/components/seo/SEOHead';

interface Pet {
  id: string;
  pet_name: string;
  species: string;
  breed: string | null;
  date_of_birth: string;
  known_allergies: string | null;
  blood_group: string | null;
  pet_photo_url: string | null;
  unique_pet_id: string;
  vet_name: string | null;
  vet_phone: string | null;
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  chronic_conditions: string | null;
}

interface LastVaccination {
  vaccine_name: string;
  date_given: string;
}

const EmergencyProfile = () => {
  const { petId } = useParams();
  const [pet, setPet] = useState<Pet | null>(null);
  const [lastVaccination, setLastVaccination] = useState<LastVaccination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (petId) {
      fetchPetData();
    }
  }, [petId]);

  const fetchPetData = async () => {
    if (!petId) return;

    try {
      // Fetch pet data
      const { data: petData, error: petError } = await supabase
        .from('pets')
        .select('*')
        .eq('unique_pet_id', petId)
        .single();

      if (petError) throw petError;
      setPet(petData);

      // Fetch last vaccination
      if (petData?.id) {
        const { data: vaxData } = await supabase
          .from('vaccinations')
          .select('vaccine_name, date_given')
          .eq('pet_id', petData.id)
          .order('date_given', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (vaxData) {
          setLastVaccination(vaxData);
        }
      }
    } catch (error) {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const calculateAge = (dob: string) => {
    const birthDate = new Date(dob);
    const today = new Date();
    const years = differenceInYears(today, birthDate);
    const months = differenceInMonths(today, birthDate) % 12;
    
    if (years === 0) {
      return `${months} month${months !== 1 ? 's' : ''} old`;
    }
    return months > 0 ? `${years}y ${months}m old` : `${years} years old`;
  };

  const getSpeciesEmoji = (species: string) => {
    return species.toLowerCase() === 'dog' ? '🐕' : '🐱';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-destructive/5 via-background to-destructive/5">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !pet) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-destructive/5 via-background to-destructive/5 p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-8 pb-8 text-center">
            <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-destructive" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Pet Not Found</h2>
            <p className="text-muted-foreground">
              This emergency profile could not be found. The QR code may be invalid or expired.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <SEOHead 
        title={`${pet.pet_name} - Emergency Pet Profile | PetPaw`}
        description={`Emergency health profile for ${pet.pet_name}. View allergies, medical conditions, and emergency contacts.`}
        noIndex={true}
      />
      
      <div className="min-h-screen bg-gradient-to-br from-destructive/10 via-background to-destructive/5">
        {/* Emergency Header */}
        <div className="bg-destructive text-destructive-foreground py-4 px-4 shadow-lg">
          <div className="container mx-auto max-w-2xl">
            <div className="flex items-center justify-center gap-3">
              <AlertTriangle className="w-6 h-6 animate-pulse" />
              <h1 className="text-xl font-bold tracking-wide">EMERGENCY PET PROFILE</h1>
              <AlertTriangle className="w-6 h-6 animate-pulse" />
            </div>
          </div>
        </div>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Pet Header */}
        <Card className="mb-6 overflow-hidden border-2 border-destructive/20 shadow-xl">
          <div className="bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 p-6">
            <div className="flex items-center gap-4">
              {pet.pet_photo_url ? (
                <div className="w-24 h-24 rounded-2xl overflow-hidden border-4 border-card shadow-lg flex-shrink-0">
                  <img src={pet.pet_photo_url} alt={pet.pet_name} className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="w-24 h-24 rounded-2xl bg-card border-4 border-muted flex items-center justify-center text-5xl shadow-lg">
                  {getSpeciesEmoji(pet.species)}
                </div>
              )}
              <div className="flex-1">
                <h2 className="text-3xl font-bold mb-1">{pet.pet_name}</h2>
                <p className="text-muted-foreground text-lg">{pet.breed || pet.species}</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  <Badge variant="secondary" className="text-sm">
                    <Calendar className="w-3 h-3 mr-1" />
                    {calculateAge(pet.date_of_birth)}
                  </Badge>
                  {pet.blood_group && (
                    <Badge variant="outline" className="text-sm bg-card">
                      <Droplet className="w-3 h-3 mr-1" />
                      {pet.blood_group}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Critical Medical Info */}
        {(pet.known_allergies || pet.chronic_conditions) && (
          <Card className="mb-6 border-2 border-[hsl(var(--warning))]/50 bg-[hsl(var(--warning))]/5">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-[hsl(var(--warning))]">
                <AlertTriangle className="w-5 h-5" />
                CRITICAL MEDICAL INFORMATION
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {pet.known_allergies && (
                <div className="p-4 rounded-lg bg-card border border-[hsl(var(--warning))]/30">
                  <p className="font-bold text-[hsl(var(--warning))] mb-2 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    ALLERGIES
                  </p>
                  <p className="text-foreground">{pet.known_allergies}</p>
                </div>
              )}
              
              {pet.chronic_conditions && (
                <div className="p-4 rounded-lg bg-card border">
                  <p className="font-bold mb-2 flex items-center gap-2">
                    <Syringe className="w-4 h-4" />
                    CHRONIC CONDITIONS
                  </p>
                  <p className="text-foreground">{pet.chronic_conditions}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Last Vaccination Info */}
        {lastVaccination && (
          <Card className="mb-6 border border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-primary">
                <Syringe className="w-5 h-5" />
                LAST VACCINATION
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-4 rounded-lg bg-muted/50">
                <p className="font-semibold text-lg">{lastVaccination.vaccine_name}</p>
                <p className="text-muted-foreground">
                  Given on {format(new Date(lastVaccination.date_given), 'MMMM d, yyyy')}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Emergency Contact */}
        {(pet.emergency_contact_name || pet.emergency_contact_phone) && (
          <Card className="mb-6 border-2 border-primary/30">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-primary">
                <Phone className="w-5 h-5" />
                EMERGENCY CONTACT
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {pet.emergency_contact_name && (
                  <p className="text-lg">
                    <span className="text-muted-foreground">Name: </span>
                    <strong>{pet.emergency_contact_name}</strong>
                  </p>
                )}
                {pet.emergency_contact_phone && (
                  <a 
                    href={`tel:${pet.emergency_contact_phone}`} 
                    className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl text-lg font-semibold hover:bg-primary/90 transition-colors shadow-lg"
                  >
                    <Phone className="w-5 h-5" />
                    Call: {pet.emergency_contact_phone}
                  </a>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Veterinarian */}
        {(pet.vet_name || pet.vet_phone) && (
          <Card className="mb-6 border border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-accent">
                <Syringe className="w-5 h-5" />
                VETERINARIAN
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {pet.vet_name && (
                  <p className="text-lg">
                    <span className="text-muted-foreground">Clinic: </span>
                    <strong>{pet.vet_name}</strong>
                  </p>
                )}
                {pet.vet_phone && (
                  <a 
                    href={`tel:${pet.vet_phone}`} 
                    className="inline-flex items-center gap-2 px-6 py-3 bg-accent text-accent-foreground rounded-xl text-lg font-semibold hover:bg-accent/90 transition-colors"
                  >
                    <Phone className="w-5 h-5" />
                    Call Vet: {pet.vet_phone}
                  </a>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Pet ID */}
        <div className="text-center py-6">
          <p className="text-xs text-muted-foreground mb-2">Pet ID</p>
          <code className="px-4 py-2 bg-muted rounded-lg font-mono text-sm">{pet.unique_pet_id}</code>
        </div>

        {/* Footer */}
        <div className="text-center pt-4 pb-8 border-t">
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <svg viewBox="0 0 24 24" className="w-4 h-4 text-primary" fill="currentColor">
              <ellipse cx="12" cy="15" rx="5" ry="4.5" />
              <ellipse cx="6.5" cy="8" rx="2.5" ry="3" />
              <ellipse cx="17.5" cy="8" rx="2.5" ry="3" />
              <ellipse cx="8" cy="11.5" rx="2" ry="2.5" />
              <ellipse cx="16" cy="11.5" rx="2" ry="2.5" />
            </svg>
            <span className="text-sm">Powered by <strong>PetPaw</strong> Health System</span>
          </div>
        </div>
      </main>
    </div>
    </>
  );
};

export default EmergencyProfile;
