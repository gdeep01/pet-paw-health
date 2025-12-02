import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { PawPrint } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PageContainer from '@/components/layout/PageContainer';
import PetCard from '@/components/pets/PetCard';
import AddPetCard from '@/components/pets/AddPetCard';
import LoadingSpinner from '@/components/ui/loading-spinner';
import EmptyState from '@/components/ui/empty-state';
import { useNavigate } from 'react-router-dom';

interface Pet {
  id: string;
  pet_name: string;
  species: string;
  breed: string | null;
  date_of_birth: string;
  pet_photo_url: string | null;
  unique_pet_id: string;
  weight_kg: number | null;
  is_indoor: boolean | null;
}

const Dashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchPets();
    }
  }, [user]);

  const fetchPets = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('pets')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPets(data || []);
    } catch (error: any) {
      toast({
        title: 'Error loading pets',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageContainer>
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">Your Pets</h1>
        <p className="text-muted-foreground text-lg">
          Manage health records and emergency profiles for your furry friends.
        </p>
      </div>

      {/* Stats Overview */}
      {pets.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-card rounded-xl p-4 border border-border/50">
            <p className="text-sm text-muted-foreground">Total Pets</p>
            <p className="text-2xl font-bold text-primary">{pets.length}</p>
          </div>
          <div className="bg-card rounded-xl p-4 border border-border/50">
            <p className="text-sm text-muted-foreground">Dogs</p>
            <p className="text-2xl font-bold">{pets.filter(p => p.species.toLowerCase() === 'dog').length}</p>
          </div>
          <div className="bg-card rounded-xl p-4 border border-border/50">
            <p className="text-sm text-muted-foreground">Cats</p>
            <p className="text-2xl font-bold">{pets.filter(p => p.species.toLowerCase() === 'cat').length}</p>
          </div>
          <div className="bg-card rounded-xl p-4 border border-border/50">
            <p className="text-sm text-muted-foreground">Health Status</p>
            <p className="text-2xl font-bold text-[hsl(var(--risk-low))]">Good</p>
          </div>
        </div>
      )}

      {/* Content */}
      {loading ? (
        <LoadingSpinner className="py-20" size="lg" />
      ) : pets.length === 0 ? (
        <EmptyState
          icon={<PawPrint className="w-10 h-10 text-muted-foreground" />}
          title="No pets yet"
          description="Add your first pet to start tracking their health records and create an emergency QR profile."
          action={
            <Button onClick={() => navigate('/add-pet')} size="lg">
              Add Your First Pet
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {pets.map((pet) => (
            <PetCard key={pet.id} pet={pet} />
          ))}
          <AddPetCard />
        </div>
      )}
    </PageContainer>
  );
};

export default Dashboard;
