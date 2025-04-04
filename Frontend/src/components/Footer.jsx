

import { Facebook, Twitter, Instagram, Youtube } from "react-feather";
import styles from "../styles/Auth.module.css"; // Import des styles CSS

function Footer() {
  return (
    <footer className={styles.siteFooter}>
      {/* Conteneur principal du footer */}
      <div className={styles.footerContent}>
        {/* Section des icônes sociales */}
        <div className={styles.socialIcons}>
          {/* Lien Twitter */}
          <a href="#" className={styles.socialIcon} aria-label="Twitter">
            <Twitter />
          </a>
          {/* Lien Facebook */}
          <a href="#" className={styles.socialIcon} aria-label="Facebook">
            <Facebook />
          </a>
          {/* Lien Instagram */}
          <a href="#" className={styles.socialIcon} aria-label="Instagram">
            <Instagram />
          </a>
          {/* Lien YouTube */}
          <a href="#" className={styles.socialIcon} aria-label="Youtube">
            <Youtube />
          </a>
        </div>
        {/* Texte du footer (copyright et liens légaux) */}
        <div className={styles.footerText}>
          © 2024 Brand, Inc. · Privacy · Terms · Sitemap
        </div>
      </div>
    </footer>
  );
}

export default Footer;