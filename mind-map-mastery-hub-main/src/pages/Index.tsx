
import React, { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SearchBar from '@/components/SearchBar';
import MindmapDisplay from '@/components/MindmapDisplay';
import { Sparkles, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';

const exampleTopics = [
  "Artificial Intelligence",
  "Climate Change",
  "Quantum Computing",
  "Ancient Civilizations",
  "Healthy Eating Habits",
];

const Index = () => {
  const [currentTopic, setCurrentTopic] = useState<string | null>(null);

  const handleSearch = (topic: string) => {
    console.log('Searching for topic:', topic);
    setCurrentTopic(null); // Reset while "loading"
    // Simulate API call
    setTimeout(() => {
      setCurrentTopic(topic);
    }, 500);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-background to-secondary/30">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-12 flex flex-col items-center">
        <div className="text-center mb-12 animate-fadeIn">
          <Sparkles className="h-16 w-16 text-accent mx-auto mb-4" />
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-3">
            Unlock Knowledge, Instantly.
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Enter any topic and watch as Mindmap Genius crafts a clear, concise mindmap to supercharge your learning.
          </p>
        </div>
        
        <SearchBar onSearch={handleSearch} />

        <div className="mt-6 mb-8 text-center animate-fadeIn" style={{ animationDelay: '0.3s' }}>
          <h3 className="text-md font-semibold text-muted-foreground mb-3 flex items-center justify-center">
            <Tag className="mr-2 h-4 w-4" />
            Or try one of these popular topics:
          </h3>
          <div className="flex flex-wrap justify-center gap-2">
            {exampleTopics.map((topic) => (
              <Button
                key={topic}
                variant="outline"
                size="sm"
                onClick={() => handleSearch(topic)}
                className="bg-background/70 hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                {topic}
              </Button>
            ))}
          </div>
        </div>

        {currentTopic === null && !exampleTopics.includes(currentTopic || '') && (
          <div className="mt-10 text-center text-muted-foreground animate-fadeIn" style={{ animationDelay: '0.5s' }}>
            {/* Placeholder while nothing is searched or during simulated loading */}
          </div>
        )}
        <MindmapDisplay topic={currentTopic} />

      </main>
      <Footer />
    </div>
  );
};

export default Index;
