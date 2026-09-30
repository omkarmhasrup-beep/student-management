import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../hooks/useTheme';
import { useToast } from '../hooks/useToast';
import { api } from '../services/api';
import { User, Palette, Mail, List } from 'lucide-react';

const Settings = () => {
  const { theme, toggleTheme } = useTheme();
  const { user, updateProfile } = useAuth();
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState('appearance');

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || user?.username || '');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Custom Fields state
  const [customFields, setCustomFields] = useState(user?.custom_fields_config || []);
  const [newFieldName, setNewFieldName] = useState('');
  const [newFieldType, setNewFieldType] = useState('text');
  const [isSavingCustomFields, setIsSavingCustomFields] = useState(false);

  const handleAddCustomField = () => {
    if (!newFieldName.trim()) return;
    const newField = { name: newFieldName.trim(), type: newFieldType };
    setCustomFields([...customFields, newField]);
    setNewFieldName('');
  };

  const handleRemoveCustomField = (indexToRemove) => {
    setCustomFields(customFields.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSaveCustomFields = async () => {
    setIsSavingCustomFields(true);
    try {
      await updateProfile(user.name, user.email, customFields);
      addToast('Custom fields saved successfully!', 'success');
    } catch (error) {
      addToast('Failed to save custom fields', 'error');
    } finally {
      setIsSavingCustomFields(false);
    }
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      await updateProfile(name, email);
    } catch (error) {
      if (error.response?.data?.detail) {
        addToast(error.response.data.detail, 'error');
      } else {
        addToast('Failed to update profile', 'error');
      }
    } finally {
      setIsSaving(false);
      setIsEditingProfile(false);
    }
  };

  const tabs = [
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'fields', label: 'Custom Fields', icon: List }
  ];

  return (
    <div className="settings-page flex-col gap-6" style={{ maxWidth: '900px', margin: '0 auto', width: '100%' }}>
      <div>
        <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Settings</h2>
        <p className="text-muted">Manage your appearance, email configuration, and custom fields.</p>
      </div>
      
      {/* Tab Navigation */}
      <div style={{ display: 'flex', gap: '2rem', borderBottom: '1px solid var(--border-color)', marginBottom: '2rem', overflowX: 'auto' }}>
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 0',
                background: 'none',
                border: 'none',
                color: isActive ? 'var(--primary-color)' : 'var(--text-muted)',
                borderBottom: isActive ? '2px solid var(--primary-color)' : '2px solid transparent',
                cursor: 'pointer',
                fontWeight: isActive ? 500 : 400,
                fontSize: '0.95rem',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s'
              }}
            >
              <Icon size={18} />
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="card" style={{ padding: '2rem' }}>

        {activeTab === 'appearance' && (
          <div className="settings-section fade-in">
             <div style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ margin: 0, fontSize: '1.25rem' }}>Appearance</h3>
                <p className="text-muted text-sm mt-1">Customize the look and feel of the application.</p>
              </div>
              
              <div style={{ marginBottom: '2rem' }}>
                  <label className="form-label" style={{ marginBottom: '1rem', display: 'block', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Theme</label>
                  <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                      <button 
                        onClick={() => theme === 'dark' && toggleTheme()}
                        style={{ 
                            padding: '1.5rem', 
                            borderRadius: '12px', 
                            border: theme === 'light' ? '2px solid var(--primary-color)' : '1px solid var(--border-color)',
                            backgroundColor: 'var(--bg-color)',
                            color: 'var(--text-primary)',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '0.75rem',
                            cursor: 'pointer',
                            minWidth: '140px',
                            transition: 'all 0.2s'
                        }}
                      >
                          <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
                              ☀
                          </div>
                          <span style={{ fontWeight: 500 }}>Light Mode</span>
                      </button>

                      <button 
                         onClick={() => theme === 'light' && toggleTheme()}
                        style={{ 
                            padding: '1.5rem', 
                            borderRadius: '12px', 
                            border: theme === 'dark' ? '2px solid var(--primary-color)' : '1px solid var(--border-color)',
                            backgroundColor: 'var(--bg-color)',
                            color: 'var(--text-primary)',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '0.75rem',
                            cursor: 'pointer',
                            minWidth: '140px',
                            transition: 'all 0.2s'
                        }}
                      >
                          <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#1e293b', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
                              🌙
                          </div>
                          <span style={{ fontWeight: 500 }}>Dark Mode</span>
                      </button>
                  </div>
              </div>

              <div style={{ marginBottom: '2rem' }}>
                <label className="form-label" style={{ marginBottom: '1rem', display: 'block', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Accent Color</label>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                  {[
                    { id: 'violet', color: '#8b5cf6' },
                    { id: 'blue', color: '#3b82f6' },
                    { id: 'green', color: '#10b981' },
                    { id: 'pink', color: '#ec4899' },
                  ].map((accent) => {
                    const { accentColor, setAccentColor } = useTheme();
                    return (
                      <button
                        key={accent.id}
                        onClick={() => setAccentColor(accent.id)}
                        style={{
                          width: '48px',
                          height: '48px',
                          borderRadius: '50%',
                          backgroundColor: accent.color,
                          border: accentColor === accent.id ? `3px solid var(--border-color)` : '3px solid transparent',
                          outline: accentColor === accent.id ? `2px solid ${accent.color}` : 'none',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#fff',
                          transition: 'all 0.2s',
                        }}
                      >
                        {accentColor === accent.id && (
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12"></polyline>
                          </svg>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>
          </div>
        )}

        {activeTab === 'fields' && (
          <div className="settings-section fade-in">
             <div style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ margin: 0, fontSize: '1.25rem' }}>Student Form Fields</h3>
                <p className="text-muted text-sm mt-1">Define custom fields that will appear on the 'Add Student' and 'Edit Student' forms.</p>
              </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
              {customFields.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {customFields.map((field, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', backgroundColor: 'var(--bg-color)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: 'var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                            <List size={16} />
                        </div>
                        <div>
                            <div style={{ fontWeight: 500 }}>{field.name}</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginTop: '0.2rem' }}>
                            {field.type} Field
                            </div>
                        </div>
                      </div>
                      <button className="btn btn-secondary" style={{ padding: '0.35rem 0.75rem', color: 'var(--danger-color)' }} onClick={() => handleRemoveCustomField(idx)}>Remove</button>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', border: '1px dashed var(--border-color)', borderRadius: 'var(--radius-md)' }}>
                  No custom fields defined yet. Add one below.
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end', marginBottom: '2rem', flexWrap: 'wrap', padding: '1.5rem', backgroundColor: 'var(--bg-color)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
              <div className="form-group" style={{ marginBottom: 0, flex: 1, minWidth: '200px' }}>
                <label className="form-label">New Field Name</label>
                <input type="text" className="form-input" placeholder="e.g. Blood Group" value={newFieldName} onChange={(e) => setNewFieldName(e.target.value)} />
              </div>
              <div className="form-group" style={{ marginBottom: 0, width: '150px' }}>
                <label className="form-label">Field Type</label>
                <select className="form-input" value={newFieldType} onChange={(e) => setNewFieldType(e.target.value)}>
                  <option value="text">Text</option>
                  <option value="number">Number</option>
                  <option value="date">Date</option>
                </select>
              </div>
              <button className="btn btn-secondary" style={{ height: '42px' }} onClick={handleAddCustomField} disabled={!newFieldName.trim()}>
                Add Field
              </button>
            </div>

            <button className="btn btn-primary" onClick={handleSaveCustomFields} disabled={isSavingCustomFields}>
              {isSavingCustomFields ? 'Saving...' : 'Save Custom Fields'}
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default Settings;
