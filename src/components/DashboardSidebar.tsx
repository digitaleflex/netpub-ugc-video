import React from 'react';
import { Link } from 'react-router-dom';

const DashboardSidebar: React.FC = () => {
  return (
    <aside className="dashboard-sidebar">
      <div className="sidebar-logo">
        {/* Replace with your actual logo or app name */}
        <span>🤖 Dashboard</span>
      </div>
      <nav className="sidebar-nav">
        <ul>
          <li>
            <Link to="/dashboard" className="nav-item">
              <span className="icon">🏠</span>
              <span className="text">Overview</span>
            </Link>
          </li>
          <li>
            <Link to="/dashboard/conversations" className="nav-item">
              <span className="icon">💬</span>
              <span className="text">Conversations</span>
            </Link>
          </li>
          <li>
            <Link to="/dashboard/appointments" className="nav-item">
              <span className="icon">📅</span>
              <span className="text">Appointments</span>
            </Link>
          </li>
          <li>
            <Link to="/dashboard/orders" className="nav-item">
              <span className="icon">🛒</span>
              <span className="text">Orders</span>
            </Link>
          </li>
          <li>
            <Link to="/dashboard/analytics" className="nav-item">
              <span className="icon">📊</span>
              <span className="text">Analytics</span>
            </Link>
          </li>
          {/* Optional: Learning section */}
          <li>
            <Link to="/dashboard/learning" className="nav-item">
              <span className="icon">🧠</span>
              <span className="text">Learning</span>
            </Link>
          </li>
        </ul>
      </nav>
    </aside>
  );
};

export default DashboardSidebar;
