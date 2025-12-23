import React from 'react';
import { NavLink, useNavigate, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  MessageSquare,
  Calendar,
  ShoppingCart,
  BarChart3,
  Brain,
  LogOut,
  Search,
  User,
  Bell
} from 'lucide-react';

interface SidebarProps {
  onClose?: () => void;
}

const DashboardSidebar: React.FC<SidebarProps> = ({ onClose }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('auth_user');
    if (onClose) onClose();
    navigate('/login');
  };

  return (
    <aside className="dashboard-sidebar">
      <div className="sidebar-logo">
        <Link to="/" className="branding-link">
          <span className="branding-dot"></span>
          <span className="branding-text">NETPUB</span>
        </Link>
      </div>

      <div className="sidebar-search">
        <div className="search-wrapper">
          <Search size={16} className="search-icon" />
          <input type="text" placeholder="Rechercher..." />
        </div>
      </div>

      <nav className="sidebar-nav">
        <ul>
          <li>
            <NavLink to="/dashboard" end className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'} onClick={onClose}>
              <LayoutDashboard size={20} className="icon" />
              <span className="text">Vue d'ensemble</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/dashboard/conversations" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'} onClick={onClose}>
              <MessageSquare size={20} className="icon" />
              <span className="text">Messages</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/dashboard/appointments" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'} onClick={onClose}>
              <Calendar size={20} className="icon" />
              <span className="text">Rendez-vous</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/dashboard/orders" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'} onClick={onClose}>
              <ShoppingCart size={20} className="icon" />
              <span className="text">Commandes</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/dashboard/analytics" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'} onClick={onClose}>
              <BarChart3 size={20} className="icon" />
              <span className="text">Analyses</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/dashboard/learning" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'} onClick={onClose}>
              <Brain size={20} className="icon" />
              <span className="text">Optimisation</span>
            </NavLink>
          </li>
        </ul>
      </nav>

      <div className="sidebar-footer">
        <div className="user-info">
          <div className="avatar">
            <User size={18} />
          </div>
          <div className="details">
            <p className="name">Administrateur</p>
            <p className="role">Netpub Suite</p>
          </div>
          <button className="notif-btn">
            <Bell size={18} />
          </button>
        </div>

        <button onClick={handleLogout} className="logout-btn">
          <LogOut size={18} />
          <span>Déconnexion</span>
        </button>
      </div>
    </aside>
  );
};

export default DashboardSidebar;
