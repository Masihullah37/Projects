



// config/api.js
const getApiBaseUrl = () => {
  if (import.meta.env.PROD) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  return import.meta.env.VITE_API_BASE_URL || 'http://localhost/IT_Repairs/Backend';
};

let csrfToken = '';

export const fetchApi = async (action, options = {}) => {
  const url = `${getApiBaseUrl()}/routes.php?action=${action}`;
  
  try {
    // Preserve explicitly set credentials and headers from components
    const baseOptions = {
      method: 'GET', // Default method
      credentials: 'include', // Will be overridden if component specifies
      headers: {
        'Content-Type': 'application/json', // Default header
      },
      ...options // Component-specific options will override these
    };

    // For state-changing methods, handle CSRF token
    if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(baseOptions.method.toUpperCase())) {
      // Get CSRF token from cookie or fetch new one
      if (!csrfToken) {
        csrfToken = document.cookie.split('; ')
          .find(row => row.trim().startsWith('csrf_token='))
          ?.split('=')[1] || '';
        
        if (!csrfToken) {
          const csrfResponse = await fetch(`${getApiBaseUrl()}/routes.php?action=get_csrf`, {
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' }
          });
          const csrfData = await csrfResponse.json();
          csrfToken = csrfData.csrf_token;
        }
      }

      // Add CSRF token to headers
      baseOptions.headers['X-CSRF-Token'] = csrfToken;
      
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
        baseOptions.body = JSON.stringify({ csrf_token: csrfToken });
      }
    }

    const response = await fetch(url, baseOptions);

    // Handle expired CSRF token (single retry)
    if (response.status === 403) {
      csrfToken = '';
      return fetchApi(action, options);
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! Status: ${response.status}`);
    }

    return response;
  } catch (error) {
    console.error(`API Error (${action}):`, error.message);
    throw error;
  }
};