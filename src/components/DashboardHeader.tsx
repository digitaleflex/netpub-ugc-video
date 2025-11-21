import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const DashboardHeader: React.FC = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="dashboard-header">
      <div className="search-bar">
        <input type="text" placeholder="Rechercher sur le tableau de bord..." />
      </div>
      <div className="header-actions">
        <span className="notification-icon">🔔</span>
        <div className="user-profile">
          <img src="https://i.pravatar.cc/300" alt="User Avatar" className="user-avatar" />
          <span>Admin</span>
        </div>
        <button onClick={handleLogout} className="logout-button">Logout</button>
      </div>
    </header>
  );
};

export default DashboardHeader;
