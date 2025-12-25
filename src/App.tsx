import React from 'react';
import { HashRouter as Router } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { ChatbotProvider } from './contexts/ChatbotContext';
import { AuthProvider } from './contexts/AuthContext';
import AppContent from './components/AppContent';

function App() {
  return (
    <HelmetProvider>
      <AuthProvider>
        <ChatbotProvider>
          <Router>
            <AppContent />
          </Router>
        </ChatbotProvider>
      </AuthProvider>
    </HelmetProvider>
  );
}

export default App;