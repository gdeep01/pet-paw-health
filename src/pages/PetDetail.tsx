import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { QRCodeSVG } from 'qrcode.react';
import { useToast } from '@/hooks/use-toast';
import { 
  QrCode, Phone, AlertCircle, Heart, Calendar, Weight, 
  Download, ExternalLink, Syringe, Copy, Check, Edit, Trash2,
  AlertTriangle, ShieldAlert
} from 'lucide-react';
import { format, differenceInYears, differenceInMonths } from 'date-fns';
import PageContainer from '@/components/layout/PageContainer';
import LoadingSpinner from '@/components/ui/loading-spinner';
import QuickEditHealth from '@/components/pets/QuickEditHealth';
import QuickEditContacts from '@/components/pets/QuickEditContacts';
import VaccinationList from '@/components/vaccinations/VaccinationList';
import HealthTimeline from '@/components/timeline/HealthTimeline';
import VaccineSchedule from '@/components/vaccines/VaccineSchedule';
import { deletePetWithDependents, fetchPetWithVaccinations } from '@/lib/petService';
import { calculateHealthRisk, getRiskLevelStyle, type HealthRiskResult } from '@/lib/healthRisk';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface Pet {
  id: string;
  pet_name: string;
  species: string;
  breed: string | null;
  date_of_birth: string;
  weight_kg: number | null;
  is_indoor: boolean;
  known_allergies: string | null;
  blood_group: string | null;
  pet_photo_url: string | null;
  unique_pet_id: string;
  vet_name: string | null;
  vet_phone: string | null;
  vet_email: string | null;
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  chronic_conditions: string | null;
}

interface Vaccination {
  id: string;
  vaccine_name: string;
  date_given: string;
  next_due_date: string | null;
  vet_name: string | null;
  notes: string | null;
}

const PetDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [pet, setPet] = useState<Pet | null>(null);
  const [vaccinations, setVaccinations] = useState<Vaccination[]>([]);
  const [healthRisk, setHealthRisk] = useState<HealthRiskResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const qrRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user && id) {
      fetchPetData();
    }
  }, [id, user]);

  const fetchPetData = async () => {
    if (!user || !id) return;

    try {
      const { pet: petData, petError, vaccinations: vaxData } = await fetchPetWithVaccinations(id, user.id);

      if (petError) throw petError;
      if (!petData) {
        toast({
          title: 'Error',
          description: 'Pet not found or access denied.',
          variant: 'destructive',
        });
        navigate('/dashboard');
        return;
      }

      setPet(petData);
      setVaccinations(vaxData);

      // Calculate health risk
      const risk = calculateHealthRisk(petData, vaxData);
      setHealthRisk(risk);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Pet not found or access denied.',
        variant: 'destructive',
      });
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const deletePet = async () => {
    if (!pet || !user) return;
    
    try {
      const { error } = await deletePetWithDependents(pet.id, user.id);
      if (error) throw error;
      
      toast({
        title: 'Pet Deleted',
        description: `${pet.pet_name}'s profile and all associated records have been removed.`,
      });
      navigate('/dashboard');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
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
    return months > 0 ? `${years} years, ${months} months old` : `${years} years old`;
  };

  const getSpeciesEmoji = (species: string) => {
    return species.toLowerCase() === 'dog' ? '🐕' : '🐱';
  };

  const downloadQRCode = () => {
    const svg = qrRef.current?.querySelector('svg');
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width * 2;
      canvas.height = img.height * 2;
      ctx?.scale(2, 2);
      ctx?.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL('image/png');

      const downloadLink = document.createElement('a');
      downloadLink.download = `${pet?.pet_name}-Emergency-QR.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
  };

  const copyEmergencyUrl = async () => {
    if (!pet) return;
    const url = `${window.location.origin}/emergency/${pet.unique_pet_id}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({ title: 'Link copied!', description: 'Emergency profile URL copied to clipboard.' });
  };

  if (loading) {
    return (
      <PageContainer>
        <LoadingSpinner className="py-20" size="lg" />
      </PageContainer>
    );
  }

  if (!pet) return null;

  const emergencyUrl = `${window.location.origin}/emergency/${pet.unique_pet_id}`;
  const riskStyle = healthRisk ? getRiskLevelStyle(healthRisk.level) : null;

  return (
    <PageContainer className="max-w-6xl">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Pet Header Card */}
          <Card className="overflow-hidden border-border/50">
            <div className="h-32 bg-gradient-to-r from-primary/20 via-accent/20 to-primary/10" />
            <CardContent className="relative pt-0">
              <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-16">
                {/* Photo */}
                <div className="w-28 h-28 rounded-2xl overflow-hidden border-4 border-card bg-muted shadow-lg flex-shrink-0">
                  {pet.pet_photo_url ? (
                    <img src={pet.pet_photo_url} alt={pet.pet_name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-5xl">
                      {getSpeciesEmoji(pet.species)}
                    </div>
                  )}
                </div>
                
                {/* Info */}
                <div className="flex-1 pb-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <h1 className="text-2xl sm:text-3xl font-bold">{pet.pet_name}</h1>
                      <p className="text-muted-foreground">{pet.breed || pet.species} • {calculateAge(pet.date_of_birth)}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => navigate(`/pet/${pet.id}/edit`)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete {pet.pet_name}?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will permanently delete {pet.pet_name}'s health profile, vaccination records, and all associated data. This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={deletePet} className="bg-destructive hover:bg-destructive/90">
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {healthRisk && riskStyle && (
                      <Badge className={`${riskStyle.bgClassName} text-white`}>
                        {healthRisk.level === 'low' ? (
                          <Heart className="w-3 h-3 mr-1 fill-current" />
                        ) : healthRisk.level === 'medium' ? (
                          <AlertCircle className="w-3 h-3 mr-1" />
                        ) : (
                          <ShieldAlert className="w-3 h-3 mr-1" />
                        )}
                        {riskStyle.label}
                      </Badge>
                    )}
                    <Badge variant="secondary">{pet.is_indoor ? 'Indoor' : 'Outdoor'}</Badge>
                    {pet.blood_group && <Badge variant="outline">Blood: {pet.blood_group}</Badge>}
                  </div>
                </div>
              </div>

              {/* Health Risk Factors Alert */}
              {healthRisk && healthRisk.factors.length > 0 && healthRisk.level !== 'low' && (
                <div className={`mt-4 p-3 rounded-lg border ${
                  healthRisk.level === 'high' 
                    ? 'bg-destructive/10 border-destructive/30' 
                    : 'bg-[hsl(var(--warning))]/10 border-[hsl(var(--warning))]/30'
                }`}>
                  <p className={`text-sm font-medium mb-2 flex items-center gap-2 ${
                    healthRisk.level === 'high' ? 'text-destructive' : 'text-[hsl(var(--warning))]'
                  }`}>
                    <AlertTriangle className="w-4 h-4" />
                    Health Risk Factors
                  </p>
                  <ul className="text-xs space-y-1 text-muted-foreground">
                    {healthRisk.factors.map((factor, idx) => (
                      <li key={idx}>• {factor}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t">
                <div className="text-center">
                  <Calendar className="w-5 h-5 mx-auto text-muted-foreground mb-1" />
                  <p className="text-sm text-muted-foreground">Born</p>
                  <p className="font-semibold">{format(new Date(pet.date_of_birth), 'MMM d, yyyy')}</p>
                </div>
                <div className="text-center">
                  <Weight className="w-5 h-5 mx-auto text-muted-foreground mb-1" />
                  <p className="text-sm text-muted-foreground">Weight</p>
                  <p className="font-semibold">{pet.weight_kg ? `${pet.weight_kg} kg` : '—'}</p>
                </div>
                <div className="text-center">
                  <QrCode className="w-5 h-5 mx-auto text-muted-foreground mb-1" />
                  <p className="text-sm text-muted-foreground">Pet ID</p>
                  <p className="font-semibold font-mono text-xs">{pet.unique_pet_id.slice(0, 8)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Health Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Health Info with Quick Edit */}
            <Card className={`border-border/50 ${pet.known_allergies ? 'border-l-4 border-l-[hsl(var(--warning))]' : ''}`}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-[hsl(var(--warning))]" />
                    Health Information
                  </CardTitle>
                  <QuickEditHealth
                    petId={pet.id}
                    knownAllergies={pet.known_allergies}
                    chronicConditions={pet.chronic_conditions}
                    bloodGroup={pet.blood_group}
                    weightKg={pet.weight_kg}
                    onUpdate={fetchPetData}
                  />
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-xs text-muted-foreground">Allergies</p>
                  <p className="text-sm">{pet.known_allergies || 'None recorded'}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Chronic Conditions</p>
                  <p className="text-sm">{pet.chronic_conditions || 'None recorded'}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Contact Cards with Quick Edit */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="border-border/50">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Phone className="w-4 h-4 text-destructive" />
                    Emergency Contact
                  </CardTitle>
                  <QuickEditContacts
                    petId={pet.id}
                    type="emergency"
                    emergencyContactName={pet.emergency_contact_name}
                    emergencyContactPhone={pet.emergency_contact_phone}
                    onUpdate={fetchPetData}
                  />
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {pet.emergency_contact_name || pet.emergency_contact_phone ? (
                  <>
                    {pet.emergency_contact_name && (
                      <p className="text-sm"><span className="text-muted-foreground">Name:</span> {pet.emergency_contact_name}</p>
                    )}
                    {pet.emergency_contact_phone && (
                      <a href={`tel:${pet.emergency_contact_phone}`} className="text-sm text-primary hover:underline block">
                        {pet.emergency_contact_phone}
                      </a>
                    )}
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">No emergency contact added</p>
                )}
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Syringe className="w-4 h-4 text-accent" />
                    Veterinarian
                  </CardTitle>
                  <QuickEditContacts
                    petId={pet.id}
                    type="vet"
                    vetName={pet.vet_name}
                    vetPhone={pet.vet_phone}
                    vetEmail={pet.vet_email}
                    onUpdate={fetchPetData}
                  />
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {pet.vet_name || pet.vet_phone ? (
                  <>
                    {pet.vet_name && (
                      <p className="text-sm"><span className="text-muted-foreground">Name:</span> {pet.vet_name}</p>
                    )}
                    {pet.vet_phone && (
                      <a href={`tel:${pet.vet_phone}`} className="text-sm text-primary hover:underline block">
                        {pet.vet_phone}
                      </a>
                    )}
                    {pet.vet_email && (
                      <a href={`mailto:${pet.vet_email}`} className="text-sm text-primary hover:underline block">
                        {pet.vet_email}
                      </a>
                    )}
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">No veterinarian added</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Vaccine Schedule (Auto-generated based on species/age) */}
          <VaccineSchedule 
            petId={pet.id} 
            userId={user!.id} 
            species={pet.species}
            dateOfBirth={pet.date_of_birth}
            onScheduleChange={fetchPetData}
          />

          {/* Vaccination Tracking (Manual records) */}
          <VaccinationList petId={pet.id} petName={pet.pet_name} onVaccinationChange={fetchPetData} />

          {/* Health Timeline */}
          <HealthTimeline petId={pet.id} userId={user!.id} onEventChange={fetchPetData} />
        </div>

        {/* QR Code Sidebar */}
        <div className="lg:col-span-1">
          <Card className="sticky top-24 border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <QrCode className="w-5 h-5 text-primary" />
                Emergency QR Code
              </CardTitle>
              <CardDescription>
                Scan to access {pet.pet_name}'s emergency profile instantly
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div ref={qrRef} className="bg-white p-6 rounded-xl flex items-center justify-center shadow-inner">
                <QRCodeSVG
                  value={emergencyUrl}
                  size={180}
                  level="H"
                  includeMargin={true}
                />
              </div>
              
              <div className="space-y-2">
                <Button onClick={downloadQRCode} className="w-full">
                  <Download className="w-4 h-4 mr-2" />
                  Download QR Code
                </Button>
                
                <Button variant="outline" onClick={copyEmergencyUrl} className="w-full">
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-2" />
                      Copy Emergency Link
                    </>
                  )}
                </Button>

                <Button 
                  variant="ghost" 
                  className="w-full" 
                  onClick={() => window.open(emergencyUrl, '_blank')}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Preview Emergency Page
                </Button>
              </div>

              <p className="text-xs text-muted-foreground text-center pt-2">
                Print this QR code and attach it to {pet.pet_name}'s collar for emergency access by anyone.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
};

export default PetDetail;
