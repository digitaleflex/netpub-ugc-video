import React, { useEffect, Suspense, lazy } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Header from './Header';
import PillNavBar from './PillNavBar';
import Footer from './Footer';
import DashboardLayout from './DashboardLayout';
import Chatbot from './Chatbot';
import ProtectedRoute from './ProtectedRoute';
import useScreenWidth from '../hooks/useScreenWidth';

const Home = lazy(() => import('../pages/Home'));
const Services = lazy(() => import('../pages/Services'));
const Portfolio = lazy(() => import('../pages/Portfolio'));
const About = lazy(() => import('../pages/About'));
const Contact = lazy(() => import('../pages/Contact'));
const LegalMentions = lazy(() => import('../pages/LegalMentions'));
const PrivacyPolicy = lazy(() => import('../pages/PrivacyPolicy'));
const TermsOfService = lazy(() => import('../pages/TermsOfService'));
const Login = lazy(() => import('../pages/Login'));
const Overview = lazy(() => import('../pages/dashboard/Overview'));
const Conversations = lazy(() => import('../pages/dashboard/Conversations'));
const Appointments = lazy(() => import('../pages/dashboard/Appointments'));
const Orders = lazy(() => import('../pages/dashboard/Orders'));
const Analytics = lazy(() => import('../pages/dashboard/Analytics'));
const Learning = lazy(() => import('../pages/dashboard/Learning'));

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
        <Suspense fallback={<div>Loading...</div>}>
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
        </Suspense>
      </main>
      {!isDashboardRoute && !isLoginPage && <Footer />}
      {!isLoginPage && <Chatbot />}
    </>
  );
};

export default AppContent;
