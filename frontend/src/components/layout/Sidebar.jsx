import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, Settings, User, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-header">
        <div className="logo-icon">SM</div>
        <span className="logo-text">Student Management</span>
      </div>
      
      <nav className="sidebar-nav">
        <NavLink 
          to="/dashboard" 
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          onClick={onClose}
        >
          <LayoutDashboard size={20} />
          <span>Dashboard</span>
        </NavLink>
        <NavLink 
          to="/students" 
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          onClick={onClose}
        >
          <Users size={20} />
          <span>Students</span>
        </NavLink>
        <NavLink 
          to="/settings" 
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          onClick={onClose}
        >
          <Settings size={20} />
          <span>Settings</span>
        </NavLink>
      </nav>

      <div className="sidebar-footer">
        <NavLink 
          to="/profile" 
          onClick={onClose}
          style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}
        >
          <div className="user-profile flex justify-between items-center w-full" style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', transition: 'background-color 0.2s', '&:hover': { backgroundColor: 'var(--bg-color)' } }}>
            <div className="flex items-center gap-3">
              <div className="avatar">
                {user && user.name ? user.name.charAt(0).toUpperCase() : <User size={20} />}
              </div>
              <div className="user-info">
                <span className="user-name">{user?.name || 'User'}</span>
                <span className="user-role" style={{ textTransform: 'capitalize' }}>{user?.role || 'user'}</span>
              </div>
            </div>
            <button 
              onClick={(e) => { e.preventDefault(); logout(); }} 
              className="icon-btn" 
              title="Logout" 
              style={{ width: '32px', height: '32px', color: 'var(--danger-color)', borderColor: 'transparent' }}
            >
              <LogOut size={16} />
            </button>
          </div>
        </NavLink>
      </div>
    </aside>
  );
};

export default Sidebar;
