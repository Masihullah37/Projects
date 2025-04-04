




import { useState, useEffect, useRef } from "react"
import styles from "../styles/Home.module.css"

function RepairRequestForm() {
  const [formData, setFormData] = useState({
    nom: "",
    email: "",
    telephone: "",
    marque: "",
    modele: "",
    probleme: "",
    services: [],
    devis_demande: false,
  })
  const [formStatus, setFormStatus] = useState({ success: false, error: null })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [validationErrors, setValidationErrors] = useState({})
  const [formTouched, setFormTouched] = useState(false)
  const formRef = useRef(null)
  const successMsgRef = useRef(null)
  const errorMsgRef = useRef(null)

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))

    // Clear validation error when user starts typing
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({
        ...prev,
        [name]: null,
      }))
    }
  }

  const handleCheckboxChange = (e) => {
    const { value, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      services: checked ? [...prev.services, value] : prev.services.filter((service) => service !== value),
    }))
  }

  const handleDevisChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      devis_demande: e.target.checked,
    }))
  }

  const validateForm = () => {
    const errors = {}
    setFormTouched(true)

    // Required field validation
    if (!formData.nom.trim()) {
      errors.nom = "Veuillez entrer votre nom"
    }

    if (!formData.email.trim()) {
      errors.email = "Veuillez entrer votre adresse email"
    } else {
      // Email validation (must end with .fr, .com, etc.)
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(fr|com|net|org|edu|info)$/
      if (!emailRegex.test(formData.email)) {
        errors.email = "Veuillez entrer une adresse email valide (se terminant par .fr, .com, etc.)"
      }
    }

    if (!formData.telephone.trim()) {
      errors.telephone = "Veuillez entrer votre numéro de téléphone"
    } else {
      // French phone number validation (10 digits, starting with 0)
      const phoneRegex = /^0[1-9](\s?\d{2}){4}$/ // Accepts formats like 0123456789 or 01 23 45 67 89
      if (!phoneRegex.test(formData.telephone)) {
        errors.telephone = "Veuillez entrer un numéro de téléphone français valide (ex: 01 23 45 67 89)"
      }
    }

    // Check if at least one service is selected
    if (formData.services.length === 0) {
      errors.services = "Veuillez sélectionner au moins un service"
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validate form before submission
    if (!validateForm()) {
      // Find the first error and scroll to it
      const firstErrorField = Object.keys(validationErrors)[0]
      if (firstErrorField) {
        const errorElement = document.querySelector(`[name="${firstErrorField}"]`)
        if (errorElement) {
          errorElement.scrollIntoView({ behavior: "smooth", block: "center" })
        } else {
          // If can't find the element, scroll to the form top
          formRef.current.scrollIntoView({ behavior: "smooth", block: "start" })
        }
      }
      return
    }

    setIsSubmitting(true)
    setFormStatus({ success: false, error: null })

    try {
      const response = await fetch("http://localhost/IT_Repairs/Backend/routes.php?action=add_repair", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          services: formData.services.join(","),
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to submit repair request")
      }

      const result = await response.json()

      if (result.error) {
        throw new Error(result.error)
      }

      setFormStatus({ success: true, error: null })
      setFormData({
        nom: "",
        email: "",
        telephone: "",
        marque: "",
        modele: "",
        probleme: "",
        services: [],
        devis_demande: false,
      })

      // Scroll to success message
      if (successMsgRef.current) {
        successMsgRef.current.scrollIntoView({ behavior: "smooth", block: "center" })
      } else if (formRef.current) {
        formRef.current.scrollIntoView({ behavior: "smooth", block: "start" })
      }

      setValidationErrors({})
      setFormTouched(false)
    } catch (err) {
      console.error("Error submitting repair request:", err)
      setFormStatus({
        success: false,
        error: err.message || "Une erreur est survenue lors de l'envoi de votre demande.",
      })

      // Scroll to error message
      if (errorMsgRef.current) {
        errorMsgRef.current.scrollIntoView({ behavior: "smooth", block: "center" })
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  useEffect(() => {
    if (formStatus.success && successMsgRef.current) {
      // Scroll to success message
      successMsgRef.current.scrollIntoView({ behavior: "smooth", block: "center" })

      const timer = setTimeout(() => {
        setFormStatus({ success: false, error: null })
      }, 5000) // Increased to 5 seconds for better visibility
      return () => clearTimeout(timer)
    }

    if (formStatus.error && errorMsgRef.current) {
      // Scroll to error message
      errorMsgRef.current.scrollIntoView({ behavior: "smooth", block: "center" })
    }
  }, [formStatus])

  return (
    <div className={styles.repairFormContainer}>
      <form className={styles.repairForm} onSubmit={handleSubmit} ref={formRef} noValidate>
        {formStatus.success && (
          <div className={styles.successMessage} ref={successMsgRef}>
            Votre demande a été envoyée avec succès! Nous vous contacterons bientôt.
          </div>
        )}

        {formStatus.error && (
          <div className={styles.errorMessage} ref={errorMsgRef}>
            {formStatus.error}
          </div>
        )}

        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label htmlFor="nom">Nom *</label>
            <input
              type="text"
              id="nom"
              name="nom"
              value={formData.nom}
              onChange={handleInputChange}
              className={validationErrors.nom && formTouched ? styles.inputError : ""}
              placeholder="Votre nom"
            />
            {validationErrors.nom && formTouched && <div className={styles.fieldError}>{validationErrors.nom}</div>}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="email">Email *</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className={validationErrors.email && formTouched ? styles.inputError : ""}
              placeholder="Votre adresse email"
            />
            {validationErrors.email && formTouched && <div className={styles.fieldError}>{validationErrors.email}</div>}
          </div>
        </div>

        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label htmlFor="telephone">Téléphone *</label>
            <input
              type="tel"
              id="telephone"
              name="telephone"
              value={formData.telephone}
              onChange={handleInputChange}
              placeholder="01 23 45 67 89"
              className={validationErrors.telephone && formTouched ? styles.inputError : ""}
            />
            {validationErrors.telephone && formTouched && (
              <div className={styles.fieldError}>{validationErrors.telephone}</div>
            )}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="marque">Marque</label>
            <input
              type="text"
              id="marque"
              name="marque"
              value={formData.marque}
              onChange={handleInputChange}
              placeholder="Marque de votre appareil (optionnel)"
            />
          </div>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="modele">Modèle d'appareil</label>
          <input
            type="text"
            id="modele"
            name="modele"
            value={formData.modele}
            onChange={handleInputChange}
            placeholder="Modèle de votre appareil (optionnel)"
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="probleme">Description du problème</label>
          <textarea
            id="probleme"
            name="probleme"
            value={formData.probleme}
            onChange={handleInputChange}
            placeholder="Décrivez votre problème (optionnel)"
          ></textarea>
        </div>

        <div className={styles.formGroup}>
          <label>Services requis *</label>
          <div className={styles.checkboxGroup}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                name="services"
                value="remplacement_batterie"
                checked={formData.services.includes("remplacement_batterie")}
                onChange={handleCheckboxChange}
              />
              Remplacement de batterie
            </label>

            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                name="services"
                value="reparation_ecran"
                checked={formData.services.includes("reparation_ecran")}
                onChange={handleCheckboxChange}
              />
              Réparation d'écran
            </label>

            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                name="services"
                value="diagnostic"
                checked={formData.services.includes("diagnostic")}
                onChange={handleCheckboxChange}
              />
              Diagnostic complet
            </label>

            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                name="services"
                value="suppression_virus"
                checked={formData.services.includes("suppression_virus")}
                onChange={handleCheckboxChange}
              />
              Suppression de virus
            </label>

            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                name="services"
                value="installation_logiciel"
                checked={formData.services.includes("installation_logiciel")}
                onChange={handleCheckboxChange}
              />
              Installation de logiciel
            </label>

            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                name="services"
                value="creation_site_web"
                checked={formData.services.includes("creation_site_web")}
                onChange={handleCheckboxChange}
              />
              Création de site web
            </label>

            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                name="services"
                value="autre"
                checked={formData.services.includes("autre")}
                onChange={handleCheckboxChange}
              />
              Autre
            </label>
          </div>
          {validationErrors.services && formTouched && (
            <div className={styles.fieldError}>{validationErrors.services}</div>
          )}
        </div>

        <div className={styles.formGroup}>
          <label className={styles.checkboxLabel}>
            <input type="checkbox" name="devis_demande" checked={formData.devis_demande} onChange={handleDevisChange} />
            Je souhaite recevoir un devis avant réparation
          </label>
        </div>

        <button type="submit" className={styles.submitButton} disabled={isSubmitting}>
          {isSubmitting ? "Envoi en cours..." : "Envoyer la demande"}
        </button>

        <div className={styles.formNote}>* Champs obligatoires</div>
      </form>
    </div>
  )
}

export default RepairRequestForm

