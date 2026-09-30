import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../hooks/useToast';

import { Eye, EyeOff } from 'lucide-react';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (name.length < 2) {
      return setError('Name must be at least 2 characters');
    }
    if (password.length < 8) {
      return setError('Password must be at least 8 characters');
    }
    if (password !== confirmPassword) {
      return setError('Passwords do not match');
    }

    setIsRegistering(true);
    try {
      await register(name, email, password);
      addToast('Account created successfully. Please login.', 'success');
      navigate('/login', { replace: true });
    } catch (err) {
      if (err.response && err.response.data && err.response.data.detail) {
        setError(err.response.data.detail);
      } else {
        setError('An error occurred during registration. Please try again.');
      }
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <div className="app-container items-center justify-center" style={{ backgroundColor: 'var(--bg-color)', padding: '2rem', overflowY: 'auto', height: '100vh', display: 'flex' }}>
      <div className="card" style={{ width: '100%', maxWidth: '450px', padding: '2.5rem', margin: 'auto' }}>
        <div className="text-center" style={{ marginBottom: '2rem' }}>
          <div className="logo-icon mx-auto" style={{ width: '48px', height: '48px', marginBottom: '1rem', fontSize: '20px', margin: '0 auto' }}>SM</div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '700' }}>Create Account</h2>
          <p className="text-muted text-sm mt-1">Sign up for the Student Management System.</p>
        </div>

        {error && (
          <div className="badge-danger" style={{ backgroundColor: 'var(--danger-bg)', color: 'var(--danger-color)', padding: '0.75rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', fontSize: '0.875rem', textAlign: 'center' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="form-container" style={{ gap: '1.25rem' }}>
          <div className="form-group" style={{ marginBottom: '0' }}>
            <label className="form-label" htmlFor="name">Name</label>
            <input
              id="name"
              type="text"
              className="form-input"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={isRegistering}
            />
          </div>

          <div className="form-group" style={{ marginBottom: '0' }}>
            <label className="form-label" htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              className="form-input"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isRegistering}
            />
          </div>

          <div className="form-grid" style={{ gap: '1rem' }}>
            <div className="form-group" style={{ marginBottom: '0', position: 'relative' }}>
              <label className="form-label" htmlFor="password">Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  className="form-input"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isRegistering}
                  style={{ paddingRight: '2.5rem' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  tabIndex="-1"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '0', position: 'relative' }}>
              <label className="form-label" htmlFor="confirmPassword">Confirm Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  className="form-input"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={isRegistering}
                  style={{ paddingRight: '2.5rem' }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  tabIndex="-1"
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary w-full"
            style={{ marginTop: '0.5rem', padding: '0.75rem' }}
            disabled={isRegistering}
          >
            {isRegistering ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <div className="text-center text-sm text-muted" style={{ marginTop: '1.5rem' }}>
          Already have an account? <Link to="/login" style={{ fontWeight: '600' }}>Login</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
