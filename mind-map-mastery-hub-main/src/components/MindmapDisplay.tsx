import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Zap, Lightbulb, GitFork, Loader2, BrainCircuit } from 'lucide-react';
import { pipeline, TextGenerationPipeline } from '@huggingface/transformers';

interface MindmapNodeProps {
  title: string;
  children?: MindmapNodeProps[];
  icon?: React.ElementType;
  level: number;
}

const Node: React.FC<MindmapNodeProps> = ({ title, children, icon: Icon, level }) => {
  const levelStyles = [
    "bg-primary text-primary-foreground", // Level 0 (Central Topic)
    "bg-accent text-accent-foreground", // Level 1
    "bg-secondary text-secondary-foreground", // Level 2
    "bg-muted text-muted-foreground" // Level 3+
  ];
  const currentStyle = levelStyles[Math.min(level, levelStyles.length - 1)];

  return (
    <div className={`p-3 rounded-lg shadow-md ${currentStyle} mb-4 animate-fadeIn`} style={{ animationDelay: `${0.1 * level + 0.5}s` }}>
      <div className="flex items-center space-x-2">
        {Icon && <Icon className="h-5 w-5" />}
        <h3 className={`font-semibold ${level === 0 ? 'text-xl' : level === 1 ? 'text-lg' : 'text-md'}`}>{title}</h3>
      </div>
      {children && children.length > 0 && (
        <div className={`ml-${level === 0 ? '0' : '6'} mt-3 space-y-3 pl-4 border-l-2 border-dashed ${currentStyle === levelStyles[0] ? 'border-white/50' : 'border-foreground/30'}`}>
          {children.map((child, index) => (
            <Node key={index} {...child} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
};

interface MindmapDisplayProps {
  topic: string | null;
}

const MindmapDisplay: React.FC<MindmapDisplayProps> = ({ topic }) => {
  const [generatedMindmapData, setGeneratedMindmapData] = useState<MindmapNodeProps | null>(null);
  const [isLoadingContent, setIsLoadingContent] = useState<boolean>(false);
  const [isModelLoading, setIsModelLoading] = useState<boolean>(true);
  const [modelError, setModelError] = useState<string | null>(null);
  const [progressMessage, setProgressMessage] = useState<string>('');
  
  const textGeneratorRef = useRef<TextGenerationPipeline | null>(null);

  useEffect(() => {
    const initModel = async () => {
      try {
        console.log("Initializing text generation model (Xenova/distilgpt2)...");
        setIsModelLoading(true);
        setModelError(null);
        const generator = await pipeline('text-generation', 'Xenova/distilgpt2');
        textGeneratorRef.current = generator as TextGenerationPipeline;
        console.log("Text generation model loaded successfully.");
        setIsModelLoading(false);
      } catch (error) {
        console.error("Failed to load text generation model:", error);
        setModelError("Could not load the AI model. Please try refreshing the page.");
        setIsModelLoading(false);
      }
    };
    initModel();
  }, []);

  const generateLlmDetail = async (promptTopic: string, baseForModel: string): Promise<string> => {
    if (!textGeneratorRef.current) {
      console.error("Text generator not available");
      return `Error: LLM not ready for "${baseForModel}".`;
    }
    try {
      // Note: No trailing space in the prompt for consistency.
      const fullPrompt = `For the topic "${topic}", regarding "${baseForModel}", a key detail is:`;
      console.log(`Generating LLM detail with prompt: "${fullPrompt}"`);
      
      const result: any = await textGeneratorRef.current(fullPrompt, {
        max_new_tokens: 30, // Keep details concise
        num_return_sequences: 1,
        temperature: 0.7,
        repetition_penalty: 1.2,
      });

      let generatedTextValue: string | undefined;

      const extractTextFromSingleResult = (singleResult: any): string | undefined => {
        if (singleResult && typeof singleResult.generated_text === 'string') {
          return singleResult.generated_text;
        }
        console.warn("LLM output's generated_text is not a string or object is invalid:", singleResult);
        return undefined;
      };

      if (Array.isArray(result)) {
        if (result.length > 0 && result[0]) {
          generatedTextValue = extractTextFromSingleResult(result[0]);
        }
      } else if (result) {
        generatedTextValue = extractTextFromSingleResult(result);
      }

      if (generatedTextValue) {
        let processedText = generatedTextValue;
        // The model includes the prompt, so we remove it.
        if (processedText.startsWith(fullPrompt)) {
          processedText = processedText.substring(fullPrompt.length).trim();
        } else {
          console.warn(`LLM output did not start with the prompt as expected. Raw output: "${processedText}"`);
          // If we cannot reliably clean the prompt, we return an error for this node.
          return `Generation Error for "${baseForModel}".`;
        }
        
        if (processedText) {
            processedText = processedText.charAt(0).toUpperCase() + processedText.slice(1);
            if (!/[.!?]$/.test(processedText)) {
                processedText += '.';
            }
        }

        console.log(`LLM Generated: "${processedText}" for base "${baseForModel}"`);
        return processedText || `No detail generated for "${baseForModel}".`;
      }
      console.warn("LLM output format unexpected or empty:", result);
      return `Could not parse LLM output for "${baseForModel}".`;
    } catch (error) {
      console.error(`Error generating LLM detail for "${baseForModel}":`, error);
      return `Error during generation for "${baseForModel}".`;
    }
  };

  useEffect(() => {
    if (topic && !isModelLoading && textGeneratorRef.current) {
      setIsLoadingContent(true);
      setGeneratedMindmapData(null);
      setProgressMessage('');

      const generateData = async () => {
        console.log(`Generating mindmap data for topic: ${topic}`);
        
        setProgressMessage("Analyzing core concepts...");
        const detailA1 = await generateLlmDetail(`Provide a brief, insightful detail.`, "Core Aspect of Concept A");
        
        setProgressMessage("Identifying secondary aspects...");
        const detailA2 = await generateLlmDetail(`Offer another distinct, brief detail.`, "Secondary Aspect of Concept A");
        
        setProgressMessage("Exploring practical applications...");
        const detailB1 = await generateLlmDetail(`Explain a practical application simply.`, "Primary Application of Concept B");
        
        setProgressMessage("Gathering specific examples...");
        const subDetailB2a = await generateLlmDetail(`Give a sub-point or example.`, "Specific Example for Concept B's Aspect 2");
        const subDetailB2b = await generateLlmDetail(`Give another sub-point or example.`, "Another Example for Concept B's Aspect 2");
        
        setProgressMessage("Connecting related ideas...");
        const relatedIdeaC = await generateLlmDetail(`Suggest a tangentially related idea or question.`, "A Related Concept or Question");

        setProgressMessage("Constructing your mindmap...");

        const mindmapData: MindmapNodeProps = {
          title: `Mindmap for: ${topic}`,
          icon: Zap,
          level: 0,
          children: [
            { title: 'Key Concept A: Core Ideas', icon: Lightbulb, level: 1, children: [
              { title: detailA1, level: 2 },
              { title: detailA2, level: 2 },
            ]},
            { title: 'Key Concept B: Applications & Examples', icon: GitFork, level: 1, children: [
              { title: detailB1, level: 2 },
              { title: `Further Exploration of Concept B`, level: 2, children: [
                  { title: subDetailB2a, level: 3 },
                  { title: subDetailB2b, level: 3 },
              ]},
            ]},
            { title: relatedIdeaC, icon: BrainCircuit, level: 1 },
          ],
        };
        setGeneratedMindmapData(mindmapData);
        setIsLoadingContent(false);
        setProgressMessage('');
        console.log("Mindmap data generation complete.");
      };

      generateData();
    } else if (!topic) {
      setGeneratedMindmapData(null);
      setIsLoadingContent(false);
    }
  }, [topic, isModelLoading]);

  if (!topic) {
    return (
      <div className="text-center py-10 text-muted-foreground animate-fadeIn" style={{ animationDelay: '0.5s' }}>
        <Lightbulb className="h-12 w-12 mx-auto mb-4 text-primary" />
        <p className="text-xl">Enter a topic above to generate your mindmap.</p>
        <p className="text-sm">Let your learning journey begin!</p>
      </div>
    );
  }

  if (isModelLoading) {
    return (
      <div className="text-center py-10 text-muted-foreground animate-fadeIn flex flex-col items-center" style={{ animationDelay: '0.2s' }}>
        <Loader2 className="h-12 w-12 mx-auto mb-4 text-primary animate-spin" />
        <p className="text-xl">Initializing AI Model...</p>
        <p className="text-sm">This may take a moment, especially on first load.</p>
      </div>
    );
  }

  if (modelError) {
    return (
      <div className="text-center py-10 text-destructive animate-fadeIn flex flex-col items-center" style={{ animationDelay: '0.2s' }}>
        <Zap className="h-12 w-12 mx-auto mb-4" /> {/* Using Zap as a general error icon */}
        <p className="text-xl">Error Initializing Model</p>
        <p className="text-sm">{modelError}</p>
      </div>
    );
  }
  
  if (isLoadingContent) {
    return (
      <div className="text-center py-10 text-muted-foreground animate-fadeIn flex flex-col items-center" style={{ animationDelay: '0.2s' }}>
        <Loader2 className="h-12 w-12 mx-auto mb-4 text-primary animate-spin" />
        <p className="text-xl">Generating your mindmap for "{topic}"...</p>
        <p className="text-sm mt-2">{progressMessage || 'Please wait, harnessing the power of AI!'}</p>
      </div>
    );
  }

  if (!generatedMindmapData) {
    // This case might appear briefly or if generation fails silently after model load
    return (
      <div className="text-center py-10 text-muted-foreground">
        Preparing mindmap... if this persists, there might be an issue.
      </div>
    );
  }

  return (
    <Card className="w-full max-w-3xl mx-auto mt-10 shadow-xl animate-fadeIn" style={{ animationDelay: '0.4s' }}>
      <CardHeader>
        <CardTitle className="text-2xl text-primary flex items-center">
          <Zap className="mr-2 h-6 w-6" />
          Generated Mindmap
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Node {...generatedMindmapData} />
      </CardContent>
    </Card>
  );
};

export default MindmapDisplay;
