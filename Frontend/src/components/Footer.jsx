import { Facebook, Twitter, Instagram, Youtube } from "react-feather"
import styles from "../styles/Auth.module.css"; // Updated import


function Footer() {
  return (
    <footer className={styles.siteFooter}> {/* Use styles here */}
      <div className={styles.footerContent}>
        <div className={styles.socialIcons}>
          <a href="#" className={styles.socialIcon} aria-label="Twitter">
            <Twitter />
          </a>
          <a href="#" className={styles.socialIcon} aria-label="Facebook">
            <Facebook />
          </a>
          <a href="#" className={styles.socialIcon} aria-label="Instagram">
            <Instagram />
          </a>
          <a href="#" className={styles.socialIcon} aria-label="Youtube">
            <Youtube />
          </a>
        </div>
        <div className={styles.footerText}>
          © 2024 Brand, Inc. · Privacy · Terms · Sitemap
        </div>
      </div>
    </footer>
  );
}

export default Footer
