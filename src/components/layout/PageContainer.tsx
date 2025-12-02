import { ReactNode } from 'react';
import Header from './Header';

interface PageContainerProps {
  children: ReactNode;
  showHeader?: boolean;
  className?: string;
}

const PageContainer = ({ children, showHeader = true, className = '' }: PageContainerProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/30 to-accent/5">
      {showHeader && <Header />}
      <main className={`container mx-auto px-4 py-8 ${className}`}>
        {children}
      </main>
    </div>
  );
};

export default PageContainer;
