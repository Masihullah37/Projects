



import { useState, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { Lock } from "react-feather"
import Footer from "./Footer"
import styles from "../styles/Auth.module.css"
import { fetchApi } from "../config/api"

function ResetPassword() {
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  })
  const [errors, setErrors] = useState({})
  const [success, setSuccess] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [tokenValid, setTokenValid] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [debugInfo, setDebugInfo] = useState(null) // État pour le débogage

  const navigate = useNavigate()
  const location = useLocation()

  // Extraire le token et l'email des paramètres d'URL
  const queryParams = new URLSearchParams(location.search)
  const token = queryParams.get("token")
  const email = queryParams.get("email")

  // Valider le token au chargement du composant
  useEffect(() => {
    // Enregistrer les paramètres pour le débogage
    console.log("Paramètres URL:", { token, email })

    if (!token || !email) {
      setErrors({ general: "Lien de réinitialisation invalide. Veuillez demander un nouveau lien." })
      setIsLoading(false)
      return
    }

    // Vérifier la validité du token avec le backend
    const verifyToken = async () => {
      try {
        console.log("Envoi de la requête de vérification avec:", { token, email })

        // Utiliser la bonne route et la bonne méthode (GET au lieu de POST)
        // const url = `http://localhost/IT_Repairs/Backend/routes.php?action=validate_reset_token&token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}`
        // console.log("URL de la requête:", url)

        const action = `validate_reset_token&token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}`;
        console.log("Action sent to fetchApi:", action);

        const response = await fetchApi(action, {
          method: "GET", // Utiliser GET comme attendu par le backend
          headers: { "Content-Type": "application/json" },
        })

        console.log("Statut de la réponse:", response.status)

        // Récupérer le texte brut de la réponse pour le débogage
        const responseText = await response.text()
        console.log("Réponse brute:", responseText)

        // Essayer de parser la réponse en JSON
        let data
        try {
          data = JSON.parse(responseText)
          console.log("Données JSON:", data)
        } catch (e) {
          console.error("Erreur de parsing JSON:", e)
          setErrors({ general: "Format de réponse invalide. Contactez l'administrateur." })
          setIsLoading(false)
          return
        }

        if (data.valid) {
          console.log("Token validé avec succès")
          setTokenValid(true)
        } else {
          console.log("Token invalide:", data.message || "Aucun message d'erreur")
          setErrors({ general: "Ce lien a expiré ou est invalide. Veuillez demander un nouveau lien." })
        }
      } catch (error) {
        console.error("Erreur lors de la vérification du token:", error)
        setErrors({ general: "Erreur de connexion au serveur. Veuillez réessayer." })
      } finally {
        setIsLoading(false)
      }
    }

    verifyToken()
  }, [token, email])

  // Fonction pour valider le mot de passe
  const validatePassword = (password) => {
    // Regex: 8 caractères, majuscule, minuscule, chiffre et caractère spécial
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
    return passwordRegex.test(password)
  }

  // Validation du formulaire
  const validateForm = () => {
    const newErrors = {}

    // Vérifier si le mot de passe est vide
    if (!formData.password.trim()) {
      newErrors.password = "Le nouveau mot de passe est obligatoire"
    } else if (!validatePassword(formData.password)) {
      newErrors.password = "Le mot de passe doit respecter les critères ci-dessous"
    }

    // Vérifier si la confirmation du mot de passe est vide
    if (!formData.confirmPassword.trim()) {
      newErrors.confirmPassword = "La confirmation du mot de passe est obligatoire"
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Les mots de passe ne correspondent pas"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Gestion de la soumission du formulaire
  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    setErrors({})
    setSuccess("")

    try {
      console.log("Envoi de la requête de réinitialisation avec:", { token, email })

      const response = await fetchApi('reset_password', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          email,
          password: formData.password,
        }),
      })

      console.log("Statut de la réponse:", response.status)

      // Récupérer le texte brut de la réponse pour le débogage
      const responseText = await response.text()
      console.log("Réponse brute:", responseText)

      // Essayer de parser la réponse en JSON
      let data
      try {
        data = JSON.parse(responseText)
        console.log("Données JSON:", data)
      } catch (e) {
        console.error("Erreur de parsing JSON:", e)
        setErrors({ general: "Format de réponse invalide. Contactez l'administrateur." })
        setIsSubmitting(false)
        return
      }

      if (data.success) {
        setSuccess("Votre mot de passe a été réinitialisé avec succès. Redirection vers la page de connexion...")
        setTimeout(() => navigate("/login"), 3000)
      } else {
        setErrors({ general: data.message || "Une erreur est survenue. Veuillez réessayer." })
      }
    } catch (error) {
      console.error("Erreur lors de la réinitialisation du mot de passe:", error)
      setErrors({ general: "Erreur de connexion au serveur. Veuillez réessayer." })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Gestion des changements dans les champs de saisie
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })

    // Effacer l'erreur spécifique lorsque l'utilisateur commence à taper
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" })
    }
  }

  return (
    <div className={styles.pageContainer}>
      <div className={styles.contentWrap}>
        <div className={styles.authWrapper}>
          <div className={styles.authContainer}>
            <h2 className={styles.authTitle}>Réinitialisation du mot de passe</h2>
            <p className={styles.authSubtitle}>Créez un nouveau mot de passe pour votre compte</p>

            {/* Affichage des messages d'erreur ou de succès */}
            {errors.general && <div className={styles.errorMessage}>{errors.general}</div>}
            {success && <div className={styles.successMessage}>{success}</div>}

            {/* Affichage des informations de débogage en mode développement */}
            {process.env.NODE_ENV === "development" && debugInfo && (
              <div className={styles.debugInfo}>
                <details>
                  <summary>Informations de débogage</summary>
                  <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
                </details>
              </div>
            )}

            {isLoading ? (
              <div className={styles.loadingMessage}>Vérification du lien...</div>
            ) : tokenValid ? (
              <form onSubmit={handleSubmit}>
                {/* Champ de mot de passe */}
                <div className={`${styles.formGroup} ${styles.passwordFormGroup}`}>
                  <Lock className={styles.inputIcon} size={20} />
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Nouveau mot de passe"
                    className={errors.password ? styles.error : ""}
                  />
                  {errors.password && (
                    <div className={`${styles.fieldError} ${styles.passwordError}`}>{errors.password}</div>
                  )}
                </div>

                {/* Exigences du mot de passe */}
                <div className={styles.passwordRequirements}>
                  Le mot de passe doit contenir :
                  <ul>
                    <li>Au moins 8 caractères</li>
                    <li>Au moins une lettre majuscule</li>
                    <li>Au moins une lettre minuscule</li>
                    <li>Au moins un chiffre</li>
                    <li>Au moins un caractère spécial</li>
                  </ul>
                </div>

                {/* Champ de confirmation du mot de passe */}
                <div className={`${styles.formGroup} ${styles.passwordFormGroup}`}>
                  <Lock className={styles.inputIcon} size={20} />
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Confirmer le mot de passe"
                    className={errors.confirmPassword ? styles.error : ""}
                  />
                  {errors.confirmPassword && (
                    <div className={`${styles.fieldError} ${styles.passwordError}`}>{errors.confirmPassword}</div>
                  )}
                </div>

                {/* Bouton de soumission */}
                <button type="submit" className={styles.authButton} disabled={isSubmitting}>
                  {isSubmitting ? "Traitement en cours..." : "Réinitialiser le mot de passe"}
                </button>
              </form>
            ) : (
              <div className={styles.authLinks}>
                <span>
                  Retourner à la{" "}
                  <a
                    href="/login"
                    onClick={(e) => {
                      e.preventDefault()
                      navigate("/login")
                    }}
                  >
                    page de connexion
                  </a>
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default ResetPassword
