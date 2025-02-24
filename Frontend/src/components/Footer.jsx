import { Facebook, Twitter, Instagram, Youtube } from "react-feather"

function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-content">
        <div className="social-icons">
          <a href="#" className="social-icon" aria-label="Twitter">
            <Twitter />
          </a>
          <a href="#" className="social-icon" aria-label="Facebook">
            <Facebook />
          </a>
          <a href="#" className="social-icon" aria-label="Instagram">
            <Instagram />
          </a>
          <a href="#" className="social-icon" aria-label="Youtube">
            <Youtube />
          </a>
        </div>
        <div className="footer-text">© 2024 Brand, Inc. · Privacy · Terms · Sitemap</div>
      </div>
    </footer>
  )
}

export default Footer

