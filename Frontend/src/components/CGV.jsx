import React from 'react'
import styles from '../styles/Legal.module.css'

function CGV() {
  return (
    <div className={styles.legalContainer}>
      <div className={styles.legalContent}>
        <h1 className={styles.legalTitle}>Conditions Générales de Vente</h1>
        
        <div className={styles.legalSection}>
          <h2>1. Informations légales</h2>
          <p>
            <strong>Raison sociale :</strong> IT Repairs<br />
            <strong>Adresse :</strong> [Votre adresse]<br />
            <strong>SIRET :</strong> [Votre numéro SIRET]<br />
            <strong>Email :</strong> contact@itrepairs.fr<br />
            <strong>Téléphone :</strong> [Votre téléphone]
          </p>
        </div>

        <div className={styles.legalSection}>
          <h2>2. Objet</h2>
          <p>
            Les présentes conditions générales de vente (CGV) définissent les conditions dans lesquelles 
            IT Repairs vend ses produits et services de réparation informatique.
          </p>
        </div>

        <div className={styles.legalSection}>
          <h2>3. Prix</h2>
          <p>
            Les prix sont indiqués en euros toutes taxes comprises (TTC). Ils incluent la TVA au taux 
            en vigueur. Les prix peuvent être modifiés à tout moment mais sont garantis pour toute 
            commande validée.
          </p>
        </div>

        <div className={styles.legalSection}>
          <h2>4. Commande et paiement</h2>
          <p>
            La commande est confirmée après validation du paiement. Le paiement s'effectue par carte 
            bancaire via notre prestataire sécurisé Stripe. Aucune donnée bancaire n'est conservée 
            sur nos serveurs.
          </p>
        </div>

        <div className={styles.legalSection}>
          <h2>5. Livraison</h2>
          <p>
            Les produits sont livrés à l'adresse indiquée lors de la commande. Les délais de livraison 
            sont de 3 à 5 jours ouvrés pour la France métropolitaine. La livraison est gratuite.
          </p>
        </div>

        <div className={styles.legalSection}>
          <h2>6. Droit de rétractation</h2>
          <p>
            Conformément à l'article L. 221-18 du Code de la consommation, vous disposez d'un délai 
            de 14 jours à compter de la réception de votre commande pour exercer votre droit de 
            rétractation sans avoir à justifier de motifs ni à payer de pénalité.
          </p>
        </div>

        <div className={styles.legalSection}>
          <h2>7. Garanties</h2>
          <p>
            Tous nos produits bénéficient de la garantie légale de conformité et de la garantie 
            contre les vices cachés. Les réparations sont garanties 3 mois.
          </p>
        </div>

        <div className={styles.legalSection}>
          <h2>8. Réclamations et litiges</h2>
          <p>
            Pour toute réclamation, contactez-nous à contact@itrepairs.fr. En cas de litige, 
            une solution amiable sera recherchée avant toute action judiciaire.
          </p>
        </div>
      </div>
    </div>
  )
}

export default CGV
