let csrfToken: string | null = null;

export const fetchCsrfToken = async (maxRetries = 5, retryDelayMs = 1000): Promise<string> => {
  if (csrfToken) return csrfToken;

  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch('/csrf-token');
      if (!response.ok) {
        // If it's a 500 error, and we still have retries, wait and try again
        if (response.status === 500 && i < maxRetries - 1) {
          console.warn(`Attempt ${i + 1} failed to fetch CSRF token (Status: 500). Retrying in ${retryDelayMs}ms...`);
          await new Promise(resolve => setTimeout(resolve, retryDelayMs));
          continue;
        }
        throw new Error(`Failed to fetch CSRF token: ${response.statusText}`);
      }
      const data = await response.json();
      csrfToken = data.csrfToken;
      return csrfToken;
    } catch (error: any) {
      // If connection refused, and we still have retries, wait and try again
      if (error.message.includes('ECONNREFUSED') && i < maxRetries - 1) {
        console.warn(`Attempt ${i + 1} failed to fetch CSRF token (Connection Refused). Retrying in ${retryDelayMs}ms...`);
        await new Promise(resolve => setTimeout(resolve, retryDelayMs));
        continue;
      }
      console.error('Error fetching CSRF token:', error);
      throw error;
    }
  }
  throw new Error('Failed to fetch CSRF token after multiple retries.');
};