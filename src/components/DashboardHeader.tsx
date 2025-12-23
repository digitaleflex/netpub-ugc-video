import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Bell, LogOut, Search, User } from 'lucide-react';

const DashboardHeader: React.FC = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="dashboard-header">
      <div className="search-bar" style={{ position: 'relative' }}>
        <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#999' }} />
        <input type="text" placeholder="Rechercher..." style={{ paddingLeft: '36px' }} />
      </div>

      <div className="header-actions">
        <button className="icon-button" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#666', position: 'relative' }}>
          <Bell size={20} />
          <span style={{ position: 'absolute', top: '-2px', right: '-2px', width: '8px', height: '8px', background: '#ef4444', borderRadius: '50%', border: '2px solid white' }}></span>
        </button>

        <div className="user-profile">
          <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyCenter: 'center', overflow: 'hidden' }}>
            <User size={20} color="#999" />
          </div>
          <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Admin</span>
        </div>

        <button onClick={handleLogout} className="logout-button" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <LogOut size={16} />
          <span>Quitter</span>
        </button>
      </div>
    </header>
  );
};

export default DashboardHeader;
