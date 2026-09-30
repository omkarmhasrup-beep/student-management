import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="flex-col items-center justify-center h-full gap-4 text-center">
      <h1 style={{ fontSize: '4rem', color: 'var(--primary-color)' }}>404</h1>
      <h2>Page Not Found</h2>
      <p className="text-muted max-w-md">The page you are looking for doesn't exist or has been moved.</p>
      <Link to="/dashboard" className="btn btn-primary" style={{ marginTop: '1rem' }}>
        Back to Dashboard
      </Link>
    </div>
  );
};

export default NotFound;
