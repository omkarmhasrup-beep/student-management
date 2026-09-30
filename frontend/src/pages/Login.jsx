import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

import { Eye, EyeOff } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoggingIn(true);
    try {
      await login(email, password);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      if (err.message === 'Network Error' || err.code === 'ERR_NETWORK') {
        setError('Unable to connect to server. Please try again.');
      } else if (err.response && err.response.data && err.response.data.detail) {
        setError(err.response.data.detail);
      } else {
        setError('Invalid email or password');
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="app-container items-center justify-center" style={{ backgroundColor: 'var(--bg-color)', padding: '2rem', overflowY: 'auto', height: '100vh', display: 'flex' }}>
      <div className="card animate-fade-in" style={{ width: '100%', maxWidth: '400px', padding: '2.5rem', margin: 'auto' }}>
        <div className="text-center" style={{ marginBottom: '2rem' }}>
          <div className="logo-icon mx-auto" style={{ width: '48px', height: '48px', marginBottom: '1rem', fontSize: '20px', margin: '0 auto' }}>SM</div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '700' }}>Welcome back</h2>
          <p className="text-muted text-sm mt-1">Please enter your details to sign in.</p>
        </div>

        {error && (
          <div className="badge-danger" style={{ backgroundColor: 'var(--danger-bg)', color: 'var(--danger-color)', padding: '0.75rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', fontSize: '0.875rem', textAlign: 'center' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="form-container" style={{ gap: '1.25rem' }}>
          <div className="form-group" style={{ marginBottom: '0' }}>
            <label className="form-label" htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              className="form-input"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value.toLowerCase())}
              required
              disabled={isLoggingIn}
            />
          </div>

          <div className="form-group" style={{ marginBottom: '0', position: 'relative' }}>
            <div className="flex justify-between items-center mb-1">
              <label className="form-label" htmlFor="password" style={{ marginBottom: '0' }}>Password</label>
            </div>
            <div style={{ position: 'relative' }}>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoggingIn}
                style={{ paddingRight: '2.5rem' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '0.75rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                tabIndex="-1"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary w-full" 
            style={{ marginTop: '0.5rem', padding: '0.75rem' }}
            disabled={isLoggingIn}
          >
            {isLoggingIn ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="text-center text-sm text-muted" style={{ marginTop: '1.5rem' }}>
          Don't have an account? <Link to="/register" style={{ fontWeight: '600' }}>Sign up</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
