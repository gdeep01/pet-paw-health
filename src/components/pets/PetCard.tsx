import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Heart, QrCode, Calendar, Weight, ChevronRight } from 'lucide-react';
import { format, differenceInYears, differenceInMonths } from 'date-fns';

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

interface PetCardProps {
  pet: Pet;
}

const PetCard = ({ pet }: PetCardProps) => {
  const navigate = useNavigate();

  const calculateAge = (dob: string) => {
    const birthDate = new Date(dob);
    const today = new Date();
    const years = differenceInYears(today, birthDate);
    const months = differenceInMonths(today, birthDate) % 12;
    
    if (years === 0) {
      return `${months} mo`;
    }
    return months > 0 ? `${years}y ${months}m` : `${years}y`;
  };

  const getSpeciesEmoji = (species: string) => {
    return species.toLowerCase() === 'dog' ? '🐕' : '🐱';
  };

  return (
    <Card 
      className="group cursor-pointer overflow-hidden border-border/50 hover:border-primary/30 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
      onClick={() => navigate(`/pet/${pet.id}`)}
    >
      <div className="relative">
        {/* Photo Section */}
        <div className="h-48 bg-gradient-to-br from-primary/10 via-accent/10 to-secondary overflow-hidden">
          {pet.pet_photo_url ? (
            <img 
              src={pet.pet_photo_url} 
              alt={pet.pet_name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-6xl opacity-60">{getSpeciesEmoji(pet.species)}</div>
            </div>
          )}
        </div>
        
        {/* Status Badge */}
        <div className="absolute top-3 right-3">
          <Badge className="bg-[hsl(var(--risk-low))] text-white shadow-md">
            <Heart className="w-3 h-3 mr-1 fill-current" />
            Healthy
          </Badge>
        </div>

        {/* QR Quick Access */}
        <Button
          variant="secondary"
          size="icon"
          className="absolute bottom-3 right-3 w-9 h-9 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/pet/${pet.id}`);
          }}
        >
          <QrCode className="w-4 h-4" />
        </Button>
      </div>

      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
              {pet.pet_name}
            </h3>
            <p className="text-sm text-muted-foreground">
              {pet.breed || pet.species}
            </p>
          </div>
          <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
        </div>

        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            <span>{calculateAge(pet.date_of_birth)}</span>
          </div>
          {pet.weight_kg && (
            <div className="flex items-center gap-1">
              <Weight className="w-3.5 h-3.5" />
              <span>{pet.weight_kg}kg</span>
            </div>
          )}
          <Badge variant="outline" className="text-xs font-normal">
            {pet.is_indoor ? 'Indoor' : 'Outdoor'}
          </Badge>
        </div>

        <div className="mt-3 pt-3 border-t border-border/50">
          <p className="text-xs text-muted-foreground font-mono">
            ID: {pet.unique_pet_id.slice(0, 12)}...
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default PetCard;
