// frontend/src/config/api.js

// =======================
// Gestion du CSRF côté Frontend
// =======================

// On garde ici le token CSRF en mémoire pour le réutiliser dans les requêtes sensibles
let csrfToken = '';

// On note l'heure à laquelle on a récupéré le token pour savoir s'il est encore valide
let csrfTimestamp = 0;

// =======================
// Détection de l’URL de base de l’API
// =======================
// Cette fonction choisit automatiquement l’URL du backend selon l’environnement (local ou production)
const getApiBaseUrl = () => {
  // 1. En mode développement (Vite)
  if (import.meta.env.DEV) {
    return import.meta.env.VITE_API_BASE_URL;
  }

  // 2. Si on exécute une version de prod en local
  if (
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1'
  ) {
    return 'http://localhost/IT_Repairs/Backend';
  }

  // 3. Sinon → URL du serveur de production
  return 'https://test.icvinformatique.com/api';
};

const API_BASE_URL = getApiBaseUrl();

// =======================
// Wrapper personnalisé pour fetch()
// =======================
// Ajoute automatiquement :
//  - l’envoi des cookies de session (credentials: include)
//  - la gestion des tokens CSRF
//  - un traitement global des erreurs
export const fetchApi = async (action, options = {}) => {
  const url = `${API_BASE_URL}/routes.php?action=${action}`;

  try {
    // Options par défaut
    const baseOptions = {
      method: 'GET',
      credentials: 'include', // ⚠️ essentiel pour que le cookie PHPSESSID parte avec la requête
      headers: {
        'Content-Type': 'application/json',
      },
      ...options, // On peut écraser les valeurs par défaut si besoin
    };

    // =======================
    // Cas des méthodes sensibles (POST, PUT, DELETE, PATCH)
    // =======================
    if (
      ['POST', 'PUT', 'DELETE', 'PATCH'].includes(
        baseOptions.method.toUpperCase()
      )
    ) {
      // Vérification expiration du token (1 heure max)
      const ONE_HOUR_IN_SECONDS = 3600;
      const isTokenExpired =
        csrfToken === '' ||
        Date.now() / 1000 - csrfTimestamp > ONE_HOUR_IN_SECONDS;

      // Tentative de récupérer le token directement depuis le cookie
      let currentCookieToken = document.cookie
        .split('; ')
        .find((row) => row.trim().startsWith('csrf_token='))
        ?.split('=')[1];

      if (currentCookieToken && !isTokenExpired) {
        // Si trouvé dans le cookie et pas expiré → on réutilise
        csrfToken = currentCookieToken;
      } else {
        // Sinon → on va chercher un nouveau token au backend
        const csrfResponse = await fetch(
          `${API_BASE_URL}/routes.php?action=get_csrf`,
          {
            method: 'GET',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
          }
        );

        if (!csrfResponse.ok) {
          const errorText = await csrfResponse.text();
          console.error(
            `Erreur lors de la récupération du token CSRF : ${csrfResponse.status}, ${errorText}`
          );
          throw new Error(
            `Impossible de récupérer le token CSRF (status ${csrfResponse.status}).`
          );
        }

        const csrfData = await csrfResponse.json();

        // Vérification structure réponse backend
        if (
          csrfData &&
          csrfData.success &&
          csrfData.data &&
          csrfData.data.csrf_token
        ) {
          csrfToken = csrfData.data.csrf_token;
          csrfTimestamp = csrfData.data.timestamp;
        } else {
          console.error(
            'Réponse CSRF invalide, structure inattendue :',
            csrfData
          );
          throw new Error('Token CSRF manquant dans la réponse du backend.');
        }
      }

      // Ajout du token CSRF dans les en-têtes de la requête
      if (csrfToken) {
        baseOptions.headers['X-CSRF-Token'] = csrfToken;
      }
    }

    // =======================
    // Envoi de la requête au backend
    // =======================
    const response = await fetch(url, baseOptions);

    // Gestion des CSRF expirés → on retente une fois
    if (response.status === 403 && !options._retried) {
      console.warn('Token CSRF invalide ou expiré → nouvelle tentative...');
      csrfToken = '';
      csrfTimestamp = 0;
      return fetchApi(action, { ...options, _retried: true });
    }

    // Gestion des erreurs globales 401 (non connecté)
    if (response.status === 401) {
      console.error(
        `Erreur API (${action}) : accès non autorisé (401). Redirection vers login...`
      );
      window.location.href = '/login';
      throw new Error('Non autorisé : veuillez vous connecter.');
    }

    // Si autre erreur HTTP
    if (!response.ok) {
      // Cas particulier du login (400)
      if (action === 'login' && response.status === 400) {
        const errorData = await response.json().catch(() => ({}));
        return {
          success: false,
          status: response.status,
          error: errorData.error || 'UNKNOWN_ERROR',
          message: errorData.message || 'Échec de connexion',
        };
      }

      // Sinon on renvoie l’erreur
      const errorData = await response.json().catch(async () => {
        const text = await response.text();
        return { message: `Réponse non-JSON du serveur : ${text}` };
      });
      console.error(
        `Erreur API (${action}) : Status ${response.status}, Message: ${
          errorData.message || 'Pas de message spécifique'
        }`
      );
      throw new Error(
        errorData.message || `Erreur HTTP (status ${response.status})`
      );
    }

    // =======================
    // Succès : retour JSON complet
    // =======================
    const responseJson = await response.json();
    return responseJson;
  } catch (error) {
    console.error(`Erreur API (${action}) :`, error.message);
    throw error; // Propagation au composant qui a appelé
  }
};

export default fetchApi;