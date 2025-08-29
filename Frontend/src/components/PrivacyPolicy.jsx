/* eslint-disable react/no-unescaped-entities */
/* eslint-disable no-unused-vars */
import React from 'react'
import styles from '../styles/Legal.module.css'

function PrivacyPolicy() {
  return (
    <div className={styles.legalContainer}>
      <div className={styles.legalContent}>
        <h1 className={styles.legalTitle}>Politique de Confidentialité</h1>
        
        <div className={styles.legalSection}>
          <h2>1. Responsable du traitement</h2>
          <p>
            IT Repairs, située à [Votre adresse], est responsable du traitement de vos données personnelles.
          </p>
        </div>

        <div className={styles.legalSection}>
          <h2>2. Données collectées</h2>
          <p>Nous collectons les données suivantes :</p>
          <ul>
            <li>Données d'identification : nom, prénom, email, téléphone</li>
            <li>Données de livraison : adresse de livraison</li>
            <li>Données de navigation : cookies, adresse IP</li>
            <li>Données de paiement : traitées par Stripe (nous ne stockons pas vos données bancaires)</li>
          </ul>
        </div>

        <div className={styles.legalSection}>
          <h2>3. Finalités du traitement</h2>
          <p>Vos données sont utilisées pour :</p>
          <ul>
            <li>Traiter vos commandes et livraisons</li>
            <li>Gérer votre compte client</li>
            <li>Vous contacter concernant vos commandes</li>
            <li>Améliorer nos services</li>
            <li>Respecter nos obligations légales</li>
          </ul>
        </div>

        <div className={styles.legalSection}>
          <h2>4. Base légale</h2>
          <p>
            Le traitement de vos données repose sur l'exécution du contrat de vente, 
            votre consentement pour certains traitements, et nos intérêts légitimes.
          </p>
        </div>

        <div className={styles.legalSection}>
          <h2>5. Conservation des données</h2>
          <p>
            Vos données sont conservées pendant la durée nécessaire aux finalités 
            pour lesquelles elles ont été collectées, et au minimum 3 ans pour 
            respecter nos obligations comptables.
          </p>
        </div>

        <div className={styles.legalSection}>
          <h2>6. Vos droits</h2>
          <p>Vous disposez des droits suivants :</p>
          <ul>
            <li>Droit d'accès à vos données</li>
            <li>Droit de rectification</li>
            <li>Droit à l'effacement</li>
            <li>Droit à la limitation du traitement</li>
            <li>Droit à la portabilité</li>
            <li>Droit d'opposition</li>
          </ul>
          <p>
            Pour exercer ces droits, contactez-nous à : dpo@itrepairs.fr
          </p>
        </div>

        <div className={styles.legalSection}>
          <h2>7. Cookies</h2>
          <p>
            Notre site utilise des cookies pour améliorer votre expérience. 
            Vous pouvez gérer vos préférences cookies via notre bandeau de consentement.
          </p>
        </div>

        <div className={styles.legalSection}>
          <h2>8. Sécurité</h2>
          <p>
            Nous mettons en place des mesures techniques et organisationnelles 
            appropriées pour protéger vos données contre tout accès non autorisé.
          </p>
        </div>
      </div>
    </div>
  )
}

export default PrivacyPolicy
