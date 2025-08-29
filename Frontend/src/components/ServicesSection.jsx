/* eslint-disable react/no-unescaped-entities */
import { useRef } from "react";
import { useNavigate } from 'react-router-dom';
import styles from "../styles/ServicesSection.module.css";

function ServicesSection() {
  // Référence pour la section des services
  const servicesSectionRef = useRef(null);
  const navigate = useNavigate();

  const handleContactClick = () => {
    if (window.location.pathname !== '/') {
      navigate('/#contact'); // Redirect to home with contact hash
    } else {
      // If already on home page, scroll to contact
      const contactSection = document.getElementById('contact');
      if (contactSection) {
        const yOffset = -100;
        const y = contactSection.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
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
          <button onClick={handleContactClick} className={styles.contactButton}>
            Contactez Nos Experts
          </button>
        </div>

        {/* Service Card 2 */}
        <div className={styles.serviceCard}>
          <h3 className={styles.serviceTitle}>Hébergement Cloud</h3>
          <p className={styles.serviceDescription}>
            Gardez vos données en toute sécurité dans un espace privé, flexible et adapté à vos besoins.
          </p>
          <button onClick={handleContactClick} className={styles.contactButton}>
            Contactez Nos Experts
          </button>
        </div>

        {/* Service Card 3 */}
        <div className={styles.serviceCard}>
          <h3 className={styles.serviceTitle}>Récupération de Données</h3>
          <p className={styles.serviceDescription}>
            Restauration après panne - Récupération logicielle, environnement contrôlé.
          </p>
          <button onClick={handleContactClick} className={styles.contactButton}>
            Contactez Nos Experts
          </button>
        </div>

        {/* Service Card 4 */}
        <div className={styles.serviceCard}>
          <h3 className={styles.serviceTitle}>Protection de Système</h3>
          <p className={styles.serviceDescription}>
            Maintenance PC, éradication des virus et malwares, renforcement de la sécurité, sauvegarde de données.
          </p>
          <button onClick={handleContactClick} className={styles.contactButton}>
            Contactez Nos Experts
          </button>
        </div>

        {/* Service Card 5 */}
        <div className={styles.serviceCard}>
          <h3 className={styles.serviceTitle}>Support Technique</h3>
          <p className={styles.serviceDescription}>
            À votre service chez vous, en entreprise ou à distance, nous résolvons vos problèmes informatiques.
          </p>
          <button onClick={handleContactClick} className={styles.contactButton}>
            Contactez Nos Experts
          </button>
        </div>

        {/* Service Card 6 */}
        <div className={styles.serviceCard}>
          <h3 className={styles.serviceTitle}>Création de Site Web</h3>
          <p className={styles.serviceDescription}>
            Conception de sites web sur mesure, modernes et adaptés à vos besoins professionnels.
          </p>
          <button onClick={handleContactClick} className={styles.contactButton}>
            Contactez Nos Experts
          </button>
        </div>
      </div>
    </section>
  );
}

export default ServicesSection;

