
import { BrainCircuit } from 'lucide-react';

const Header = () => {
  return (
    <header className="py-6 bg-background shadow-sm">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <BrainCircuit className="h-8 w-8 text-primary" />
          <h1 className="text-2xl font-bold text-primary">Mindmap Genius</h1>
        </div>
        {/* Future navigation links can go here */}
      </div>
    </header>
  );
};

export default Header;
