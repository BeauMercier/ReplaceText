import React, { useState, useEffect } from 'react';
import OpenAI from 'openai';

interface BlogPost {
  id: number;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  publishDate: string;
  status: 'Draft' | 'Published' | 'Scheduled';
  tags?: string[];
}

interface BlogInfo {
  url: string;
  businessName: string;
  contactInfo: string;
  existingBlogs: string[];
}

interface BlogIdea {
  title: string;
  description: string;
  selected: boolean;
}

const BlogManager: React.FC = () => {
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>(() => {
    // Load blog posts from localStorage on initial render
    const savedPosts = localStorage.getItem('blog_posts');
    return savedPosts ? JSON.parse(savedPosts) : [];
  });
  
  // Blog idea generation states
  const [blogInfo, setBlogInfo] = useState<BlogInfo>(() => {
    // Load blog info from localStorage
    const savedInfo = localStorage.getItem('blog_info');
    return savedInfo ? JSON.parse(savedInfo) : {
      url: '',
      businessName: '',
      contactInfo: '',
      existingBlogs: []
    };
  });
  const [blogIdeas, setBlogIdeas] = useState<BlogIdea[]>([]);
  const [isGeneratingIdeas, setIsGeneratingIdeas] = useState(false);
  const [selectedBlogIdeas, setSelectedBlogIdeas] = useState<string[]>([]);
  const [selectedModel, setSelectedModel] = useState<'gpt-4-0125-preview' | 'gpt-3.5-turbo'>('gpt-4-0125-preview');
  const [apiKey, setApiKey] = useState(() => {
    // Load API key from localStorage
    return localStorage.getItem('openai_api_key') || '';
  });
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);

  // Save blog posts to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('blog_posts', JSON.stringify(blogPosts));
  }, [blogPosts]);

  // Save blog info to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('blog_info', JSON.stringify(blogInfo));
  }, [blogInfo]);

  const handleDeletePost = (id: number) => {
    if (confirm('Are you sure you want to delete this blog post?')) {
      setBlogPosts(blogPosts.filter(post => post.id !== id));
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Draft': return '#6c757d'; // Gray
      case 'Published': return '#28a745'; // Green
      case 'Scheduled': return '#ffc107'; // Yellow
      default: return '#6c757d'; // Default to gray
    }
  };

  const handleGenerateBlogIdeas = async () => {
    if (!apiKey) {
      alert('Please configure your API key first');
      setShowApiKeyInput(true);
      return;
    }

    if (!blogInfo.businessName || !blogInfo.url) {
      alert('Please enter at least the business name and website URL');
      return;
    }

    setIsGeneratingIdeas(true);
    try {
      const openai = new OpenAI({
        apiKey: apiKey,
        dangerouslyAllowBrowser: true
      });

      // First, analyze the business website to determine the industry
      const analyzePrompt = `Based on this business information:
Business Name: ${blogInfo.businessName}
Website: ${blogInfo.url}

Please identify:
1. The main industry/business type
2. Key products or services
3. Target audience
4. Main value propositions

Return this in a structured format.`;

      const analysisCompletion = await openai.chat.completions.create({
        messages: [
          {
            role: "system",
            content: "You are a business analyst who helps identify key business characteristics and target markets."
          },
          {
            role: "user",
            content: analyzePrompt
          }
        ],
        model: selectedModel,
        temperature: 0.3,
      });

      const businessAnalysis = analysisCompletion.choices[0]?.message?.content || '';

      // Now generate blog ideas based on the business analysis
      const prompt = `Generate 10 unique blog post ideas for ${blogInfo.businessName} (${blogInfo.url}).

Business Analysis:
${businessAnalysis}

Current blog posts:
${blogInfo.existingBlogs.join('\n')}

Requirements:
1. Each idea should be unique and not overlap with existing blog posts
2. Focus on topics relevant to ${blogInfo.businessName}'s industry and target audience
3. Include a mix of:
   - Educational content about their products/services
   - Industry trends and news
   - Customer success stories and case studies
   - Problem-solving content for common customer pain points
   - Seasonal or timely content when relevant
4. Each idea should have a catchy title and brief description
5. Ensure topics are relevant to their specific target audience

Format each idea as:
Title: [Catchy Title]
Description: [2-3 sentence description of the blog post content]`;

      const completion = await openai.chat.completions.create({
        messages: [
          {
            role: "system",
            content: "You are an expert content strategist who creates engaging, industry-specific blog ideas that will attract and inform potential customers."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        model: selectedModel,
        temperature: 0.7,
      });

      const ideas = completion.choices[0]?.message?.content || '';
      const ideaList = ideas.split('\n\n').filter(idea => idea.trim()).map(idea => {
        const [titleLine, descLine] = idea.split('\n');
        return {
          title: titleLine.replace('Title:', '').trim(),
          description: descLine.replace('Description:', '').trim(),
          selected: false
        };
      });

      setBlogIdeas(ideaList);
    } catch (error) {
      console.error('Error generating blog ideas:', error);
      alert('Error generating blog ideas. Please check the console for details.');
    } finally {
      setIsGeneratingIdeas(false);
    }
  };

  const handleSaveApiKey = () => {
    localStorage.setItem('openai_api_key', apiKey);
    setShowApiKeyInput(false);
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      <div style={{ 
        textAlign: 'center', 
        marginBottom: '30px',
        padding: '20px 0',
        borderBottom: '1px solid var(--border-color)'
      }}>
        <h1 style={{ 
          fontSize: '2.5rem', 
          margin: '0 0 15px 0',
          fontWeight: '700'
        }}>Blog Manager</h1>
      </div>

      {/* Model and API Key Controls */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '20px',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <button
          onClick={() => setShowApiKeyInput(!showApiKeyInput)}
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
          <span>⚙️</span> API Key Settings
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

      {showApiKeyInput && (
        <div style={{ 
          marginBottom: '20px',
          padding: '15px',
          backgroundColor: '#f8f9fa',
          borderRadius: '8px',
          border: '1px solid var(--border-color)'
        }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
            OpenAI API Key:
          </label>
          <div style={{ display: 'flex', gap: '10px' }}>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter your OpenAI API key"
              style={{ 
                flex: 1,
                padding: '8px 12px',
                borderRadius: '4px',
                border: '1px solid #ccc'
              }}
            />
            <button
              onClick={handleSaveApiKey}
              style={{ 
                padding: '8px 16px',
                backgroundColor: 'var(--primary-color)',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Save Key
            </button>
          </div>
          <p style={{ 
            margin: '8px 0 0 0',
            fontSize: '0.9rem',
            color: '#666'
          }}>
            Your API key is stored locally in your browser and is used for blog idea generation.
          </p>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {/* Left side: Existing blog posts */}
        <div>
          {blogPosts.length === 0 ? (
            <div style={{ 
              padding: '20px', 
              textAlign: 'center', 
              backgroundColor: '#f8f9fa', 
              borderRadius: '8px',
              marginTop: '20px'
            }}>
              <p>No blog posts available.</p>
            </div>
          ) : (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3>Blog Posts ({blogPosts.length})</h3>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '15px', marginTop: '15px' }}>
                {blogPosts.map(post => (
                  <div key={post.id} style={{ 
                    backgroundColor: 'white', 
                    borderRadius: '8px', 
                    padding: '15px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                    display: 'flex',
                    flexDirection: 'column'
                  }}>
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      marginBottom: '10px'
                    }}>
                      <h4 style={{ margin: 0 }}>{post.title}</h4>
                      <span style={{ 
                        backgroundColor: getStatusColor(post.status), 
                        color: 'white', 
                        padding: '3px 8px', 
                        borderRadius: '12px',
                        fontSize: '0.75em',
                        fontWeight: 'bold'
                      }}>
                        {post.status}
                      </span>
                    </div>
                    
                    <p style={{ 
                      margin: '0 0 10px 0', 
                      fontSize: '0.9em', 
                      color: '#666',
                      display: 'flex',
                      justifyContent: 'space-between'
                    }}>
                      <span>{post.author || 'Unknown author'}</span>
                      <span>{new Date(post.publishDate).toLocaleDateString()}</span>
                    </p>
                    
                    <p style={{ 
                      margin: '0 0 15px 0',
                      fontSize: '0.9em',
                      flex: '1'
                    }}>
                      {post.excerpt || post.content.substring(0, 120) + '...'}
                    </p>
                    
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between',
                      borderTop: '1px solid #eee',
                      paddingTop: '10px',
                      marginTop: 'auto'
                    }}>
                      <button 
                        style={{ 
                          padding: '5px 10px', 
                          backgroundColor: '#6c757d', 
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          fontSize: '0.8em',
                          cursor: 'pointer'
                        }}
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDeletePost(post.id)}
                        style={{ 
                          padding: '5px 10px', 
                          backgroundColor: '#dc3545', 
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          fontSize: '0.8em',
                          cursor: 'pointer'
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right side: Blog idea generator */}
        <div>
          {/* Business Information Section */}
          <div style={{ 
            marginBottom: '20px',
            backgroundColor: '#f8f9fa',
            padding: '15px',
            borderRadius: '8px'
          }}>
            <h3 style={{ marginTop: 0 }}>Business Information</h3>
            <div style={{ display: 'grid', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '5px' }}>Business Website URL:</label>
                <input
                  type="text"
                  value={blogInfo.url}
                  onChange={(e) => setBlogInfo(prev => ({ ...prev, url: e.target.value }))}
                  placeholder="https://example.com"
                  style={{ 
                    padding: '8px', 
                    borderRadius: '4px', 
                    border: '1px solid #ccc',
                    width: '100%'
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '5px' }}>Business Name:</label>
                <input
                  type="text"
                  value={blogInfo.businessName}
                  onChange={(e) => setBlogInfo(prev => ({ ...prev, businessName: e.target.value }))}
                  placeholder="Your Business Name"
                  style={{ 
                    padding: '8px', 
                    borderRadius: '4px', 
                    border: '1px solid #ccc',
                    width: '100%'
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '5px' }}>Contact Information:</label>
                <input
                  type="text"
                  value={blogInfo.contactInfo}
                  onChange={(e) => setBlogInfo(prev => ({ ...prev, contactInfo: e.target.value }))}
                  placeholder="Contact details for the business"
                  style={{ 
                    padding: '8px', 
                    borderRadius: '4px', 
                    border: '1px solid #ccc',
                    width: '100%'
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '5px' }}>Existing Blog Posts (one per line):</label>
                <textarea
                  value={blogInfo.existingBlogs.join('\n')}
                  onChange={(e) => setBlogInfo(prev => ({ 
                    ...prev, 
                    existingBlogs: e.target.value.split('\n').filter(blog => blog.trim()) 
                  }))}
                  placeholder="List existing blog titles, one per line"
                  style={{ 
                    padding: '8px', 
                    borderRadius: '4px', 
                    border: '1px solid #ccc',
                    width: '100%',
                    minHeight: '150px',
                    resize: 'vertical'
                  }}
                />
              </div>
            </div>
          </div>

          {/* Blog Ideas Section */}
          <div style={{ 
            marginBottom: '20px',
            backgroundColor: '#f8f9fa',
            padding: '15px',
            borderRadius: '8px'
          }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: '15px'
            }}>
              <h3 style={{ margin: 0 }}>Blog Ideas Generator</h3>
              <button
                onClick={handleGenerateBlogIdeas}
                disabled={isGeneratingIdeas || !blogInfo.businessName}
                style={{ 
                  padding: '8px 16px',
                  backgroundColor: 'var(--primary-color)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  opacity: isGeneratingIdeas || !blogInfo.businessName ? 0.7 : 1
                }}
              >
                {isGeneratingIdeas ? 'Generating Ideas...' : '🎯 Generate New Ideas'}
              </button>
            </div>

            {isGeneratingIdeas && (
              <div style={{ 
                padding: '20px', 
                textAlign: 'center', 
                backgroundColor: '#f0f9ff', 
                borderRadius: '8px',
                marginBottom: '15px'
              }}>
                <p>Generating blog ideas for {blogInfo.businessName}...</p>
              </div>
            )}

            {blogIdeas.length > 0 && (
              <div style={{ 
                display: 'grid', 
                gap: '15px',
                marginTop: '20px'
              }}>
                {blogIdeas.map((idea, index) => (
                  <div 
                    key={index}
                    style={{ 
                      padding: '15px',
                      backgroundColor: idea.selected ? '#f0fdf4' : 'white',
                      borderRadius: '8px',
                      border: '1px solid #eee',
                      transition: 'all 0.2s ease',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                    }}
                  >
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'flex-start', 
                      gap: '12px'
                    }}>
                      <input
                        type="checkbox"
                        checked={idea.selected}
                        onChange={() => {
                          const newIdeas = [...blogIdeas];
                          newIdeas[index].selected = !newIdeas[index].selected;
                          setBlogIdeas(newIdeas);
                          setSelectedBlogIdeas(newIdeas
                            .filter(idea => idea.selected)
                            .map(idea => idea.title)
                          );
                        }}
                        style={{ 
                          marginTop: '4px',
                          width: '18px',
                          height: '18px'
                        }}
                      />
                      <div style={{ flex: 1 }}>
                        <h4 style={{ 
                          margin: '0 0 8px 0',
                          fontSize: '1.1rem',
                          fontWeight: '600',
                          lineHeight: '1.4'
                        }}>{idea.title}</h4>
                        <p style={{ 
                          margin: 0,
                          fontSize: '0.9rem',
                          lineHeight: '1.5',
                          color: '#555'
                        }}>{idea.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {selectedBlogIdeas.length > 0 && (
            <div style={{ 
              marginTop: '20px',
              padding: '15px',
              backgroundColor: '#f8f9fa',
              borderRadius: '8px',
              border: '1px solid #eee'
            }}>
              <h3 style={{ 
                margin: '0 0 15px 0',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <span>Selected Blog Posts</span>
                <span style={{ 
                  backgroundColor: 'var(--primary-color)',
                  color: 'white',
                  padding: '2px 8px',
                  borderRadius: '12px',
                  fontSize: '0.9rem'
                }}>{selectedBlogIdeas.length}</span>
              </h3>
              <div style={{ 
                display: 'grid',
                gap: '10px'
              }}>
                {selectedBlogIdeas.map((title, index) => (
                  <div 
                    key={index}
                    style={{
                      padding: '10px 12px',
                      backgroundColor: 'white',
                      borderRadius: '6px',
                      border: '1px solid #eee',
                      fontSize: '0.95rem'
                    }}
                  >
                    {title}
                  </div>
                ))}
              </div>
              <div style={{ marginTop: '15px' }}>
                <button
                  onClick={() => {
                    const newIdeas = blogIdeas.map(idea => ({...idea, selected: false}));
                    setBlogIdeas(newIdeas);
                    setSelectedBlogIdeas([]);
                  }}
                  style={{ 
                    padding: '8px 16px',
                    backgroundColor: '#dc3545',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Clear Selection
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BlogManager; 