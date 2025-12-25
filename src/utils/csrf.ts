let csrfToken: string | null = null;

export const fetchCsrfToken = async (maxRetries = 5, retryDelayMs = 1000): Promise<string> => {
  if (csrfToken) return csrfToken;

  for (let i = 0; i < maxRetries; i++) {
    try {
      const apiUrl = (import.meta as any).env.VITE_API_URL || '';
      const response = await fetch(`${apiUrl}/csrf-token`);
      if (!response.ok) {
        // Retry on 5xx errors which often happen during startup/proxying
        if (response.status >= 500 && i < maxRetries - 1) {
          console.warn(`Attempt ${i + 1} failed to fetch CSRF token (Status: ${response.status}). Retrying in ${retryDelayMs}ms...`);
          await new Promise(resolve => setTimeout(resolve, retryDelayMs));
          continue;
        }
        throw new Error(`Failed to fetch CSRF token: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      csrfToken = data.csrfToken;
      return csrfToken as string;
    } catch (error: any) {
      // Retry on network errors (like TypeError: Failed to fetch) during startup
      if (i < maxRetries - 1) {
        console.warn(`Attempt ${i + 1} failed to fetch CSRF token. Retrying in ${retryDelayMs}ms... Error: ${error.message}`);
        await new Promise(resolve => setTimeout(resolve, retryDelayMs));
        continue;
      }
      console.error('Final error fetching CSRF token:', error);
      throw error;
    }
  }
  throw new Error('Failed to fetch CSRF token after multiple retries.');
};