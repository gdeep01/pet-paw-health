import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Upload, Camera, Loader2, Dog, Cat } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import PageContainer from '@/components/layout/PageContainer';

const AddPet = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState({
    pet_name: '',
    species: '',
    breed: '',
    date_of_birth: '',
    weight_kg: '',
    is_indoor: true,
    known_allergies: '',
    blood_group: '',
    vet_name: '',
    vet_phone: '',
    vet_email: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    chronic_conditions: '',
  });

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const generateUniquePetId = () => {
    return `PET-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`.toUpperCase();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setLoading(true);

    try {
      let photoUrl = null;

      if (photoFile) {
        const fileExt = photoFile.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('pet-photos')
          .upload(fileName, photoFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('pet-photos')
          .getPublicUrl(fileName);

        photoUrl = publicUrl;
      }

      const { error } = await supabase.from('pets').insert({
        user_id: user.id,
        ...formData,
        weight_kg: formData.weight_kg ? parseFloat(formData.weight_kg) : null,
        pet_photo_url: photoUrl,
        unique_pet_id: generateUniquePetId(),
      });

      if (error) throw error;

      toast({
        title: 'Pet Added Successfully! 🎉',
        description: `${formData.pet_name}'s health profile has been created.`,
      });

      navigate('/dashboard');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const canProceed = () => {
    if (step === 1) {
      return formData.pet_name && formData.species && formData.date_of_birth;
    }
    return true;
  };

  return (
    <PageContainer className="max-w-3xl">
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          {['Basic Info', 'Health Details', 'Contacts'].map((label, idx) => (
            <div key={idx} className="flex items-center">
              <div 
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
                  step > idx + 1 
                    ? 'bg-primary text-primary-foreground' 
                    : step === idx + 1 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-muted text-muted-foreground'
                }`}
              >
                {idx + 1}
              </div>
              <span className={`ml-2 text-sm hidden sm:inline ${step === idx + 1 ? 'font-medium' : 'text-muted-foreground'}`}>
                {label}
              </span>
              {idx < 2 && <div className={`w-12 sm:w-24 h-0.5 mx-2 ${step > idx + 1 ? 'bg-primary' : 'bg-muted'}`} />}
            </div>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-2xl">
              {step === 1 && 'Basic Information'}
              {step === 2 && 'Health Details'}
              {step === 3 && 'Emergency Contacts'}
            </CardTitle>
            <CardDescription>
              {step === 1 && "Enter your pet's basic details"}
              {step === 2 && "Add health-related information"}
              {step === 3 && "Add emergency and vet contacts"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Step 1: Basic Info */}
            {step === 1 && (
              <>
                {/* Photo Upload */}
                <div className="flex flex-col items-center">
                  <div 
                    className={`w-32 h-32 rounded-2xl overflow-hidden border-2 border-dashed transition-colors ${
                      photoPreview ? 'border-primary' : 'border-border hover:border-primary/50'
                    } flex items-center justify-center bg-muted cursor-pointer group`}
                    onClick={() => document.getElementById('photo-input')?.click()}
                  >
                    {photoPreview ? (
                      <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-center p-4">
                        <Camera className="w-8 h-8 text-muted-foreground mx-auto mb-2 group-hover:text-primary transition-colors" />
                        <span className="text-xs text-muted-foreground">Add Photo</span>
                      </div>
                    )}
                  </div>
                  <Input
                    id="photo-input"
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="hidden"
                  />
                </div>

                {/* Species Selection */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Species *</Label>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { value: 'Dog', icon: Dog, emoji: '🐕' },
                      { value: 'Cat', icon: Cat, emoji: '🐱' },
                    ].map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setFormData({ ...formData, species: option.value })}
                        className={`p-4 rounded-xl border-2 transition-all ${
                          formData.species === option.value 
                            ? 'border-primary bg-primary/5' 
                            : 'border-border hover:border-primary/30'
                        }`}
                      >
                        <div className="text-3xl mb-2">{option.emoji}</div>
                        <span className="font-medium">{option.value}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="pet_name">Pet Name *</Label>
                    <Input
                      id="pet_name"
                      required
                      placeholder="e.g., Buddy"
                      value={formData.pet_name}
                      onChange={(e) => setFormData({ ...formData, pet_name: e.target.value })}
                      className="h-11"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="breed">Breed</Label>
                    <Input
                      id="breed"
                      placeholder="e.g., Golden Retriever"
                      value={formData.breed}
                      onChange={(e) => setFormData({ ...formData, breed: e.target.value })}
                      className="h-11"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="date_of_birth">Date of Birth *</Label>
                    <Input
                      id="date_of_birth"
                      type="date"
                      required
                      value={formData.date_of_birth}
                      onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                      className="h-11"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="weight_kg">Weight (kg)</Label>
                    <Input
                      id="weight_kg"
                      type="number"
                      step="0.1"
                      placeholder="e.g., 12.5"
                      value={formData.weight_kg}
                      onChange={(e) => setFormData({ ...formData, weight_kg: e.target.value })}
                      className="h-11"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50">
                  <div>
                    <Label htmlFor="is_indoor" className="font-medium">Indoor Pet</Label>
                    <p className="text-sm text-muted-foreground">Does your pet stay mostly indoors?</p>
                  </div>
                  <Switch
                    id="is_indoor"
                    checked={formData.is_indoor}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_indoor: checked })}
                  />
                </div>
              </>
            )}

            {/* Step 2: Health Details */}
            {step === 2 && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="blood_group">Blood Group</Label>
                  <Input
                    id="blood_group"
                    placeholder="e.g., DEA 1.1+"
                    value={formData.blood_group}
                    onChange={(e) => setFormData({ ...formData, blood_group: e.target.value })}
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="known_allergies">Known Allergies</Label>
                  <Textarea
                    id="known_allergies"
                    value={formData.known_allergies}
                    onChange={(e) => setFormData({ ...formData, known_allergies: e.target.value })}
                    placeholder="List any known allergies (e.g., chicken, pollen)..."
                    className="min-h-24"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="chronic_conditions">Chronic Conditions</Label>
                  <Textarea
                    id="chronic_conditions"
                    value={formData.chronic_conditions}
                    onChange={(e) => setFormData({ ...formData, chronic_conditions: e.target.value })}
                    placeholder="List any chronic conditions (e.g., diabetes, arthritis)..."
                    className="min-h-24"
                  />
                </div>
              </>
            )}

            {/* Step 3: Contacts */}
            {step === 3 && (
              <>
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    <span className="w-8 h-8 rounded-full bg-destructive/10 text-destructive flex items-center justify-center text-sm">!</span>
                    Emergency Contact
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="emergency_contact_name">Contact Name</Label>
                      <Input
                        id="emergency_contact_name"
                        placeholder="e.g., Jane Doe"
                        value={formData.emergency_contact_name}
                        onChange={(e) => setFormData({ ...formData, emergency_contact_name: e.target.value })}
                        className="h-11"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="emergency_contact_phone">Contact Phone</Label>
                      <Input
                        id="emergency_contact_phone"
                        type="tel"
                        placeholder="e.g., +1 234 567 8900"
                        value={formData.emergency_contact_phone}
                        onChange={(e) => setFormData({ ...formData, emergency_contact_phone: e.target.value })}
                        className="h-11"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t">
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    <span className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm">+</span>
                    Veterinarian
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="vet_name">Vet Name / Clinic</Label>
                      <Input
                        id="vet_name"
                        placeholder="e.g., Dr. Smith / Pet Care Clinic"
                        value={formData.vet_name}
                        onChange={(e) => setFormData({ ...formData, vet_name: e.target.value })}
                        className="h-11"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="vet_phone">Vet Phone</Label>
                      <Input
                        id="vet_phone"
                        type="tel"
                        placeholder="e.g., +1 234 567 8900"
                        value={formData.vet_phone}
                        onChange={(e) => setFormData({ ...formData, vet_phone: e.target.value })}
                        className="h-11"
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="vet_email">Vet Email</Label>
                      <Input
                        id="vet_email"
                        type="email"
                        placeholder="e.g., clinic@example.com"
                        value={formData.vet_email}
                        onChange={(e) => setFormData({ ...formData, vet_email: e.target.value })}
                        className="h-11"
                      />
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Navigation Buttons */}
            <div className="flex gap-3 pt-4">
              {step > 1 && (
                <Button type="button" variant="outline" onClick={() => setStep(step - 1)} className="flex-1">
                  Back
                </Button>
              )}
              {step < 3 ? (
                <Button 
                  type="button" 
                  onClick={() => setStep(step + 1)} 
                  disabled={!canProceed()}
                  className="flex-1"
                >
                  Continue
                </Button>
              ) : (
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating Profile...
                    </>
                  ) : (
                    'Create Pet Profile'
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </form>
    </PageContainer>
  );
};

export default AddPet;
