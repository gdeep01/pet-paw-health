import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Plus } from 'lucide-react';

const AddPetCard = () => {
  const navigate = useNavigate();

  return (
    <Card 
      className="cursor-pointer border-dashed border-2 border-border/50 hover:border-primary/50 hover:bg-primary/5 transition-all duration-300 group"
      onClick={() => navigate('/add-pet')}
    >
      <CardContent className="flex flex-col items-center justify-center h-full min-h-[280px] py-12">
        <div className="w-16 h-16 rounded-full bg-primary/10 group-hover:bg-primary/20 flex items-center justify-center mb-4 transition-colors">
          <Plus className="w-8 h-8 text-primary" />
        </div>
        <p className="font-semibold text-foreground group-hover:text-primary transition-colors">Add New Pet</p>
        <p className="text-sm text-muted-foreground mt-1">Create a health profile</p>
      </CardContent>
    </Card>
  );
};

export default AddPetCard;
