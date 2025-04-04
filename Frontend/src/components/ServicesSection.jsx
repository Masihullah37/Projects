


import { useRef } from "react";
import styles from "../styles/ServicesSection.module.css";

function ServicesSection({ repairFormRef }) {
   // Référence pour la section des services
  const servicesSectionRef = useRef(null);

  const scrollToRepairForm = () => {
    if (repairFormRef.current) {
      const yOffset = -100; // Adjust this value as needed
      const element = repairFormRef.current;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;

      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  return (
    <section ref={servicesSectionRef} id="services" className={styles.servicesSection}>
      <h2 className={styles.sectionTitle}>Nos Services</h2>
       
      {/* Grille des services */}
      <div className={styles.servicesGrid}>
        {/* Service Card 1 */}
        <div className={styles.serviceCard}>
          <h3 className={styles.serviceTitle}>Réparation Rapide et Efficace</h3>
          <p className={styles.serviceDescription}>
            Notre équipe d'experts assure une réparation rapide et efficace de vos appareils portables.
          </p>
          <button onClick={scrollToRepairForm} className={styles.contactButton}>
            Contactez Nos Experts
          </button>
        </div>

        {/* Service Card 2 */}
        <div className={styles.serviceCard}>
          <h3 className={styles.serviceTitle}>Hébergement Cloud</h3>
          <p className={styles.serviceDescription}>
            Gardez vos données en toute sécurité dans un espace privé, flexible et adapté à vos besoins.
          </p>
          <button onClick={scrollToRepairForm} className={styles.contactButton}>
            Contactez Nos Experts
          </button>
        </div>

        {/* Service Card 3 */}
        <div className={styles.serviceCard}>
          <h3 className={styles.serviceTitle}>Récupération de Données</h3>
          <p className={styles.serviceDescription}>
            Restauration après panne - Récupération logicielle, environnement contrôlé.
          </p>
          <button onClick={scrollToRepairForm} className={styles.contactButton}>
            Contactez Nos Experts
          </button>
        </div>

        {/* Service Card 4 */}
        <div className={styles.serviceCard}>
          <h3 className={styles.serviceTitle}>Protection de Système</h3>
          <p className={styles.serviceDescription}>
            Maintenance PC, éradication des virus et malwares, renforcement de la sécurité, sauvegarde de données.
          </p>
          <button onClick={scrollToRepairForm} className={styles.contactButton}>
            Contactez Nos Experts
          </button>
        </div>

        {/* Service Card 5 */}
        <div className={styles.serviceCard}>
          <h3 className={styles.serviceTitle}>Support Technique</h3>
          <p className={styles.serviceDescription}>
            À votre service chez vous, en entreprise ou à distance, nous résolvons vos problèmes informatiques.
          </p>
          <button onClick={scrollToRepairForm} className={styles.contactButton}>
            Contactez Nos Experts
          </button>
        </div>

        {/* Service Card 6 */}
        <div className={styles.serviceCard}>
          <h3 className={styles.serviceTitle}>Création de Site Web</h3>
          <p className={styles.serviceDescription}>
            Conception de sites web sur mesure, modernes et adaptés à vos besoins professionnels.
          </p>
          <button onClick={scrollToRepairForm} className={styles.contactButton}>
            Contactez Nos Experts
          </button>
        </div>
      </div>
    </section>
  );
}

export default ServicesSection;