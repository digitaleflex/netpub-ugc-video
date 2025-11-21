import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthUser } from '../types'; // Import AuthUser from the shared types file

interface AuthContextType {
  isAuthenticated: boolean;
  user: AuthUser | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

import { fetchCsrfToken } from '../utils/csrf';

const GRAPHQL_ENDPOINT = '/graphql'; // Assuming your GraphQL endpoint is /graphql

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        const csrf = await fetchCsrfToken();
        if (!token || !csrf) {
          setLoading(false);
          return;
        }

        const response = await fetch(GRAPHQL_ENDPOINT, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            'X-CSRF-Token': csrf,
          },
        });
        const result = await response.json();

        if (result.data && result.data.me) {
          setUser(result.data.me);
          setIsAuthenticated(true);
        } else {
          localStorage.removeItem('auth_token');
          setUser(null);
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Error verifying token:', error);
        localStorage.removeItem('auth_token');
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    verifyAuth();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const csrf = await fetchCsrfToken();
      if (!csrf) {
        throw new Error('CSRF token not available');
      }

      const response = await fetch(GRAPHQL_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrf,
        },
        body: JSON.stringify({
          query: `
            mutation Login($email: String!, $password: String!) {
              login(email: $email, password: $password) {
                token
                user {
                  id
                  email
                  name
                  role
                }
              }
            }
          `,
          variables: {
            email,
            password,
          },
        }),
      });

      const result = await response.json();

      if (result.data && result.data.login) {
        const { token, user } = result.data.login;
        localStorage.setItem('auth_token', token);
        setUser(user);
        setIsAuthenticated(true);
        return true;
      } else {
        const errorMessage = result.errors?.[0]?.message || 'Login failed';
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
