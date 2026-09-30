import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../hooks/useToast';
import { User, Edit2, Mail, Save } from 'lucide-react';
import { api } from '../services/api';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const { addToast } = useToast();

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || user?.username || '');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [smtpHost, setSmtpHost] = useState('smtp.gmail.com');
  const [smtpPort, setSmtpPort] = useState(587);
  const [smtpUsername, setSmtpUsername] = useState(user?.email || '');
  const [smtpPassword, setSmtpPassword] = useState('');
  const [isEditingSmtp, setIsEditingSmtp] = useState(false);
  const [isSavingSmtp, setIsSavingSmtp] = useState(false);

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      await updateProfile(name, email);
      addToast('Profile updated successfully', 'success');
      setIsEditingProfile(false);
    } catch (error) {
      if (error.response?.data?.detail) {
        addToast(error.response.data.detail, 'error');
      } else {
        addToast('Failed to update profile', 'error');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveSMTP = async () => {
    setIsSavingSmtp(true);
    try {
      await api.put('/users/me/smtp', {
        smtp_host: smtpHost,
        smtp_port: parseInt(smtpPort, 10),
        smtp_username: smtpUsername,
        smtp_password: smtpPassword
      });
      addToast('SMTP Settings saved successfully!', 'success');
      setSmtpPassword(''); // Clear password field after saving
      if (updateProfile) {
          // Trigger a silent update to refresh user.has_smtp_configured
          updateProfile(name, email);
      }
    } catch (error) {
      if (error.response?.data?.detail) {
        addToast(error.response.data.detail, 'error');
      } else {
        addToast('Failed to save SMTP settings', 'error');
      }
    } finally {
      setIsSavingSmtp(false);
      setIsEditingSmtp(false);
    }
  };

  return (
    <div className="profile-page flex-col gap-6" style={{ maxWidth: '900px', margin: '0 auto', width: '100%' }}>
      <div>
        <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Profile</h2>
        <p className="text-muted">Manage your personal information, account details, and email settings.</p>
      </div>

      <div className="card" style={{ padding: '2rem', marginBottom: '2rem' }}>
        <div className="settings-section fade-in">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <User size={20} className="text-muted" /> Personal Information
              </h3>
            </div>
            {!isEditingProfile && (
              <button className="btn btn-secondary flex items-center gap-2" onClick={() => setIsEditingProfile(true)}>
                  <Edit2 size={16} /> Edit Profile
              </button>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--border-color)' }}>
              <div className="avatar" style={{ width: '80px', height: '80px', fontSize: '2rem', backgroundColor: 'var(--primary-light)', color: 'var(--primary-color)' }}>
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div>
                  <div style={{ fontWeight: 600, fontSize: '1.1rem' }}>{user?.name}</div>
                  <div className="text-muted">{user?.email}</div>
              </div>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label text-muted" style={{ fontSize: '0.85rem' }}>Full Name</label>
              {isEditingProfile ? (
                <input type="text" className="form-input" style={{ maxWidth: '400px' }} value={name} onChange={(e) => setName(e.target.value)} />
              ) : (
                <div style={{ padding: '0.75rem 1rem', backgroundColor: 'var(--bg-color)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', maxWidth: '400px' }}>{user?.name}</div>
              )}
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label text-muted" style={{ fontSize: '0.85rem' }}>Email Address</label>
              {isEditingProfile ? (
                <input type="email" className="form-input" style={{ maxWidth: '400px' }} value={email} onChange={(e) => setEmail(e.target.value)} />
              ) : (
                <div style={{ padding: '0.75rem 1rem', backgroundColor: 'var(--bg-color)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', maxWidth: '400px' }}>{user?.email}</div>
              )}
              {!isEditingProfile && <p className="text-muted text-xs" style={{ marginTop: '0.5rem' }}>Email address cannot be changed currently.</p>}
            </div>
          </div>

          {isEditingProfile && (
            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
              <button className="btn btn-primary flex items-center gap-2" onClick={handleSaveProfile} disabled={isSaving}>
                {isSaving ? 'Saving...' : <><Save size={16} /> Save Changes</>}
              </button>
              <button className="btn btn-secondary" onClick={() => { setIsEditingProfile(false); setName(user?.name); setEmail(user?.email); }} disabled={isSaving}>
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="card" style={{ padding: '2rem' }}>
        <div className="settings-section fade-in">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Mail size={20} className="text-muted" /> Email Configuration
              </h3>
            </div>
            {user?.has_smtp_configured && !isEditingSmtp && (
              <button className="btn btn-secondary flex items-center gap-2" onClick={() => setIsEditingSmtp(true)}>
                  <Edit2 size={16} /> Edit Settings
              </button>
            )}
          </div>

          {user?.has_smtp_configured && !isEditingSmtp && (
              <div className="alert alert-success" style={{ marginBottom: '1rem', padding: '1rem', backgroundColor: 'rgba(40, 167, 69, 0.1)', color: 'var(--success-color)', borderRadius: 'var(--radius-md)', border: '1px solid var(--success-color)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--success-color)' }}></div>
                  Custom SMTP is currently configured and active.
              </div>
          )}

          {(!user?.has_smtp_configured || isEditingSmtp) && (
            <>
              <div style={{ marginBottom: '2rem', padding: '1rem', backgroundColor: 'var(--bg-color)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                Configure your own SMTP server to send emails to students directly from your email address. 
                <br/><br/>
                <strong>Using Gmail?</strong> You must use a 16-digit <a href="https://support.google.com/accounts/answer/185833" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary-color)', textDecoration: 'underline' }}>App Password</a>, not your regular Google password.
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label text-muted" style={{ fontSize: '0.85rem' }}>SMTP Host</label>
                  <input type="text" className="form-input" value={smtpHost} onChange={(e) => setSmtpHost(e.target.value)} />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label text-muted" style={{ fontSize: '0.85rem' }}>SMTP Port</label>
                  <input type="number" className="form-input" value={smtpPort} onChange={(e) => setSmtpPort(e.target.value)} />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label text-muted" style={{ fontSize: '0.85rem' }}>SMTP Username (Email)</label>
                  <input type="email" className="form-input" value={smtpUsername} onChange={(e) => setSmtpUsername(e.target.value)} />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label text-muted" style={{ fontSize: '0.85rem' }}>SMTP App Password</label>
                  <input type="password" className="form-input" value={smtpPassword} onChange={(e) => setSmtpPassword(e.target.value)} placeholder="16-digit App Password" />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <button className="btn btn-primary flex items-center gap-2" onClick={handleSaveSMTP} disabled={isSavingSmtp}>
                  {isSavingSmtp ? 'Saving...' : <><Save size={16} /> Save Settings</>}
                </button>
                {user?.has_smtp_configured && (
                  <button className="btn btn-secondary" onClick={() => { setIsEditingSmtp(false); setSmtpPassword(''); }} disabled={isSavingSmtp}>
                    Cancel
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
