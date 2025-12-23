import React, { useEffect } from 'react';
import { Routes, Route, useLocation, Outlet } from 'react-router-dom';
import Header from './Header';
import PillNavBar from './PillNavBar';
import Footer from './Footer';
import Home from '../pages/Home';
import Services from '../pages/Services';
import Portfolio from '../pages/Portfolio';
import About from '../pages/About';
import Contact from '../pages/Contact';
import LegalMentions from '../pages/LegalMentions';
import PrivacyPolicy from '../pages/PrivacyPolicy';
import TermsOfService from '../pages/TermsOfService';
import DashboardLayout from './DashboardLayout';
import Login from '../pages/Login';
import Overview from '../pages/dashboard/Overview';
import Conversations from '../pages/dashboard/Conversations';
import Appointments from '../pages/dashboard/Appointments';
import Orders from '../pages/dashboard/Orders';
import Analytics from '../pages/dashboard/Analytics';
import Learning from '../pages/dashboard/Learning';
import Chatbot from './Chatbot';
import ProtectedRoute from './ProtectedRoute';
import useScreenWidth from '../hooks/useScreenWidth';

// This component scrolls the window to the top on every route change.
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const AppContent: React.FC = () => {
  const screenWidth = useScreenWidth();
  const isMobile = screenWidth < 768;
  const location = useLocation();
  const isDashboardRoute = location.pathname.startsWith('/dashboard');
  const isLoginPage = location.pathname === '/login';

  return (
    <>
      <ScrollToTop />
      {!isDashboardRoute && !isLoginPage && (isMobile ? <PillNavBar /> : <Header />)}
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/services" element={<Services />} />
          <Route path="/portfolio" element={<Portfolio />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/legal-mentions" element={<LegalMentions />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-of-service" element={<TermsOfService />} />
          <Route path="/login" element={<Login />} />
          <Route path="/admin-login" element={<Login />} />
          <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
            <Route index element={<Overview />} />
            <Route path="conversations" element={<Conversations />} />
            <Route path="appointments" element={<Appointments />} />
            <Route path="orders" element={<Orders />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="learning" element={<Learning />} />
          </Route>
        </Routes>
      </main>
      {!isDashboardRoute && !isLoginPage && <Footer />}
      {!isLoginPage && <Chatbot />}
    </>
  );
};

export default AppContent;
