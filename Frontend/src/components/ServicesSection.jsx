


import { useRef } from "react"
import styles from "../styles/ServicesSection.module.css"

function ServicesSection({ repairFormRef }) {
  const servicesSectionRef = useRef(null)

  const scrollToRepairForm = () => {
    // Add an offset to ensure the title is visible
    if (repairFormRef.current) {
      const yOffset = -100 // Adjust this value as needed
      const element = repairFormRef.current
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset

      window.scrollTo({ top: y, behavior: "smooth" })
    }
  }

  return (
    <section ref={servicesSectionRef} id="services" className={styles.servicesSection}>
      <h2 className={styles.sectionTitle}>Nos Services</h2>

      <div className={styles.servicesGrid}>
        {/* Service Card 1 */}
        <div className={styles.serviceCard}>
          <h3 className={styles.serviceTitle}>Réparation rapide et efficace de portables par des experts</h3>
          <p className={styles.serviceDescription}>
            Notre équipe d'experts assure une réparation rapide et efficace de vos appareils portables.
          </p>
          <button onClick={scrollToRepairForm} className={styles.contactButton}>
            Contactez Nos expert
          </button>
        </div>

        {/* Service Card 2 */}
        <div className={styles.serviceCard}>
          <h3 className={styles.serviceTitle}>Hébergement Cloud</h3>
          <p className={styles.serviceDescription}>
            Gardez vos données en toute sécurité dans un espace privé, flexible et adapté à vos besoins.
          </p>
          <button onClick={scrollToRepairForm} className={styles.contactButton}>
            Contactez Nos expert
          </button>
        </div>

        {/* Service Card 3 */}
        <div className={styles.serviceCard}>
          <h3 className={styles.serviceTitle}>Services de Récupération de Données</h3>
          <p className={styles.serviceDescription}>
            Restauration après panne - Récupération logicielle, environnement contrôlé.
          </p>
          <button onClick={scrollToRepairForm} className={styles.contactButton}>
            Contactez Nos expert
          </button>
        </div>

        {/* Service Card 4 */}
        <div className={styles.serviceCard}>
          <h3 className={styles.serviceTitle}>Protection de votre Système</h3>
          <p className={styles.serviceDescription}>
            Maintenance PC, Éradication des Virus et Malwares, Renforcement de la Sécurité, Sauvegarde de Données.
          </p>
          <button onClick={scrollToRepairForm} className={styles.contactButton}>
            Contactez Nos expert
          </button>
        </div>

        {/* Service Card 5 */}
        <div className={styles.serviceCard}>
          <h3 className={styles.serviceTitle}>Support Technique</h3>
          <p className={styles.serviceDescription}>
            À votre service chez vous, en entreprise ou à distance, nous sommes là pour résoudre vos problèmes
            informatiques, assurer la maintenance, le nettoyage et la sécurisation de vos appareils.
          </p>
          <button onClick={scrollToRepairForm} className={styles.contactButton}>
            Contactez Nos expert
          </button>
        </div>

        {/* Service Card 6 */}
        <div className={styles.serviceCard}>
          <h3 className={styles.serviceTitle}>Tech Essentials</h3>
          <p className={styles.serviceDescription}>
            Obtenez les pièces requises de votre ordinateur pour mieux le faire fonctionner.
          </p>
          <button onClick={scrollToRepairForm} className={styles.contactButton}>
            Contactez Nos expert
          </button>
        </div>
      </div>
    </section>
  )
}

export default ServicesSection

