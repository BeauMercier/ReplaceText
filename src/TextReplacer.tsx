import { useState, useRef } from 'react';
import OpenAI from 'openai';

interface TextReplacerProps {
  apiKey: string;
  onApiKeyChange: (newKey: string) => void;
}

export default function TextReplacer({ apiKey, onApiKeyChange }: TextReplacerProps) {
  const [sourceText, setSourceText] = useState('');
  const [cityList, setCityList] = useState('');
  const [baseCity, setBaseCity] = useState('');
  const [results, setResults] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentCity, setCurrentCity] = useState('');
  const [showColumnView, setShowColumnView] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [remainingCities, setRemainingCities] = useState<string[]>([]);
  const [showDebug, setShowDebug] = useState(false);
  const [cityInfo, setCityInfo] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [localApiKey, setLocalApiKey] = useState(apiKey || '');
  const [keyTerms, setKeyTerms] = useState<string[]>([]);
  const [termVerification, setTermVerification] = useState<{total: number, found: number}>({total: 0, found: 0});
  const [subareas, setSubareas] = useState<string>('');
  const [showSubareas, setShowSubareas] = useState(false);
  const [selectedModel, setSelectedModel] = useState<'gpt-4-0125-preview' | 'gpt-3.5-turbo'>('gpt-4-0125-preview');
  const [showAreaFinder, setShowAreaFinder] = useState(false);
  const [areaFinderCity, setAreaFinderCity] = useState('');
  const [isLoadingAreas, setIsLoadingAreas] = useState(false);
  const [areaResults, setAreaResults] = useState<{ [key: string]: string }>({});
  const [showCausesFinder, setShowCausesFinder] = useState(false);
  const [causesFinderCity, setCausesFinderCity] = useState('');
  const [isLoadingCauses, setIsLoadingCauses] = useState(false);
  const [causesResults, setCausesResults] = useState<{ [key: string]: string }>({});
  const [isGeneratingImages, setIsGeneratingImages] = useState(false);
  const [causeImages, setCauseImages] = useState<{ [key: string]: string }>({});
  const columnTextRef = useRef<HTMLTextAreaElement>(null);
  const subareasRef = useRef<HTMLTextAreaElement>(null);

  const handleSimpleReplace = () => {
    const cities = cityList.split('\n').filter(city => city.trim());
    const newResults = cities.map(city => 
      sourceText.replace(new RegExp(baseCity, 'gi'), city.trim())
    );
    setResults(newResults);
  };

  const formatForColumnView = (results: string[]) => {
    // Simply preserve the original text formatting and join with single line breaks
    return results.join('\n');
  };

  const isLengthAcceptable = (original: string, generated: string) => {
    const lengthDiff = Math.abs(original.length - generated.length);
    // For longer texts, allow a proportionally larger difference
    const maxAllowedDiff = Math.max(15, Math.floor(original.length * 0.05)); // 5% of original length or 15 chars, whichever is greater
    return lengthDiff <= maxAllowedDiff;
  };

  const isSimpleReplacement = (original: string, generated: string, baseCity: string, targetCity: string) => {
    // Simple replacement would just replace all instances of baseCity with targetCity
    const simpleReplaced = original.replace(new RegExp(baseCity, 'gi'), targetCity.trim());
    
    // Check if it's exactly the same as simple replacement
    if (generated === simpleReplaced) return true;
    
    // Check if it's very similar to simple replacement (e.g., just added/removed spaces or punctuation)
    const normalizedGenerated = generated.replace(/\s+/g, ' ').replace(/[.,;:!?]/g, '').toLowerCase();
    const normalizedSimple = simpleReplaced.replace(/\s+/g, ' ').replace(/[.,;:!?]/g, '').toLowerCase();
    
    // If they're very similar after normalization, it's probably still just a simple replacement
    const similarity = levenshteinDistance(normalizedGenerated, normalizedSimple) / Math.max(normalizedGenerated.length, normalizedSimple.length);
    return similarity < 0.05; // If less than 5% different, consider it a simple replacement
  };
  
  // Helper function to calculate Levenshtein distance between two strings
  const levenshteinDistance = (a: string, b: string) => {
    if (a.length === 0) return b.length;
    if (b.length === 0) return a.length;
  
    const matrix = [];
  
    // Initialize matrix
    for (let i = 0; i <= b.length; i++) {
      matrix[i] = [i];
    }
    for (let j = 0; j <= a.length; j++) {
      matrix[0][j] = j;
    }
  
    // Fill matrix
    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        const cost = a[j - 1] === b[i - 1] ? 0 : 1;
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1, // deletion
          matrix[i][j - 1] + 1, // insertion
          matrix[i - 1][j - 1] + cost // substitution
        );
      }
    }
  
    return matrix[b.length][a.length];
  };

  const processCity = async (city: string, openai: OpenAI) => {
    setCurrentCity(city);
    console.log(`Processing city: ${city}`);
    let attempts = 0;
    let enhancedText = '';
    let cityResearchInfo = '';
    
    while (attempts < 3) {
      console.log(`Attempt ${attempts + 1} for ${city}`);
      
      const researchPrompt = `Analyze ${city} and provide 4-5 specific, unique characteristics that would be relevant for a foundation repair company. Include:
1. Soil type and geological conditions
2. Common foundation issues in the area
3. Local weather patterns affecting foundations
4. Historical or architectural significance
5. Unique geographical features

Format as a detailed list with brief explanations.`;
      
      const researchCompletion = await openai.chat.completions.create({
        messages: [
          {
            role: "system",
            content: "You are a foundation repair expert and local historian with deep knowledge of geological conditions, architectural styles, and environmental factors affecting building foundations in different cities."
          },
          {
            role: "user",
            content: researchPrompt
          }
        ],
        model: selectedModel,
        temperature: 0.7,
      });

      cityResearchInfo = researchCompletion.choices[0]?.message?.content || '';
      setCityInfo(cityResearchInfo);
      
      // Add causes of foundation damage section
      const causesPrompt = `List 6 major causes of foundation damage in ${city}, considering its specific:
- Soil conditions
- Weather patterns
- Infrastructure age
- Local vegetation
- Construction practices
- Environmental factors

Format each cause as follows:
[Title]
[1-2 sentence explanation]

Do not number the causes. Simply list each with its title and explanation, separated by blank lines.

Make sure each cause is specific to ${city}'s unique conditions and challenges.`;

      const causesCompletion = await openai.chat.completions.create({
        messages: [
          {
            role: "system",
            content: "You are a foundation repair expert with deep knowledge of local conditions affecting building foundations. Focus on providing accurate, location-specific information about foundation damage causes. Present information clearly without numbering."
          },
          {
            role: "user",
            content: causesPrompt
          }
        ],
        model: selectedModel,
        temperature: 0.7,
      });

      const causesInfo = causesCompletion.choices[0]?.message?.content || '';
      
      // Extract key terms from the research to verify they appear in the generated content
      const extractKeyTermsPrompt = `Extract 5-8 unique, specific keywords or short phrases from the following research about ${city} that should appear in content about foundation repair in this city:

${cityResearchInfo}

Return ONLY a comma-separated list of these terms (no numbering, no explanations).`;

      const keyTermsCompletion = await openai.chat.completions.create({
        messages: [
          {
            role: "system",
            content: "You are a data extraction specialist who identifies the most distinctive and specific terms from research."
          },
          {
            role: "user",
            content: extractKeyTermsPrompt
          }
        ],
        model: selectedModel,
        temperature: 0.3,
      });

      const keyTerms = keyTermsCompletion.choices[0]?.message?.content?.split(',').map(term => term.trim()) || [];
      console.log(`Key terms for ${city}:`, keyTerms);
      setKeyTerms(keyTerms);
      
      const enhancePrompt = `Original text about ${baseCity}:\n\n${sourceText}\n\n
Task: Completely rewrite this text for ${city}, incorporating the following city-specific details while maintaining approximately the same length (±5%). Also include a new section titled "Causes of Foundation Damage in ${city}" after the main content.

City Research:
${cityResearchInfo}

Foundation Damage Causes:
${causesInfo}

IMPORTANT: You MUST incorporate the following specific terms/concepts about ${city} in your rewrite:
${keyTerms.join(', ')}

Requirements:
1. Create ENTIRELY NEW content specific to ${city} - do not simply replace city names
2. Reference the actual soil conditions, weather patterns, and architectural characteristics of ${city}
3. Mention at least 3 specific features from the research (soil type, weather patterns, geographical features)
4. Maintain the same professional tone and basic structure
5. Add the "Causes of Foundation Damage in ${city}" section after the main content, formatted clearly with the 6 causes
6. NEVER just replace "${baseCity}" with "${city}" - every sentence must be genuinely rewritten
7. Include at least one specific neighborhood, landmark, or geographical feature of ${city}

Your rewrite must feel like it was originally written for ${city}, not adapted from another city.`;
      
      try {
        const completion = await openai.chat.completions.create({
          messages: [
            { 
              role: "system", 
              content: "You are an expert content writer for a foundation repair company with deep knowledge of geological conditions and construction challenges. Your specialty is creating highly localized, authentic content that addresses specific foundation challenges in each city while maintaining consistent length and professionalism."
            },
            {
              role: "user",
              content: enhancePrompt
            }
          ],
          model: selectedModel,
          temperature: 0.7,
        });

        enhancedText = completion.choices[0]?.message?.content || '';
        console.log(`Generated text length: ${enhancedText.length}, Original length: ${sourceText.length}`);
        
        // Check if the generated text is just a simple replacement
        const isSimpleReplace = isSimpleReplacement(sourceText, enhancedText, baseCity, city);
        
        // Verify that the content includes the key terms
        const termCount = keyTerms.filter(term => 
          enhancedText.toLowerCase().includes(term.toLowerCase())
        ).length;
        
        const hasEnoughTerms = termCount >= Math.min(3, keyTerms.length);
        console.log(`Terms found: ${termCount} out of ${keyTerms.length}`);
        setTermVerification({total: keyTerms.length, found: termCount});
        
        if (isLengthAcceptable(sourceText, enhancedText) && !isSimpleReplace && hasEnoughTerms) {
          console.log(`Content verification passed for ${city}: length acceptable, not a simple replacement, and contains key terms`);
          break;
        } else {
          if (isSimpleReplace) {
            console.log(`Generated text is just a simple replacement for ${city}, trying again`);
          } else if (!hasEnoughTerms) {
            console.log(`Generated text doesn't contain enough key terms for ${city}, trying again`);
          } else {
            console.log(`Length not acceptable for ${city}, trying again`);
          }
        }
      } catch (error) {
        console.error(`Error in OpenAI call for ${city}:`, error);
      }
      
      attempts++;
      if (attempts === 3) {
        console.warn(`Failed to generate acceptable text for ${city} after 3 attempts. Creating a more basic enhanced version.`);
        
        // Instead of simple replacement, try one more time with a simpler prompt
        try {
          const fallbackPrompt = `Write a professional paragraph about foundation repair services in ${city}. 
Include these specific details about ${city}: ${keyTerms.slice(0, 3).join(', ')}. 
The text should be approximately ${sourceText.length} characters long and mention the company name "APD Foundation Repair".`;
          
          const fallbackCompletion = await openai.chat.completions.create({
            messages: [
              { 
                role: "system", 
                content: "You are a professional content writer for a foundation repair company."
              },
              {
                role: "user",
                content: fallbackPrompt
              }
            ],
            model: selectedModel,
            temperature: 0.7,
          });
          
          enhancedText = fallbackCompletion.choices[0]?.message?.content || '';
          
          // If that still fails, then do simple replacement
          if (!enhancedText) {
        enhancedText = sourceText.replace(new RegExp(baseCity, 'gi'), city.trim());
          }
        } catch (error) {
          console.error(`Error in fallback content generation for ${city}:`, error);
          enhancedText = sourceText.replace(new RegExp(baseCity, 'gi'), city.trim());
        }
      }
    }
    
    return enhancedText;
  };

  const handleAIEnhance = async () => {
    if (!apiKey) {
      alert('Please configure your API key first');
      return;
    }

    if (!sourceText || !baseCity || !cityList) {
      alert('Please fill in all fields before using AI enhancement');
      return;
    }
    
    setIsLoading(true);
    const cities = cityList.split('\n').filter(city => city.trim());
    
    try {
      console.log('Starting AI enhancement with API key:', apiKey.substring(0, 10) + '...');
      const openai = new OpenAI({
        apiKey: apiKey,
        dangerouslyAllowBrowser: true
      });

      // Process first city
      const firstCity = cities[0];
      const firstResult = await processCity(firstCity, openai);
      setResults([firstResult]);
      
      if (cities.length > 1) {
        setRemainingCities(cities.slice(1));
        setShowConfirmation(true);
      }

    } catch (error) {
      console.error('Error during AI enhancement:', error);
      alert('Error during AI enhancement. Please check the console for details.');
    } finally {
      setIsLoading(false);
      setCurrentCity('');
    }
  };

  const handleContinue = async () => {
    if (!apiKey || !remainingCities.length) return;
    
    setIsLoading(true);
    setShowConfirmation(false);
    const newResults = [...results];
    const citiesToProcess = [...remainingCities];
    setRemainingCities([]);

    try {
      const openai = new OpenAI({
        apiKey: apiKey,
        dangerouslyAllowBrowser: true
      });

      // Process cities one by one and update results after each one
      for (let i = 0; i < citiesToProcess.length; i++) {
        const city = citiesToProcess[i];
        const enhancedText = await processCity(city, openai);
        newResults.push(enhancedText);
        
        // Update results after each city is processed
        setResults([...newResults]);
        
        // Update remaining cities count for progress indication
        setRemainingCities(citiesToProcess.slice(i + 1));
      }
    } catch (error) {
      console.error('Error during AI enhancement:', error);
      alert('Error during AI enhancement. Please check the console for details.');
    } finally {
      setIsLoading(false);
      setCurrentCity('');
      setRemainingCities([]);
    }
  };

  const handleCancel = () => {
    setShowConfirmation(false);
    setRemainingCities([]);
  };

  const handleCopyColumn = () => {
    if (columnTextRef.current) {
      columnTextRef.current.select();
      document.execCommand('copy');
      alert('Column text copied to clipboard!');
    }
  };

  const handleSaveSettings = () => {
    if (onApiKeyChange) {
      onApiKeyChange(localApiKey);
    }
    setShowSettings(false);
  };

  const handleCopySubareas = () => {
    if (subareasRef.current) {
      subareasRef.current.select();
      document.execCommand('copy');
      alert('Subareas copied to clipboard!');
    }
  };

  const formatSubareasToColumns = (text: string) => {
    if (!text.trim()) return { column1: [], column2: [], column3: [] };
    
    // Split by newlines and filter out empty lines
    const lines = text.split('\n').filter(line => line.trim());
    
    // Calculate items per column (rounded up to ensure all items are distributed)
    const itemsPerColumn = Math.ceil(lines.length / 3);
    
    // Distribute items to columns
    return {
      column1: lines.slice(0, itemsPerColumn),
      column2: lines.slice(itemsPerColumn, itemsPerColumn * 2),
      column3: lines.slice(itemsPerColumn * 2)
    };
  };

  const processSubareas = (text: string) => {
    // Ensure each line starts with a checkmark emoji
    return text.split('\n')
      .filter(line => line.trim())
      .map(line => {
        const trimmed = line.trim();
        if (trimmed.startsWith('✅')) return trimmed;
        return `✅ ${trimmed}`;
      })
      .join('\n');
  };

  const handleProcessSubareas = () => {
    const processed = processSubareas(subareas);
    setSubareas(processed);
  };

  const handlePasteAndProcess = async () => {
    try {
      const text = await navigator.clipboard.readText();
      const processed = processSubareas(text);
      setSubareas(processed);
    } catch (err) {
      alert('Unable to read from clipboard. Please paste the text manually.');
    }
  };

  const handleClearSubareas = () => {
    if (confirm('Are you sure you want to clear all subareas?')) {
      setSubareas('');
    }
  };

  const handleFindAreas = async () => {
    if (!apiKey || !areaFinderCity) return;
    
    const cities = areaFinderCity.split('\n').filter(city => city.trim());
    setIsLoadingAreas(true);
    
    try {
      const openai = new OpenAI({
        apiKey: apiKey,
        dangerouslyAllowBrowser: true
      });

      for (const city of cities) {
        const prompt = `List approximately 30 major areas, neighborhoods, or communities in ${city}. 
Include a mix of:
- Major residential neighborhoods
- Well-known districts
- Popular subdivisions
- Notable communities
- Key development areas

Format as a list with checkmarks, one per line:
✅ Area Name

Every 10th item should be followed by a line that says "------- [X/30] Areas Listed -------"

Guidelines:
1. Start each line with ✅ followed by the area name (no numbers)
2. One area per line
3. After items 10, 20, and 30, add the progress marker line
4. Focus on recognizable areas that locals would know
5. Mix of older established areas and newer developments
6. Include both central and suburban areas if applicable`;

        const completion = await openai.chat.completions.create({
          messages: [
            {
              role: "system",
              content: "You are a knowledgeable local guide who helps identify major areas and neighborhoods within cities. Your goal is to provide a diverse list of recognizable areas that would be useful for local business targeting."
            },
            {
              role: "user",
              content: prompt
            }
          ],
          model: selectedModel,
          temperature: 0.3,
        });

        let generatedAreas = completion.choices[0]?.message?.content || '';
        
        // Ensure proper formatting if AI doesn't follow exactly
        const lines = generatedAreas.split('\n').filter(line => line.trim());
        const formattedLines = lines.map((line, index) => {
          // Skip formatting for progress marker lines
          if (line.includes('Areas Listed')) return line;
          
          // Remove any existing numbers, checkmarks, or extra formatting
          const cleanLine = line.replace(/^[✅\d.\s-]+/, '').trim();
          
          // Add just the checkmark (no numbers)
          const formattedLine = `✅ ${cleanLine}`;
          
          // Add progress marker after every 10th item (excluding marker lines)
          const actualIndex = lines.slice(0, index + 1).filter(l => !l.includes('Areas Listed')).length;
          if (actualIndex % 10 === 0) {
            return `${formattedLine}\n------- [${actualIndex}/30] Areas Listed -------`;
          }
          
          return formattedLine;
        });
        
        generatedAreas = formattedLines.join('\n');
        setAreaResults({...areaResults, [city.trim()]: generatedAreas});
      }
    } catch (error) {
      console.error('Error fetching areas:', error);
      alert('Error fetching areas. Please check the console for details.');
    } finally {
      setIsLoadingAreas(false);
    }
  };

  const handleFindCauses = async () => {
    if (!apiKey || !causesFinderCity) return;
    
    const cities = causesFinderCity.split('\n').filter(city => city.trim());
    setIsLoadingCauses(true);
    setIsGeneratingImages(true);
    
    try {
      const openai = new OpenAI({
        apiKey: apiKey,
        dangerouslyAllowBrowser: true
      });

      const allCausesData: { city: string, titles: string[], explanations: string[] }[] = [];

      for (const city of cities) {
        const prompt = `List 6 major causes of foundation damage in ${city}, considering its specific:
- Soil conditions
- Weather patterns
- Infrastructure age
- Local vegetation
- Construction practices
- Environmental factors

Format each cause as follows:
[Title]
[1-2 sentence explanation]

Do not number the causes. Simply list each with its title and explanation, separated by blank lines.

Make sure each cause is specific to ${city}'s unique conditions and challenges.`;

        const completion = await openai.chat.completions.create({
          messages: [
            {
              role: "system",
              content: "You are a foundation repair expert with deep knowledge of local conditions affecting building foundations. Focus on providing accurate, location-specific information about foundation damage causes. Present information clearly without numbering."
            },
            {
              role: "user",
              content: prompt
            }
          ],
          model: selectedModel,
          temperature: 0.7,
        });

        let generatedCauses = completion.choices[0]?.message?.content || '';
        generatedCauses = generatedCauses.replace(/^\d+\.\s*/gm, '');

        // Split into causes and format vertically
        const causes = generatedCauses.split('\n\n').filter(cause => cause.trim());
        const titles: string[] = [];
        const explanations: string[] = [];

        causes.forEach(cause => {
          const [title, ...explanationParts] = cause.split('\n');
          titles.push(title.trim());
          explanations.push(explanationParts.join(' ').trim());
        });

        // Generate images for each cause
        for (let i = 0; i < titles.length; i++) {
          try {
            const imagePrompt = `Professional, photorealistic image of ${titles[i].toLowerCase()} causing foundation damage in ${city}. Show clear visual evidence of the foundation issue. Architectural photography style, no text overlay, focused on structural damage.`;
            
            const imageResponse = await openai.images.generate({
              model: "dall-e-3",
              prompt: imagePrompt,
              n: 1,
              size: "1024x1024",
              quality: "standard",
              style: "natural"
            });

            if (imageResponse.data[0]?.url) {
              const imageKey = `${city}-${titles[i]}`;
              setCauseImages(prev => {
                const updated = { ...prev };
                updated[imageKey] = imageResponse.data[0].url as string;
                return updated;
              });
            }
          } catch (error) {
            console.error(`Error generating image for ${titles[i]} in ${city}:`, error);
          }
        }

        allCausesData.push({
          city,
          titles,
          explanations
        });
      }

      // Format output by grouping points across cities
      const numPoints = 6;
      let formattedOutput = '';

      for (let pointIndex = 0; pointIndex < numPoints; pointIndex++) {
        for (const cityData of allCausesData) {
          formattedOutput += cityData.titles[pointIndex] + '\n\n';
          formattedOutput += cityData.explanations[pointIndex] + '\n\n';
        }
        if (pointIndex < numPoints - 1) {
          formattedOutput += '\n';
        }
      }

      setCausesResults({ 'All Cities': formattedOutput });

    } catch (error) {
      console.error('Error fetching causes:', error);
      alert('Error fetching causes. Please check the console for details.');
    } finally {
      setIsLoadingCauses(false);
      setIsGeneratingImages(false);
    }
  };

  const handleReplacementsChange = (index: number, field: string, value: string) => {
    const updatedReplacements = [...results];
    updatedReplacements[index] = value;
    setResults(updatedReplacements);
    
    // Update results when replacements change
    updateResults(updatedReplacements);
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      {/* Header with title at the top */}
      <div style={{ 
        textAlign: 'center', 
        marginBottom: '30px',
        padding: '20px 0',
        borderBottom: '1px solid var(--border-color)'
      }}>
        <h1 style={{ 
          fontSize: '2.5rem', 
          margin: '0 0 15px 0',
          color: '#2e4057',
          fontWeight: '700'
        }}>City Content Generator</h1>
        
        {/* Navigation Bar */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          gap: '12px',
          flexWrap: 'wrap',
          marginTop: '20px'
        }}>
          <button
            onClick={() => {
              setShowAreaFinder(true);
              setShowCausesFinder(false);
            }}
            style={{ 
              padding: '10px 16px',
              backgroundColor: showAreaFinder ? 'var(--primary-hover)' : 'var(--primary-color)',
              color: 'white',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}
          >
            <span>🔍</span> Area Finder
          </button>
          <button
            onClick={() => {
              setShowAreaFinder(false);
              setShowCausesFinder(true);
            }}
            style={{ 
              padding: '10px 16px',
              backgroundColor: showCausesFinder ? 'var(--primary-hover)' : 'var(--primary-color)',
              color: 'white',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}
          >
            <span>🏗️</span> Damage Causes
          </button>
        </div>
      </div>
      
      {/* Controls Bar */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '20px',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <button
          onClick={() => setShowSettings(true)}
          style={{ 
            padding: '8px 12px',
            backgroundColor: 'var(--border-color)',
            color: 'var(--text-color)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            borderRadius: '8px'
          }}
        >
          <span>⚙️</span> Settings
        </button>
        
        <div style={{ 
          display: 'flex', 
          gap: '8px', 
          alignItems: 'center'
        }}>
          <span style={{ fontSize: '0.9rem', opacity: 0.7 }}>AI Model:</span>
          <div style={{
            display: 'flex',
            border: '2px solid var(--primary-color)',
            borderRadius: '8px',
            overflow: 'hidden'
          }}>
            <button
              onClick={() => setSelectedModel('gpt-4-0125-preview')}
              style={{
                padding: '8px 12px',
                backgroundColor: selectedModel === 'gpt-4-0125-preview' ? 'var(--primary-color)' : 'transparent',
                color: selectedModel === 'gpt-4-0125-preview' ? 'white' : 'var(--primary-color)',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                transition: 'all 0.2s'
              }}
            >
              🚀 GPT-4 Turbo
            </button>
            <button
              onClick={() => setSelectedModel('gpt-3.5-turbo')}
              style={{
                padding: '8px 12px',
                backgroundColor: selectedModel === 'gpt-3.5-turbo' ? 'var(--primary-color)' : 'transparent',
                color: selectedModel === 'gpt-3.5-turbo' ? 'white' : 'var(--primary-color)',
                border: 'none',
                borderLeft: '2px solid var(--primary-color)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                transition: 'all 0.2s'
              }}
            >
              🤖 GPT-3.5
            </button>
          </div>
        </div>
      </div>

      {showAreaFinder && (
        <div className="card" style={{ 
          marginBottom: '20px',
          borderRadius: '12px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.05)'
        }}>
          <h2 style={{ marginTop: 0, borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
            <span style={{ marginRight: '8px' }}>🔍</span> Area Finder
          </h2>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end' }}>
            <div style={{ flex: 1 }}>
              <label className="label">City Names (one per line):</label>
              <textarea
                value={areaFinderCity}
                onChange={(e) => setAreaFinderCity(e.target.value)}
                placeholder="Enter city names (one per line) to find their major areas and neighborhoods"
                style={{ height: '100px', marginBottom: 0 }}
              />
            </div>
            <button
              onClick={handleFindAreas}
              disabled={isLoadingAreas || !areaFinderCity}
              className={isLoadingAreas ? 'loading' : ''}
              style={{ minWidth: '120px', height: '40px' }}
            >
              {isLoadingAreas ? 'Finding...' : 'Find Areas'}
            </button>
          </div>
          <p className="help-text" style={{ marginBottom: '20px' }}>
            This will generate a list of major areas, neighborhoods, and communities for each city
          </p>

          {Object.keys(areaResults).length > 0 && (
            <div style={{ marginTop: '20px' }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginBottom: '15px'
              }}>
                <h3 style={{ margin: 0 }}>Results</h3>
                <button
                  onClick={() => setAreaResults({})}
                  style={{ 
                    backgroundColor: 'var(--danger-color)',
                    fontSize: '0.9rem',
                    padding: '8px 12px'
                  }}
                >
                  🗑️ Clear Results
                </button>
              </div>
              {Object.entries(areaResults).map(([city, areas], index) => (
                <div 
                  key={city} 
                  className="card"
                  style={{ 
                    marginBottom: index === Object.keys(areaResults).length - 1 ? 0 : '15px',
                    backgroundColor: '#f8fafc'
                  }}
                >
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    marginBottom: '10px'
                  }}>
                    <h4 style={{ margin: 0 }}>{city}</h4>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(areas);
                        alert(`Areas for ${city} copied to clipboard!`);
                      }}
                      style={{ 
                        backgroundColor: 'var(--warning-color)',
                        fontSize: '0.8rem',
                        padding: '4px 8px'
                      }}
                    >
                      📋 Copy
                    </button>
                  </div>
                  <pre style={{ 
                    margin: 0,
                    whiteSpace: 'pre-wrap',
                    fontSize: '0.9rem',
                    lineHeight: '1.4'
                  }}>
                    {areas}
                  </pre>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {showCausesFinder && (
        <div className="card" style={{ 
          marginBottom: '20px',
          borderRadius: '12px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.05)'
        }}>
          <h2 style={{ marginTop: 0, borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
            <span style={{ marginRight: '8px' }}>🏗️</span> Foundation Damage Causes
          </h2>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end' }}>
            <div style={{ flex: 1 }}>
              <label className="label">City Names (one per line):</label>
              <textarea
                value={causesFinderCity}
                onChange={(e) => setCausesFinderCity(e.target.value)}
                placeholder="Enter city names (one per line) to find their major causes of foundation damage"
                style={{ height: '100px', marginBottom: 0 }}
              />
            </div>
            <button
              onClick={handleFindCauses}
              disabled={isLoadingCauses || !causesFinderCity}
              className={isLoadingCauses ? 'loading' : ''}
              style={{ minWidth: '120px', height: '40px' }}
            >
              {isLoadingCauses ? 'Finding...' : 'Find Causes'}
            </button>
          </div>
          <p className="help-text" style={{ marginBottom: '20px' }}>
            This will generate a list of major causes of foundation damage specific to each city
          </p>

          {Object.keys(causesResults).length > 0 && (
            <div style={{ marginTop: '20px' }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginBottom: '15px'
              }}>
                <h3 style={{ margin: 0 }}>Results</h3>
                <button
                  onClick={() => setCausesResults({})}
                  style={{ 
                    backgroundColor: 'var(--danger-color)',
                    fontSize: '0.9rem',
                    padding: '8px 12px'
                  }}
                >
                  🗑️ Clear Results
                </button>
              </div>
              {Object.entries(causesResults).map(([city, causes], index) => (
                <div 
                  key={city} 
                  className="card"
                  style={{ 
                    marginBottom: index === Object.keys(causesResults).length - 1 ? 0 : '15px',
                    backgroundColor: '#f8fafc'
                  }}
                >
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    marginBottom: '10px'
                  }}>
                    <h4 style={{ margin: 0 }}>{city}</h4>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(causes);
                          alert(`Causes for ${city} copied to clipboard!`);
                        }}
                        style={{ 
                          backgroundColor: 'var(--warning-color)',
                          fontSize: '0.8rem',
                          padding: '4px 8px'
                        }}
                      >
                        📋 Copy
                      </button>
                    </div>
                  </div>
                  <pre style={{ 
                    margin: 0,
                    whiteSpace: 'pre-wrap',
                    fontSize: '0.9rem',
                    lineHeight: '1.6'
                  }}>
                    {causes}
                  </pre>
                  {Object.entries(causeImages)
                    .filter(([key]) => key.startsWith(city))
                    .map(([key, url]) => (
                      <div key={key} style={{ marginTop: '15px' }}>
                        <h5 style={{ margin: '0 0 8px 0' }}>{key.split('-')[1]}</h5>
                        <img 
                          src={url} 
                          alt={key} 
                          style={{ 
                            width: '100%', 
                            maxWidth: '512px', 
                            borderRadius: '8px',
                            display: 'block',
                            margin: '0 auto'
                          }} 
                        />
                      </div>
                    ))}
                  {isGeneratingImages && (
                    <div style={{ 
                      marginTop: '15px',
                      padding: '12px',
                      backgroundColor: '#f0f9ff',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px'
                    }}>
                      <div className="loading" style={{ width: '20px', height: '20px' }}></div>
                      <span>Generating images...</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {!showAreaFinder && !showCausesFinder && (
        <div className="card" style={{ 
          borderRadius: '12px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.05)'
        }}>
        <div style={{ marginBottom: '20px' }}>
          <label className="label">Base City Name:</label>
          <input
            type="text"
            value={baseCity}
            onChange={(e) => setBaseCity(e.target.value)}
            placeholder="Enter the city name to replace"
              style={{ borderRadius: '8px', padding: '12px' }}
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label className="label">Source Text:</label>
          <textarea
            value={sourceText}
            onChange={(e) => setSourceText(e.target.value)}
              style={{ height: '150px', borderRadius: '8px', padding: '12px' }}
            placeholder="Enter your source text here with the base city name"
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label className="label">City List (one per line):</label>
          <textarea
            value={cityList}
            onChange={(e) => setCityList(e.target.value)}
              style={{ height: '150px', borderRadius: '8px', padding: '12px' }}
            placeholder="Enter target cities (one per line)"
          />
        </div>

          <div style={{ 
            display: 'flex', 
            gap: '12px', 
            marginBottom: '20px', 
            flexWrap: 'wrap', 
            alignItems: 'center' 
          }}>
          <button
            onClick={handleSimpleReplace}
            className="success"
              style={{
                padding: '12px 20px',
                borderRadius: '8px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                fontSize: '1.05rem'
              }}
          >
            Simple Replace
          </button>
          <button
            onClick={handleAIEnhance}
            disabled={isLoading}
            className={isLoading ? 'loading' : ''}
              style={{
                padding: '12px 20px',
                borderRadius: '8px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                fontSize: '1.05rem'
              }}
          >
            {isLoading ? 'Processing...' : 'AI Enhance'}
          </button>
          {results.length > 0 && (
            <>
              <button
                onClick={() => setShowColumnView(!showColumnView)}
                className="warning"
              >
                {showColumnView ? 'Show Normal View' : 'Show Column View'}
              </button>
              <button
                onClick={() => setShowDebug(!showDebug)}
                className="danger"
              >
                {showDebug ? 'Hide Debug Info' : 'Show Debug Info'}
              </button>
                <button
                  onClick={() => setShowSubareas(!showSubareas)}
                  style={{ 
                    backgroundColor: showSubareas ? 'var(--primary-hover)' : 'var(--primary-color)'
                  }}
                >
                  {showSubareas ? 'Hide Subareas' : 'Show Subareas'}
              </button>
            </>
          )}
        </div>

        {isLoading && currentCity && (
          <div className="card" style={{ backgroundColor: '#f0f9ff', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div className="loading" style={{ width: '24px', height: '24px' }}></div>
              <span>Processing city: {currentCity}</span>
            </div>
          </div>
        )}

      {showConfirmation && (
        <div className="card" style={{ backgroundColor: '#f0fdf4' }}>
          <p style={{ marginBottom: '15px' }}>
            First city has been processed. Would you like to continue with the remaining {remainingCities.length} cities?
          </p>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={handleContinue}
              className="success"
            >
              Continue with Remaining Cities
            </button>
            <button
              onClick={handleCancel}
              className="danger"
            >
              Stop Here
            </button>
          </div>
        </div>
      )}

      {results.length > 0 && !showColumnView && (
        <div className="card">
          <h2>Results</h2>
          {results.map((result, index) => (
            <div
              key={index}
              className="card"
              style={{ marginBottom: index === results.length - 1 ? 0 : '15px' }}
            >
              <h3 style={{ marginBottom: '10px' }}>
                {cityList.split('\n').filter(city => city.trim())[index]}:
              </h3>
              <p style={{ whiteSpace: 'pre-wrap' }}>{result}</p>
            </div>
          ))}
        </div>
      )}

      {results.length > 0 && showColumnView && (
        <div className="card">
          <h2>Column View</h2>
          <div style={{ display: 'flex', gap: '12px', marginBottom: '15px', alignItems: 'center' }}>
            <button
              onClick={handleCopyColumn}
              className="warning"
            >
              Copy to Clipboard
            </button>
            <span className="help-text">
              One result per line, ready to paste into spreadsheet columns
            </span>
          </div>
          <textarea
            ref={columnTextRef}
            value={formatForColumnView(results)}
            readOnly
            style={{
              height: '300px',
              fontFamily: 'monospace',
              fontSize: '14px',
              lineHeight: '1.4',
            }}
          />
        </div>
      )}

      {showDebug && results.length > 0 && (
        <div className="card" style={{ borderColor: 'var(--danger-color)' }}>
          <h2>Debug Information</h2>
          
          <div style={{ marginBottom: '20px' }}>
            <h3>Original Text (for {baseCity}):</h3>
            <div className="card" style={{ backgroundColor: '#f8fafc' }}>
              <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{sourceText}</pre>
            </div>
          </div>
          
          <div style={{ marginBottom: '20px' }}>
            <h3>City Research Information:</h3>
            <div className="card" style={{ backgroundColor: '#f0f9ff' }}>
              <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{cityInfo}</pre>
                </div>
              </div>
                  
                  <div style={{ marginBottom: '20px' }}>
                    <h3>Key Terms for Verification:</h3>
                    <div className="card" style={{ backgroundColor: '#f0f9ff' }}>
                      <p style={{ margin: 0 }}>{keyTerms.join(', ')}</p>
            </div>
          </div>
          
          <div style={{ marginBottom: '20px' }}>
            <h3>AI Generated Text (for {currentCity || cityList.split('\n')[0]}):</h3>
            <div className="card" style={{ backgroundColor: '#f8fafc' }}>
              <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{results[0]}</pre>
            </div>
          </div>
          
          <div>
            <h3>Difference Analysis:</h3>
            <div className="card" style={{ backgroundColor: '#f8fafc' }}>
              <p style={{ marginBottom: '8px' }}>Original length: {sourceText.length} characters</p>
              <p style={{ marginBottom: '8px' }}>Generated length: {results[0]?.length || 0} characters</p>
              <p style={{ marginBottom: '8px' }}>Difference: {Math.abs((results[0]?.length || 0) - sourceText.length)} characters</p>
                  <p style={{ marginBottom: '8px' }}>Max allowed difference: {Math.max(15, Math.floor(sourceText.length * 0.05))} characters</p>
                  <p style={{ marginBottom: '8px' }}>Is length acceptable: {isLengthAcceptable(sourceText, results[0]) ? 'Yes' : 'No'}</p>
                  <p style={{ marginBottom: '8px' }}>Is simple replacement: {
                    results[0] && cityList 
                      ? isSimpleReplacement(sourceText, results[0], baseCity, cityList.split('\n')[0].trim()) 
                        ? 'Yes' 
                        : 'No'
                      : 'N/A'
                  }</p>
                  <p style={{ marginBottom: '8px' }}>Key terms verification: {termVerification.found} of {termVerification.total} terms found</p>
                  <p style={{ marginBottom: '8px' }}>Terms verification passed: {termVerification.found >= Math.min(3, termVerification.total) ? 'Yes' : 'No'}</p>
                  <p>Reason for fallback: {
                    !results[0] 
                      ? 'No results generated' 
                      : !isLengthAcceptable(sourceText, results[0]) 
                        ? `Length difference exceeds ${Math.max(15, Math.floor(sourceText.length * 0.05))} characters` 
                        : isSimpleReplacement(sourceText, results[0], baseCity, cityList.split('\n')[0].trim())
                          ? 'AI generated text is too similar to simple replacement'
                          : termVerification.found < Math.min(3, termVerification.total)
                            ? 'Not enough city-specific key terms included'
                            : 'N/A - Using AI enhanced text'
                  }</p>
                </div>
              </div>
            </div>
          )}

          {showSubareas && (
            <div className="card">
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginBottom: '20px'
              }}>
                <h2 style={{ margin: 0 }}>Subareas Manager</h2>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button
                    onClick={handlePasteAndProcess}
                    style={{ 
                      backgroundColor: 'var(--success-color)',
                      fontSize: '0.9rem',
                      padding: '8px 12px'
                    }}
                  >
                    📋 Paste & Process
                  </button>
                  <button
                    onClick={handleClearSubareas}
                    style={{ 
                      backgroundColor: 'var(--danger-color)',
                      fontSize: '0.9rem',
                      padding: '8px 12px'
                    }}
                  >
                    🗑️ Clear All
                  </button>
                </div>
              </div>

              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: '1fr 1fr',
                gap: '20px',
                marginBottom: '20px'
              }}>
                <div>
                  <label className="label">Enter Subareas (one per line):</label>
                  <textarea
                    ref={subareasRef}
                    value={subareas}
                    onChange={(e) => setSubareas(e.target.value)}
                    style={{ 
                      height: '300px',
                      fontFamily: 'monospace',
                      fontSize: '14px',
                      lineHeight: '1.4'
                    }}
                    placeholder="Enter subareas, one per line.&#10;The system will add checkmarks automatically.&#10;&#10;Example:&#10;Downtown Leesburg&#10;Silver Lake&#10;Arlington Ridge"
                  />
                  <div style={{ 
                    display: 'flex', 
                    gap: '12px', 
                    marginTop: '10px',
                    justifyContent: 'space-between'
                  }}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={handleProcessSubareas}
                        className="success"
                        style={{ fontSize: '0.9rem' }}
                      >
                        ✅ Add Checkmarks
                      </button>
                      <button
                        onClick={handleCopySubareas}
                        className="warning"
                        style={{ fontSize: '0.9rem' }}
                      >
                        📋 Copy All
                      </button>
                    </div>
                    <p className="help-text" style={{ margin: 0, alignSelf: 'center' }}>
                      {subareas.split('\n').filter(line => line.trim()).length} subareas
                    </p>
                  </div>
                </div>

                <div>
                  <h3 style={{ marginTop: 0 }}>Preview (3-Column Layout)</h3>
                  <div style={{ 
                    backgroundColor: '#f8fafc',
                    borderRadius: '0.5rem',
                    padding: '1.5rem',
                    height: 'calc(300px + 2.5rem)', // Match textarea height + buttons
                    overflowY: 'auto'
                  }}>
                    <div style={{ 
                      display: 'grid',
                      gridTemplateColumns: 'repeat(3, 1fr)',
                      gap: '20px',
                    }}>
                      {Object.entries(formatSubareasToColumns(subareas)).map(([key, items], index) => (
                        <div key={key}>
                          <h4 style={{ 
                            fontSize: '0.9rem', 
                            color: 'var(--text-color)',
                            opacity: 0.7,
                            marginTop: 0,
                            marginBottom: '10px'
                          }}>
                            Column {index + 1}
                          </h4>
                          <ul style={{ 
                            listStyleType: 'none', 
                            padding: 0,
                            margin: 0
                          }}>
                            {items.map((item, i) => (
                              <li key={i} style={{ 
                                padding: '8px 0',
                                borderBottom: i < items.length - 1 ? '1px solid var(--border-color)' : 'none',
                                fontSize: '0.9rem'
                              }}>
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {showSettings && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div className="card" style={{ 
            width: '500px', 
            maxWidth: '90%',
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            <h2>Settings</h2>
            
            <div style={{ marginBottom: '20px' }}>
              <label className="label">OpenAI API Key:</label>
              <input
                type="password"
                value={localApiKey}
                onChange={(e) => setLocalApiKey(e.target.value)}
                placeholder="Enter your API key for AI enhancement feature"
              />
              <p className="help-text">
                Your API key is securely saved in your browser and will persist between sessions
              </p>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button
                onClick={() => setShowSettings(false)}
                className="danger"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveSettings}
                className="success"
              >
                Save Settings
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 