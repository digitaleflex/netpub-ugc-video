import React from 'react';
import { Outlet } from 'react-router-dom'; // Import Outlet
import DashboardSidebar from './DashboardSidebar';
import DashboardHeader from './DashboardHeader';

const DashboardLayout: React.FC = () => {
  return (
    <div className="dashboard-layout">
      <DashboardSidebar />
      <div className="dashboard-main-content">
        <DashboardHeader />
        <main className="dashboard-content-area">
          <Outlet /> {/* Render nested routes here */}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
