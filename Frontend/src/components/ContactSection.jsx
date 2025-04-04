

import { MapPin, Clock, Mail, Phone } from "react-feather";
import styles from "../styles/ContactSection.module.css";

function ContactSection() {
  // Formatage de l'adresse pour Google Maps
  const address = "10 place de la grange 37300 Joué-lès-Tours, France";
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;

  // Formatage de l'email pour Gmail
  const email = "contact@icvinformatique.com";
  const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(email)}`;

  return (
    <div className={styles.contactSectionWrapper}>
      <section id="contact" className={styles.contactSection}>
        <div className={styles.contactContainer}>
          <h2 className={styles.contactTitle}>Contactez-nous</h2>
          <p className={styles.contactDescription}>
            Nous sommes situés à Joué-lès-Tours, offrant des services informatiques de confiance depuis plus de 10 ans.
          </p>

          {/* Grille des informations de contact */}
          <div className={styles.contactGrid}>
            {/* Adresse */}
            <div className={styles.contactItem}>
              <div className={styles.contactIcon}>
                <MapPin size={24} />
              </div>
              <div className={styles.contactInfo}>
                <h3>Adresse</h3>
                <p>
                  <a href={googleMapsUrl} target="_blank" rel="noopener noreferrer" className={styles.addressLink}>
                    10 place de la grange 37300 Joué-lès-Tours, France
                  </a>
                </p>
              </div>
            </div>

            {/* Horaires */}
            <div className={styles.contactItem}>
              <div className={styles.contactIcon}>
                <Clock size={24} />
              </div>
              <div className={styles.contactInfo}>
                <h3>Heures</h3>
                <p>
                  <strong>Lundi - Vendredi :</strong> 9h00 - 12h00 / 14h00 - 18h00
                </p>
                <p>
                  <strong>Samedi :</strong> 14h00 - 17h00
                </p>
              </div>
            </div>

            {/* Email */}
            <div className={styles.contactItem}>
              <div className={styles.contactIcon}>
                <Mail size={24} />
              </div>
              <div className={styles.contactInfo}>
                <h3>Email</h3>
                <p>
                  <a href={gmailUrl} target="_blank" rel="noopener noreferrer">
                    contact@icvinformatique.com
                  </a>
                </p>
              </div>
            </div>

            {/* Téléphone */}
            <div className={styles.contactItem}>
              <div className={styles.contactIcon}>
                <Phone size={24} />
              </div>
              <div className={styles.contactInfo}>
                <h3>Téléphone</h3>
                <p>
                  <a href="tel:0971263756">09 71 26 37 56</a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default ContactSection;


