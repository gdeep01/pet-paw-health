import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Heart, Phone, Syringe } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

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

const EmergencyProfile = () => {
  const { petId } = useParams();
  const [pet, setPet] = useState<Pet | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetchPet();
  }, [petId]);

  const fetchPet = async () => {
    if (!petId) return;

    try {
      const { data, error } = await supabase
        .from('pets')
        .select('*')
        .eq('unique_pet_id', petId)
        .single();

      if (error) throw error;
      setPet(data);
    } catch (error) {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const calculateAge = (dob: string) => {
    const birthDate = new Date(dob);
    const today = new Date();
    const years = today.getFullYear() - birthDate.getFullYear();
    
    if (years === 0) {
      const months = today.getMonth() - birthDate.getMonth();
      return `${months} month${months !== 1 ? 's' : ''} old`;
    }
    return `${years} year${years !== 1 ? 's' : ''} old`;
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary/5 via-accent/5 to-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !pet) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary/5 via-accent/5 to-background p-4">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Pet Not Found</h2>
            <p className="text-muted-foreground">
              This emergency profile could not be found. Please verify the QR code.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-destructive/10 via-warning/10 to-background">
      <div className="bg-destructive text-destructive-foreground py-3">
        <div className="container mx-auto px-4">
          <p className="text-center font-semibold flex items-center justify-center gap-2">
            <AlertCircle className="w-5 h-5" />
            EMERGENCY PET PROFILE
          </p>
        </div>
      </div>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <Card className="border-destructive/20 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-primary/5 to-accent/5">
            <div className="flex items-start gap-4">
              {pet.pet_photo_url ? (
                <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-primary/30">
                  <img 
                    src={pet.pet_photo_url} 
                    alt={pet.pet_name}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-24 h-24 rounded-full bg-primary/10 border-4 border-primary/30 flex items-center justify-center">
                  <Heart className="w-10 h-10 text-primary" />
                </div>
              )}
              <div className="flex-1">
                <CardTitle className="text-3xl">{pet.pet_name}</CardTitle>
                <CardDescription className="text-lg mt-1">
                  {pet.breed || pet.species} • {calculateAge(pet.date_of_birth)}
                </CardDescription>
                <div className="mt-2">
                  <Badge variant="outline" className="font-mono text-xs">
                    ID: {pet.unique_pet_id}
                  </Badge>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            {/* Critical Information */}
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
              <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-destructive" />
                Critical Information
              </h3>
              <div className="space-y-2 text-sm">
                {pet.blood_group && (
                  <p><span className="font-semibold">Blood Group:</span> {pet.blood_group}</p>
                )}
                {pet.known_allergies && (
                  <div className="bg-warning/10 border border-warning/20 rounded p-2 mt-2">
                    <p className="font-semibold text-warning-foreground">⚠️ Known Allergies:</p>
                    <p className="mt-1">{pet.known_allergies}</p>
                  </div>
                )}
                {pet.chronic_conditions && (
                  <div className="bg-muted rounded p-2 mt-2">
                    <p className="font-semibold">Chronic Conditions:</p>
                    <p className="mt-1">{pet.chronic_conditions}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Emergency Contact */}
            {(pet.emergency_contact_name || pet.emergency_contact_phone) && (
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                  <Phone className="w-5 h-5 text-primary" />
                  Emergency Contact
                </h3>
                <div className="space-y-1 text-sm">
                  {pet.emergency_contact_name && (
                    <p><span className="font-semibold">Name:</span> {pet.emergency_contact_name}</p>
                  )}
                  {pet.emergency_contact_phone && (
                    <p>
                      <span className="font-semibold">Phone:</span>{' '}
                      <a href={`tel:${pet.emergency_contact_phone}`} className="text-primary hover:underline">
                        {pet.emergency_contact_phone}
                      </a>
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Veterinarian */}
            {(pet.vet_name || pet.vet_phone) && (
              <div className="bg-accent/5 border border-accent/20 rounded-lg p-4">
                <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                  <Syringe className="w-5 h-5 text-accent" />
                  Veterinarian
                </h3>
                <div className="space-y-1 text-sm">
                  {pet.vet_name && (
                    <p><span className="font-semibold">Name:</span> {pet.vet_name}</p>
                  )}
                  {pet.vet_phone && (
                    <p>
                      <span className="font-semibold">Phone:</span>{' '}
                      <a href={`tel:${pet.vet_phone}`} className="text-accent hover:underline">
                        {pet.vet_phone}
                      </a>
                    </p>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            This is an emergency profile for <strong>{pet.pet_name}</strong>
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Powered by PetPaw Health Management System
          </p>
        </div>
      </main>
    </div>
  );
};

export default EmergencyProfile;
