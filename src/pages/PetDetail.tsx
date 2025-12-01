import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, QrCode, Phone, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { QRCodeSVG } from 'qrcode.react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

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

const PetDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [pet, setPet] = useState<Pet | null>(null);
  const [loading, setLoading] = useState(true);
  const qrRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchPet();
  }, [id, user]);

  const fetchPet = async () => {
    if (!user || !id) return;

    try {
      const { data, error } = await supabase
        .from('pets')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      setPet(data);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const calculateAge = (dob: string) => {
    const birthDate = new Date(dob);
    const today = new Date();
    const years = today.getFullYear() - birthDate.getFullYear();
    const months = today.getMonth() - birthDate.getMonth();
    
    if (years === 0) {
      return `${months} month${months !== 1 ? 's' : ''} old`;
    }
    return `${years} year${years !== 1 ? 's' : ''} old`;
  };

  const downloadQRCode = () => {
    const svg = qrRef.current?.querySelector('svg');
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL('image/png');

      const downloadLink = document.createElement('a');
      downloadLink.download = `${pet?.pet_name}-QR.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!pet) return null;

  const emergencyUrl = `${window.location.origin}/emergency/${pet.unique_pet_id}`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-accent/5 to-background">
      <header className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-start gap-4">
                  {pet.pet_photo_url && (
                    <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-primary/20">
                      <img 
                        src={pet.pet_photo_url} 
                        alt={pet.pet_name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="flex-1">
                    <CardTitle className="text-3xl">{pet.pet_name}</CardTitle>
                    <CardDescription className="text-lg mt-1">
                      {pet.breed || pet.species} • {calculateAge(pet.date_of_birth)}
                    </CardDescription>
                    <div className="flex gap-2 mt-3">
                      <Badge className="bg-risk-low text-white">Healthy</Badge>
                      <Badge variant="secondary">{pet.is_indoor ? 'Indoor' : 'Outdoor'}</Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Weight</p>
                    <p className="font-semibold">{pet.weight_kg ? `${pet.weight_kg} kg` : 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Blood Group</p>
                    <p className="font-semibold">{pet.blood_group || 'Not specified'}</p>
                  </div>
                </div>

                {pet.known_allergies && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Known Allergies</p>
                    <div className="bg-warning/10 border border-warning/20 rounded-md p-3">
                      <p className="text-sm">{pet.known_allergies}</p>
                    </div>
                  </div>
                )}

                {pet.chronic_conditions && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Chronic Conditions</p>
                    <div className="bg-muted rounded-md p-3">
                      <p className="text-sm">{pet.chronic_conditions}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Contact Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    Veterinarian
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  {pet.vet_name ? (
                    <>
                      <p><span className="text-muted-foreground">Name:</span> {pet.vet_name}</p>
                      {pet.vet_phone && <p><span className="text-muted-foreground">Phone:</span> {pet.vet_phone}</p>}
                      {pet.vet_email && <p><span className="text-muted-foreground">Email:</span> {pet.vet_email}</p>}
                    </>
                  ) : (
                    <p className="text-muted-foreground">No vet information provided</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    Emergency Contact
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  {pet.emergency_contact_name ? (
                    <>
                      <p><span className="text-muted-foreground">Name:</span> {pet.emergency_contact_name}</p>
                      {pet.emergency_contact_phone && (
                        <p><span className="text-muted-foreground">Phone:</span> {pet.emergency_contact_phone}</p>
                      )}
                    </>
                  ) : (
                    <p className="text-muted-foreground">No emergency contact provided</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* QR Code */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <QrCode className="w-5 h-5" />
                  Emergency QR Code
                </CardTitle>
                <CardDescription>
                  Scan to access emergency profile
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div ref={qrRef} className="bg-white p-4 rounded-lg flex items-center justify-center">
                  <QRCodeSVG
                    value={emergencyUrl}
                    size={200}
                    level="H"
                    includeMargin={true}
                  />
                </div>
                <div className="space-y-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="w-full">
                        View Emergency Profile
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>Emergency Profile Preview</DialogTitle>
                        <DialogDescription>
                          This is what emergency responders will see when they scan the QR code
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-3 text-sm">
                        <p><strong>Pet ID:</strong> {pet.unique_pet_id}</p>
                        <p><strong>URL:</strong> <span className="text-xs break-all">{emergencyUrl}</span></p>
                      </div>
                    </DialogContent>
                  </Dialog>
                  <Button onClick={downloadQRCode} className="w-full">
                    Download QR Code
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground text-center">
                  Print this QR code and attach it to your pet's collar for emergency access
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PetDetail;
