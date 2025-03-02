import React, { useState, useEffect } from 'react';

interface BusinessClient {
  id: number;
  businessName: string;
  contactPerson: string;
  email: string;
  phone: string;
  website?: string;
  industry?: string;
  projectStatus?: 'Lead' | 'Active' | 'Completed' | 'On Hold';
  notes?: string;
}

const ClientManager: React.FC = () => {
  const [clients, setClients] = useState<BusinessClient[]>(() => {
    // Load clients from localStorage on initial render
    const savedClients = localStorage.getItem('business_clients');
    return savedClients ? JSON.parse(savedClients) : [];
  });
  
  const [newClient, setNewClient] = useState<BusinessClient>({ 
    id: 0, 
    businessName: '', 
    contactPerson: '', 
    email: '', 
    phone: '', 
    website: '', 
    industry: '',
    projectStatus: 'Lead',
    notes: '' 
  });

  // Save clients to localStorage whenever the clients array changes
  useEffect(() => {
    localStorage.setItem('business_clients', JSON.stringify(clients));
  }, [clients]);

  const handleAddClient = () => {
    // Validate required fields
    if (!newClient.businessName || !newClient.contactPerson || !newClient.email || !newClient.phone) {
      alert('Please fill in all required fields (Business Name, Contact Person, Email, Phone)');
      return;
    }
    
    // Generate a unique ID (using timestamp for better uniqueness)
    const newId = Date.now();
    
    setClients([...clients, { ...newClient, id: newId }]);
    setNewClient({ 
      id: 0, 
      businessName: '', 
      contactPerson: '', 
      email: '', 
      phone: '', 
      website: '', 
      industry: '',
      projectStatus: 'Lead',
      notes: '' 
    });
  };

  const handleDeleteClient = (id: number) => {
    if (confirm('Are you sure you want to delete this business client?')) {
      setClients(clients.filter(client => client.id !== id));
    }
  };

  const getStatusColor = (status?: string) => {
    switch(status) {
      case 'Lead': return '#ffc107'; // Yellow
      case 'Active': return '#28a745'; // Green
      case 'Completed': return '#6c757d'; // Gray
      case 'On Hold': return '#dc3545'; // Red
      default: return '#ffc107'; // Default to yellow
    }
  };

  return (
    <div style={{ 
      maxWidth: '100%', 
      margin: '0 auto', 
      padding: '0'
    }}>
      <h2>Business Client Manager</h2>
      <div style={{ 
        marginBottom: '20px', 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', 
        gap: '10px',
        backgroundColor: '#f8f9fa',
        padding: '15px',
        borderRadius: '8px'
      }}>
        <input
          type="text"
          placeholder="Business Name *"
          value={newClient.businessName}
          onChange={(e) => setNewClient({ ...newClient, businessName: e.target.value })}
          style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          required
        />
        <input
          type="text"
          placeholder="Contact Person *"
          value={newClient.contactPerson}
          onChange={(e) => setNewClient({ ...newClient, contactPerson: e.target.value })}
          style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          required
        />
        <input
          type="email"
          placeholder="Email *"
          value={newClient.email}
          onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
          style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          required
        />
        <input
          type="tel"
          placeholder="Phone *"
          value={newClient.phone}
          onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })}
          style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          required
        />
        <input
          type="url"
          placeholder="Website"
          value={newClient.website}
          onChange={(e) => setNewClient({ ...newClient, website: e.target.value })}
          style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
        />
        <input
          type="text"
          placeholder="Industry"
          value={newClient.industry}
          onChange={(e) => setNewClient({ ...newClient, industry: e.target.value })}
          style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
        />
        <select
          value={newClient.projectStatus}
          onChange={(e) => setNewClient({ ...newClient, projectStatus: e.target.value as any })}
          style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
        >
          <option value="Lead">Lead</option>
          <option value="Active">Active</option>
          <option value="Completed">Completed</option>
          <option value="On Hold">On Hold</option>
        </select>
        <textarea
          placeholder="Notes"
          value={newClient.notes}
          onChange={(e) => setNewClient({ ...newClient, notes: e.target.value })}
          style={{ 
            padding: '8px', 
            borderRadius: '4px', 
            border: '1px solid #ccc',
            gridColumn: 'span 2',
            resize: 'vertical',
            minHeight: '60px'
          }}
        />
        <button 
          onClick={handleAddClient} 
          style={{ 
            padding: '8px 16px', 
            backgroundColor: '#4a90e2', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px', 
            cursor: 'pointer',
            gridColumn: 'span 2'
          }}
        >
          Add Business Client
        </button>
      </div>
      
      {clients.length === 0 ? (
        <div style={{ 
          padding: '20px', 
          textAlign: 'center', 
          backgroundColor: '#f8f9fa', 
          borderRadius: '8px',
          marginTop: '20px'
        }}>
          <p>No business clients added yet. Add your first client above.</p>
        </div>
      ) : (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3>Business Client List ({clients.length})</h3>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
              <thead>
                <tr style={{ backgroundColor: '#f0f0f0' }}>
                  <th style={{ padding: '10px', textAlign: 'left', border: '1px solid #ddd' }}>Business Name</th>
                  <th style={{ padding: '10px', textAlign: 'left', border: '1px solid #ddd' }}>Contact Person</th>
                  <th style={{ padding: '10px', textAlign: 'left', border: '1px solid #ddd' }}>Email</th>
                  <th style={{ padding: '10px', textAlign: 'left', border: '1px solid #ddd' }}>Phone</th>
                  <th style={{ padding: '10px', textAlign: 'left', border: '1px solid #ddd' }}>Website</th>
                  <th style={{ padding: '10px', textAlign: 'left', border: '1px solid #ddd' }}>Industry</th>
                  <th style={{ padding: '10px', textAlign: 'center', border: '1px solid #ddd' }}>Status</th>
                  <th style={{ padding: '10px', textAlign: 'center', border: '1px solid #ddd' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {clients.map(client => (
                  <tr key={client.id}>
                    <td style={{ padding: '10px', border: '1px solid #ddd' }}><strong>{client.businessName}</strong></td>
                    <td style={{ padding: '10px', border: '1px solid #ddd' }}>{client.contactPerson}</td>
                    <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                      <a href={`mailto:${client.email}`} style={{ color: '#4a90e2', textDecoration: 'none' }}>
                        {client.email}
                      </a>
                    </td>
                    <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                      <a href={`tel:${client.phone}`} style={{ color: '#4a90e2', textDecoration: 'none' }}>
                        {client.phone}
                      </a>
                    </td>
                    <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                      {client.website ? (
                        <a href={client.website.startsWith('http') ? client.website : `https://${client.website}`} 
                           target="_blank" 
                           rel="noopener noreferrer"
                           style={{ color: '#4a90e2', textDecoration: 'none' }}>
                          {client.website}
                        </a>
                      ) : '-'}
                    </td>
                    <td style={{ padding: '10px', border: '1px solid #ddd' }}>{client.industry || '-'}</td>
                    <td style={{ padding: '10px', textAlign: 'center', border: '1px solid #ddd' }}>
                      <span style={{ 
                        backgroundColor: getStatusColor(client.projectStatus), 
                        color: 'white', 
                        padding: '3px 8px', 
                        borderRadius: '12px',
                        fontSize: '0.85em',
                        fontWeight: 'bold'
                      }}>
                        {client.projectStatus || 'Lead'}
                      </span>
                    </td>
                    <td style={{ padding: '10px', textAlign: 'center', border: '1px solid #ddd' }}>
                      <button 
                        onClick={() => handleDeleteClient(client.id)} 
                        style={{ 
                          padding: '5px 10px', 
                          backgroundColor: '#ff4d4d', 
                          color: 'white', 
                          border: 'none', 
                          borderRadius: '4px', 
                          cursor: 'pointer' 
                        }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {clients.length > 0 && (
            <div style={{ marginTop: '20px' }}>
              <h4>Client Notes</h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '15px' }}>
                {clients.map(client => (
                  client.notes && (
                    <div key={`note-${client.id}`} style={{ 
                      padding: '15px', 
                      backgroundColor: '#f8f9fa', 
                      borderRadius: '8px',
                      border: '1px solid #ddd'
                    }}>
                      <h5 style={{ margin: '0 0 10px 0' }}>{client.businessName}</h5>
                      <p style={{ margin: '0', whiteSpace: 'pre-wrap' }}>{client.notes}</p>
                    </div>
                  )
                )).filter(Boolean)}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ClientManager; 