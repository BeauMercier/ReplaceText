import React, { useState, useEffect } from 'react';

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

const BlogManager: React.FC = () => {
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>(() => {
    // Load blog posts from localStorage on initial render
    const savedPosts = localStorage.getItem('blog_posts');
    return savedPosts ? JSON.parse(savedPosts) : [];
  });
  
  const [newPost, setNewPost] = useState<BlogPost>({
    id: 0,
    title: '',
    excerpt: '',
    content: '',
    author: '',
    publishDate: new Date().toISOString().split('T')[0],
    status: 'Draft',
    tags: []
  });

  // Save blog posts to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('blog_posts', JSON.stringify(blogPosts));
  }, [blogPosts]);

  const handleAddPost = () => {
    // Validate required fields
    if (!newPost.title || !newPost.content) {
      alert('Please fill in at least the title and content fields');
      return;
    }
    
    // Generate a unique ID
    const newId = Date.now();
    
    setBlogPosts([...blogPosts, { ...newPost, id: newId }]);
    setNewPost({
      id: 0,
      title: '',
      excerpt: '',
      content: '',
      author: '',
      publishDate: new Date().toISOString().split('T')[0],
      status: 'Draft',
      tags: []
    });
  };

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

  return (
    <div style={{ maxWidth: '100%', margin: '0 auto', padding: '0' }}>
      <h2>Blog Manager</h2>
      
      <div style={{ 
        marginBottom: '20px', 
        backgroundColor: '#f8f9fa',
        padding: '15px',
        borderRadius: '8px'
      }}>
        <div style={{ marginBottom: '15px' }}>
          <input
            type="text"
            placeholder="Blog Title *"
            value={newPost.title}
            onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
            style={{ 
              padding: '8px', 
              borderRadius: '4px', 
              border: '1px solid #ccc',
              marginBottom: '10px',
              width: '100%'
            }}
            required
          />
          
          <input
            type="text"
            placeholder="Excerpt/Summary"
            value={newPost.excerpt}
            onChange={(e) => setNewPost({ ...newPost, excerpt: e.target.value })}
            style={{ 
              padding: '8px', 
              borderRadius: '4px', 
              border: '1px solid #ccc',
              marginBottom: '10px',
              width: '100%'
            }}
          />
        </div>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', 
          gap: '10px',
          marginBottom: '15px'
        }}>
          <input
            type="text"
            placeholder="Author"
            value={newPost.author}
            onChange={(e) => setNewPost({ ...newPost, author: e.target.value })}
            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
          
          <input
            type="date"
            value={newPost.publishDate}
            onChange={(e) => setNewPost({ ...newPost, publishDate: e.target.value })}
            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
          
          <select
            value={newPost.status}
            onChange={(e) => setNewPost({ ...newPost, status: e.target.value as any })}
            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          >
            <option value="Draft">Draft</option>
            <option value="Published">Published</option>
            <option value="Scheduled">Scheduled</option>
          </select>
          
          <input
            type="text"
            placeholder="Tags (comma separated)"
            value={newPost.tags?.join(', ') || ''}
            onChange={(e) => setNewPost({ 
              ...newPost, 
              tags: e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag) 
            })}
            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
        </div>
        
        <textarea
          placeholder="Blog Content *"
          value={newPost.content}
          onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
          style={{ 
            padding: '8px', 
            borderRadius: '4px', 
            border: '1px solid #ccc',
            width: '100%',
            minHeight: '150px',
            marginBottom: '15px',
            resize: 'vertical'
          }}
          required
        />
        
        <button 
          onClick={handleAddPost} 
          style={{ 
            padding: '8px 16px', 
            backgroundColor: '#4a90e2', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px', 
            cursor: 'pointer'
          }}
        >
          Add Blog Post
        </button>
      </div>
      
      {blogPosts.length === 0 ? (
        <div style={{ 
          padding: '20px', 
          textAlign: 'center', 
          backgroundColor: '#f8f9fa', 
          borderRadius: '8px',
          marginTop: '20px'
        }}>
          <p>No blog posts added yet. Create your first post above.</p>
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
                  {post.excerpt || post.content.substring(0, 100) + '...'}
                </p>
                
                {post.tags && post.tags.length > 0 && (
                  <div style={{ marginBottom: '15px' }}>
                    {post.tags.map((tag, index) => (
                      <span key={index} style={{ 
                        backgroundColor: '#e2e8f0', 
                        padding: '2px 8px', 
                        borderRadius: '12px',
                        fontSize: '0.75em',
                        marginRight: '5px',
                        display: 'inline-block',
                        marginBottom: '5px'
                      }}>
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: 'auto' }}>
                  <button 
                    onClick={() => handleDeletePost(post.id)} 
                    style={{ 
                      padding: '5px 10px', 
                      backgroundColor: '#ff4d4d', 
                      color: 'white', 
                      border: 'none', 
                      borderRadius: '4px', 
                      cursor: 'pointer',
                      fontSize: '0.85em'
                    }}
                  >
                    Delete
                  </button>
                  <button 
                    style={{ 
                      padding: '5px 10px', 
                      backgroundColor: '#4a90e2', 
                      color: 'white', 
                      border: 'none', 
                      borderRadius: '4px', 
                      cursor: 'pointer',
                      fontSize: '0.85em'
                    }}
                  >
                    Edit
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default BlogManager; 