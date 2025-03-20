// main.jsx - Point d'entrée principal de l'application
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'

// Import des styles globaux
import './styles/index.css'
import './styles/App.css'
// import './styles/Auth.module.css'
// import './styles/Navbar.css'
// import './styles/MobileNavigation.css'

// Import des polices et icônes
import '@fortawesome/fontawesome-free/css/all.min.css'
import 'bootstrap/dist/css/bootstrap.min.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)