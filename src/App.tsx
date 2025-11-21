import React from 'react';
import { HashRouter as Router } from 'react-router-dom';
import { ChatbotProvider } from './contexts/ChatbotContext';
import { AuthProvider } from './contexts/AuthContext';
import AppContent from './components/AppContent'; // Import AppContent

function App() {
  return (
    <AuthProvider>
      <ChatbotProvider>
        <Router>
          <AppContent />
        </Router>
      </ChatbotProvider>
    </AuthProvider>
  );
}

export default App;