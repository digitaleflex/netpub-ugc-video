import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { fetchCsrfToken } from '../utils/csrf';

interface DashboardContextType {
    overviewStats: any;
    analyticsStats: any;
    loading: boolean;
    error: string | null;
    refreshStats: () => Promise<void>;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

const GRAPHQL_ENDPOINT = '/graphql';

const GET_ALL_STATS = `
  query GetAllStats {
    dashboardStats {
      totalConversations
      activeConversations
      totalAppointments
      totalOrders
      totalLikes
      totalComments
      conversationsTrend { value isUp }
      appointmentsTrend { value isUp }
      ordersTrend { value isUp }
      engagementTrend { value isUp }
      recentAppointments { id clientName service time date }
      recentOrders { id clientName type status }
    }
    analyticsStats {
      totalMessages
      totalAppointments
      totalOrders
      conversionRate
      systemLatency
      systemStatus
      efficiencyScore
      messagesTrend { value isUp }
      appointmentsTrend { value isUp }
      ordersTrend { value isUp }
      conversionTrend { value isUp }
      mostFrequentIntentions { name count icon }
    }
  }
`;

export const DashboardProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [overviewStats, setOverviewStats] = useState<any>(null);
    const [analyticsStats, setAnalyticsStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchStats = useCallback(async (isInitial = false) => {
        if (isInitial) setLoading(true);
        try {
            const csrf = await fetchCsrfToken();
            const response = await fetch(GRAPHQL_ENDPOINT, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrf || '' },
                body: JSON.stringify({ query: GET_ALL_STATS }),
            });
            const result = await response.json();
            if (result.data) {
                setOverviewStats(result.data.dashboardStats);
                setAnalyticsStats(result.data.analyticsStats);
            } else {
                setError(result.errors?.[0]?.message || 'Failed to fetch dashboard data');
            }
        } catch (err) {
            setError('Connection error precisely while fetching dashboard data');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchStats(true);
        // Refresh background every 5 minutes
        const interval = setInterval(() => fetchStats(), 300000);
        return () => clearInterval(interval);
    }, [fetchStats]);

    const refreshStats = () => fetchStats(true);

    return (
        <DashboardContext.Provider value={{ overviewStats, analyticsStats, loading, error, refreshStats }}>
            {children}
        </DashboardContext.Provider>
    );
};

export const useDashboard = () => {
    const context = useContext(DashboardContext);
    if (!context) throw new Error('useDashboard must be used within a DashboardProvider');
    return context;
};
