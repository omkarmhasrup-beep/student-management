import { Menu, Search, Bell, ChevronRight, BellRing } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { useTheme } from '../../hooks/useTheme';
import { Moon, Sun } from 'lucide-react';
import { getStudents } from '../../services/api';

const Header = ({ onMenuClick }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchRef = useRef(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const notifRef = useRef(null);
  const [notifications, setNotifications] = useState([]);
  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };
  // Removed client-side fetchAll in favor of server-side search

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchChange = async (e) => {
    const val = e.target.value;
    setSearchQuery(val);
    
    if (val.trim()) {
      try {
        const data = await getStudents(1, 5, val.trim());
        setSearchResults(data.items || []);
        setShowDropdown(true);
      } catch (err) {
        console.error('Search failed', err);
      }
    } else {
      setShowDropdown(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowDropdown(false);
      navigate(`/students?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleResultClick = (id) => {
    setShowDropdown(false);
    setSearchQuery('');
    navigate(`/students/${id}`);
  };
  
  // Format path to title
  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/dashboard') return 'Dashboard';
    if (path === '/students') return 'Students';
    if (path === '/students/new') return 'Add Student';
    if (path.includes('/edit')) return 'Edit Student';
    if (path.startsWith('/students/')) return 'Student Details';
    if (path === '/settings') return 'Settings';
    return 'Student Management';
  };

  return (
    <header className="top-header">
      <div className="header-left">
        <button className="menu-btn" onClick={onMenuClick} aria-label="Open Menu">
          <Menu size={24} />
        </button>
        <div className="page-title">
          <h1>{getPageTitle()}</h1>
        </div>
      </div>
      
      <div className="header-right">
        <div ref={searchRef} className="search-container" style={{ position: 'relative' }}>
          <form onSubmit={handleSearchSubmit} className="search-bar">
            <Search size={18} className="search-icon" />
            <input 
              type="text" 
              placeholder="Search students..." 
              value={searchQuery}
              onChange={handleSearchChange}
              onFocus={() => searchQuery.trim() && setShowDropdown(true)}
            />
          </form>
          
          {showDropdown && (
            <div className="search-dropdown card">
              {searchResults.length > 0 ? (
                <ul className="search-results-list">
                  {searchResults.map(student => (
                    <li key={student.id} className="search-result-item" onClick={() => handleResultClick(student.id)}>
                      <div className="avatar" style={{ width: '28px', height: '28px', backgroundColor: 'var(--primary-light)', color: 'var(--primary-color)', fontSize: '0.75rem' }}>
                        {student.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="result-info">
                        <div className="result-name">{student.name}</div>
                        <div className="result-email text-muted">{student.email}</div>
                      </div>
                      <div className="result-arrow">
                        <ChevronRight size={16} />
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="search-no-results text-muted">
                  No students found
                </div>
              )}
            </div>
          )}
        </div>
        
        <div ref={notifRef} style={{ position: 'relative' }}>
          <button 
            className="icon-btn" 
            aria-label="Notifications" 
            onClick={() => setShowNotifications(!showNotifications)}
            style={showNotifications ? { backgroundColor: 'var(--primary-light)', color: 'var(--primary-color)', borderColor: 'var(--primary-light)' } : {}}
          >
            <Bell size={20} />
            {unreadCount > 0 && <span style={{ position: 'absolute', top: '8px', right: '10px', width: '8px', height: '8px', backgroundColor: '#ef4444', borderRadius: '50%' }}></span>}
          </button>
          
          {showNotifications && (
            <div className="search-dropdown card" style={{ right: 0, left: 'auto', width: '320px', padding: '0' }}>
              <div style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <BellRing size={16} className="text-primary" /> Notifications
                </h3>
                {unreadCount > 0 && <span className="badge badge-success">{unreadCount} New</span>}
              </div>
              <ul style={{ listStyle: 'none', margin: 0, padding: 0, maxHeight: '300px', overflowY: 'auto' }}>
                {notifications.length === 0 ? (
                  <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    No notifications
                  </div>
                ) : (
                  notifications.map(notif => (
                    <li key={notif.id} style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)', display: 'flex', gap: '1rem', cursor: 'pointer', backgroundColor: notif.read ? 'transparent' : 'var(--bg-color)' }} className="search-result-item">
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: notif.read ? 'transparent' : 'var(--primary-color)', marginTop: '0.4rem', flexShrink: 0 }}></div>
                      <div>
                        <div style={{ fontSize: '0.9rem', fontWeight: notif.read ? 400 : 500, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>{notif.title}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{notif.text}</div>
                        <div style={{ fontSize: '0.75rem', color: notif.read ? 'var(--text-muted)' : 'var(--primary-color)', marginTop: '0.25rem', fontWeight: 500 }}>{notif.time}</div>
                      </div>
                    </li>
                  ))
                )}
              </ul>
              {notifications.length > 0 && (
                <div style={{ padding: '0.75rem', display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-color)', fontSize: '0.85rem', fontWeight: 500 }}>
                  <span onClick={markAllAsRead} style={{ color: 'var(--primary-color)', cursor: 'pointer' }}>Mark all as read</span>
                  <span onClick={clearAllNotifications} style={{ color: 'var(--text-secondary)', cursor: 'pointer' }}>Clear all</span>
                </div>
              )}
            </div>
          )}
        </div>
        
        <button className="icon-btn" onClick={toggleTheme} aria-label="Toggle Theme">
          {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
        </button>
      </div>
    </header>
  );
};

export default Header;
