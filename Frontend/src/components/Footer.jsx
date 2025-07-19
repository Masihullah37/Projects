


import { Facebook, Twitter, Instagram, Youtube } from "react-feather";
import styles from "../styles/Footer.module.css";
import { Link,useNavigate } from 'react-router-dom';

function Footer() {
   const navigate = useNavigate();

  const handleContactClick = () => {
    // If we're not on the home page, navigate to home with hash
    if (window.location.pathname !== '/') {
      navigate('/#contact'); // Assuming your contact section has id="contact"
    } else {
      // If we're already on home page, scroll to contact section
      const contactSection = document.getElementById('contact');
      if (contactSection) {
        const yOffset = -100; // Adjust as needed
        const y = contactSection.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    }
  };
  return (
    <footer className={styles.footer}>
      <div className={styles.footerContainer}>
        {/* Social Icons */}
        <div className={styles.socialIcons}>
          <a href="#" className={styles.socialLink} aria-label="Twitter">
            <Twitter className={styles.socialIcon} />
          </a>
          <a href="#" className={styles.socialLink} aria-label="Facebook">
            <Facebook className={styles.socialIcon} />
          </a>
          <a href="#" className={styles.socialLink} aria-label="Instagram">
            <Instagram className={styles.socialIcon} />
          </a>
          <a href="#" className={styles.socialLink} aria-label="Youtube">
            <Youtube className={styles.socialIcon} />
          </a>
        </div>

        {/* Footer Content */}
        <div className={styles.footerContent}>
          {/* Navigation Column */}
          <div className={styles.footerColumn}>
            <h3 className={styles.columnTitle}>Navigation</h3>
            <ul className={styles.footerLinks}>
              <li><Link to="/" className={styles.navLink}>Accueil</Link></li>
              <li><Link to="/services" className={styles.navLink}>Services</Link></li>
              <li>
                <Link onClick={handleContactClick} className={styles.navLink}>
                  Contact
                </Link>
              </li>
              {/* <li><Link to="/contact" className={styles.navLink}>Contact</Link></li> */}
            </ul>
          </div>

          {/* Legal Column */}
          <div className={styles.footerColumn}>
            <h3 className={styles.columnTitle}>Mentions Légales</h3>
            <ul className={styles.footerLinks}>
              <li><Link to="/conditions-generales-de-vente" className={styles.navLink}>Conditions Générales</Link></li>
              <li><Link to="/politique-de-confidentialite" className={styles.navLink}>Politique de Confidentialité</Link></li>
              <li><Link to="/mentions-legales" className={styles.navLink}>Mentions Légales</Link></li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className={styles.copyright}>
          © {new Date().getFullYear()} ICV Informatique · <Link to="/privacy" className={styles.copyrightLink}>Privacy</Link> · <Link to="/terms" className={styles.copyrightLink}>Terms</Link> · <Link to="/sitemap" className={styles.copyrightLink}>Sitemap</Link>
        </div>
      </div>
    </footer>
  );
}

export default Footer;