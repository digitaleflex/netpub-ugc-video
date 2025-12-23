import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Menu as MenuIcon, X } from 'lucide-react';
import DashboardSidebar from './DashboardSidebar';
import { DashboardProvider } from '../contexts/DashboardContext';

const DashboardLayout: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  return (
    <DashboardProvider>
      <div className={`dashboard-layout ${isMobileMenuOpen ? 'mobile-menu-open' : ''}`}>
        <div className="mobile-header">
          <Link to="/" className="branding-link">
            <span className="branding-dot"></span>
            <span className="branding-text">NETPUB</span>
          </Link>
          <button className="menu-toggle" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <X size={24} /> : <MenuIcon size={24} />}
          </button>
        </div>

        <div className="sidebar-overlay" onClick={() => setIsMobileMenuOpen(false)}></div>

        <DashboardSidebar onClose={() => setIsMobileMenuOpen(false)} />

        <div className="dashboard-main-content">
          <main className="dashboard-content-area">
            <Outlet />
          </main>
        </div>
      </div>
    </DashboardProvider>
  );
};

export default DashboardLayout;
