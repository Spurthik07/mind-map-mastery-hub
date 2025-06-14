
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';

interface SearchBarProps {
  onSearch: (topic: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch }) => {
  const [topic, setTopic] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (topic.trim()) {
      onSearch(topic.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex w-full max-w-xl items-center space-x-2 animate-fadeIn" style={{ animationDelay: '0.2s' }}>
      <Input
        type="text"
        placeholder="Enter a topic (e.g., 'Photosynthesis', 'React Hooks')"
        value={topic}
        onChange={(e) => setTopic(e.target.value)}
        className="flex-grow text-lg p-4 rounded-lg shadow-sm focus:ring-2 focus:ring-primary"
      />
      <Button type="submit" size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg px-6 py-4 text-lg">
        <Search className="mr-2 h-5 w-5" />
        Generate
      </Button>
    </form>
  );
};

export default SearchBar;
