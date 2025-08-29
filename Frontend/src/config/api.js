
// frontend/src/config/api.js

let csrfToken = ''; // Keep this global for caching


let csrfTimestamp = 0; // Timestamp when the token was last fetched

// Helper function to get the base URL of your backend API
// This handles both local development and production environments
const getApiBaseUrl = () => {
  // 1. First check if we're in Vite development mode
  if (import.meta.env.DEV) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  
  // 2. Check if we're running production build locally
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'http://localhost/IT_Repairs/Backend';
  }
  
  // 3. Default production URL
  return 'https://test.icvinformatique.com/api';
};

const API_BASE_URL = getApiBaseUrl();

/**
 * Custom fetch API wrapper with CSRF token handling and global error handling.
 * @param {string} action - The action parameter for the backend route.
 * @param {object} options - Fetch options (method, headers, body, credentials).
 * @returns {Promise<object>} The parsed JSON response from the backend.
 * @throws {Error} If the network request fails or the backend returns an error.
 */
export const fetchApi = async (action, options = {}) => {
    const url = `${API_BASE_URL}/routes.php?action=${action}`;
    
    try {
        const baseOptions = {
            method: 'GET', // Default method
            credentials: 'include', // Crucial for sending session cookies
            headers: {
                'Content-Type': 'application/json', // Default header
            },
            ...options // Component-specific options will override these
        };

        // For state-changing methods, handle CSRF token
        if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(baseOptions.method.toUpperCase())) {
            // Check if token is missing, or if the cached token is expired (e.g., older than 1 hour)
            const ONE_HOUR_IN_SECONDS = 3600; 
            const isTokenExpired = csrfToken === '' || (Date.now() / 1000 - csrfTimestamp > ONE_HOUR_IN_SECONDS);

            // Attempt to get CSRF token from cookie first
            let currentCookieToken = document.cookie.split('; ')
                .find(row => row.trim().startsWith('csrf_token='))
                ?.split('=')[1];

            if (currentCookieToken && !isTokenExpired) {
                // If token is found in cookie and not expired, use it
                csrfToken = currentCookieToken;
            } else {
                // Fetch new CSRF token if not found in cookie or if expired
                // Removed: console.log('Fetching new CSRF token...');
                const csrfResponse = await fetch(`${API_BASE_URL}/routes.php?action=get_csrf`, {
                    method: 'GET', // Ensure GET for CSRF token retrieval
                    credentials: 'include',
                    headers: { 'Content-Type': 'application/json' }
                });
                
                if (!csrfResponse.ok) {
                    const errorText = await csrfResponse.text(); // Get raw text if JSON parsing fails
                    console.error(`Failed to fetch CSRF token: HTTP error! Status: ${csrfResponse.status}, Response: ${errorText}`);
                    throw new Error(`Failed to fetch CSRF token: HTTP error! Status: ${csrfResponse.status}.`);
                }
                const csrfData = await csrfResponse.json(); 
                // Access csrf_token from the 'data' property
                if (csrfData && csrfData.success && csrfData.data && csrfData.data.csrf_token) {
                    csrfToken = csrfData.data.csrf_token;
                    csrfTimestamp = csrfData.data.timestamp; // Store timestamp from backend
                    // Removed: console.log('New CSRF token fetched:', csrfToken);
                } else {
                    // Handle cases where response is OK but data structure is unexpected
                    console.error('CSRF token not found in expected response structure:', csrfData);
                    throw new Error('CSRF token not found in response from get_csrf endpoint.');
                }
            }

            // Add CSRF token to headers
            if (csrfToken) {
                baseOptions.headers['X-CSRF-Token'] = csrfToken;
                // Removed: console.log(`Sending request with X-CSRF-Token: ${csrfToken}`); // Debugging line
            }

            // Parse existing body if provided and add CSRF token
            if (baseOptions.body) {
                try {
                    const bodyObj = typeof baseOptions.body === 'string' 
                        ? JSON.parse(baseOptions.body)
                        : baseOptions.body;
                    bodyObj.csrf_token = csrfToken;
                    baseOptions.body = JSON.stringify(bodyObj);
                } catch (e) {
                    console.error('Error parsing request body:', e);
                    throw new Error('Invalid request body');
                }
            } else {
                // If no body is provided, ensure csrf_token is still in the body for POST requests
                baseOptions.body = JSON.stringify({ csrf_token: csrfToken });
            }
        }

        const response = await fetch(url, baseOptions);

        // Handle expired CSRF token (single retry) - 
        if (response.status === 403 && !options._retried) { // Add _retried flag to prevent infinite loops
            console.warn('CSRF token expired or invalid. Retrying request...');
            csrfToken = ''; // Clear the cached token
            csrfTimestamp = 0; // Reset timestamp
            return fetchApi(action, { ...options, _retried: true }); // Retry with a flag
        }

        // Global 401 Unauthorized handler
        if (response.status === 401) {
            console.error(`API Error (${action}): Unauthorized access (401). Redirecting to login.`);
            window.location.href = '/login'; 
            throw new Error("Unauthorized: Please log in.");
        }

        if (!response.ok) {

            // For login specifically, don't throw on 400 - let the component handle it
               if (action === 'login' && response.status === 400) {
                 const errorData = await response.json().catch(() => ({}));
                 return {
                 success: false,
                 status: response.status,
                 error: errorData.error || 'UNKNOWN_ERROR',
                 message: errorData.message || 'Login failed'
              };
               }
            // If HTTP status is NOT OK (e.g., 400, 401, 500), throw an error.
            const errorData = await response.json().catch(async () => {
                const text = await response.text();
                return { message: `Server responded with non-JSON: ${text}` };
            });
      console.error(`API Response Error (${action}): Status ${response.status}, Message: ${errorData.message || 'No specific message'}`);
    throw new Error(errorData.message || `HTTP error! Status: ${response.status}`);
}


        // If HTTP status IS OK (200), always return the full JSON response.
        // The calling component will now be responsible for checking the nested 'success' flag.
        const responseJson = await response.json();
        return responseJson; 

    } catch (error) {
        console.error(`API Error (${action}):`, error.message);
        throw error; // Re-throw to be caught by the calling component
    }
};