import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

const Logo = ({ className, size = 'md', showText = true }: LogoProps) => {
  const sizes = {
    sm: { icon: 'w-8 h-8', text: 'text-lg', paw: 'w-4 h-4' },
    md: { icon: 'w-10 h-10', text: 'text-xl', paw: 'w-5 h-5' },
    lg: { icon: 'w-14 h-14', text: 'text-2xl', paw: 'w-7 h-7' },
  };

  return (
    <div className={cn('flex items-center gap-3', className)}>
      <div className={cn(
        'relative bg-gradient-to-br from-primary via-primary to-accent rounded-2xl flex items-center justify-center shadow-lg shadow-primary/25',
        sizes[size].icon
      )}>
        {/* Cute paw icon */}
        <svg 
          viewBox="0 0 24 24" 
          className={cn('text-primary-foreground', sizes[size].paw)}
          fill="currentColor"
        >
          {/* Main pad */}
          <ellipse cx="12" cy="15" rx="5" ry="4.5" />
          {/* Top left toe */}
          <ellipse cx="6.5" cy="8" rx="2.5" ry="3" />
          {/* Top right toe */}
          <ellipse cx="17.5" cy="8" rx="2.5" ry="3" />
          {/* Bottom left toe */}
          <ellipse cx="8" cy="11.5" rx="2" ry="2.5" />
          {/* Bottom right toe */}
          <ellipse cx="16" cy="11.5" rx="2" ry="2.5" />
        </svg>
        {/* Cute sparkle */}
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-accent rounded-full border-2 border-background animate-pulse" />
      </div>
      {showText && (
        <span className={cn(
          'font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent',
          sizes[size].text
        )}>
          PetRepo
        </span>
      )}
    </div>
  );
};

export default Logo;