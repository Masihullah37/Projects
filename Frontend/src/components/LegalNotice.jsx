/* eslint-disable react/no-unescaped-entities */

// eslint-disable-next-line no-unused-vars
import React from 'react';
import styles from '../styles/LegalNotice.module.css';

export default function LegalNotice() {
  return (
    <div className={styles.container}>
      <h1 className={styles.mainTitle}>Mentions Légales</h1>
      
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>1. Informations légales</h2>
        <p className={styles.text}>
          <strong>Nom de l'entreprise :</strong> ICV Informatique<br />
          <strong>Forme juridique :</strong> [SARL/EURL/Auto-entrepreneur etc.]<br />
          <strong>Adresse :</strong> 10 place de la grange, 37300 Joué-lès-Tours, France<br />
          <strong>Téléphone :</strong> 09 71 26 37 56<br />
          <strong>Email :</strong> contact@icvinformatique.com<br />
          <strong>Capital social :</strong> [Montant] euros<br />
          <strong>RCS :</strong> Tours [Numéro RCS]<br />
          <strong>SIRET :</strong> [Numéro SIRET]<br />
          <strong>Numéro TVA intracommunautaire :</strong> FR[Numéro TVA]<br />
          <strong>Responsable de publication :</strong> [Nom du responsable]
        </p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>2. Hébergement du site</h2>
        <p className={styles.text}>
          <strong>Hébergeur :</strong> [Nom de l'hébergeur]<br />
          <strong>Adresse :</strong> [Adresse de l'hébergeur]<br />
          <strong>Téléphone :</strong> [Téléphone de l'hébergeur]
        </p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>3. Protection des données personnelles</h2>
        <p className={styles.text}>
          Conformément au Règlement Général sur la Protection des Données (RGPD) 2016/679, nous vous informons que :
        </p>
        <ul className={styles.list}>
          <li>Les données collectées sont traitées de manière licite, loyale et transparente</li>
          <li>Les données sont collectées pour des finalités déterminées, explicites et légitimes</li>
          <li>Nous conservons vos données uniquement le temps nécessaire</li>
          <li>Vous disposez d'un droit d'accès, de rectification et de suppression de vos données</li>
        </ul>
        <p className={styles.text}>
          Notre Délégué à la Protection des Données (DPO) peut être contacté à : dpo@icvinformatique.com
        </p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>4. Propriété intellectuelle</h2>
        <p className={styles.text}>
          L'ensemble des éléments du site (textes, images, logos, etc.) sont la propriété exclusive de ICV Informatique.
          Toute reproduction sans autorisation est interdite.
        </p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>5. Cookies</h2>
        <p className={styles.text}>
          Le site utilise des cookies pour améliorer l'expérience utilisateur. Vous pouvez les désactiver dans les paramètres de votre navigateur.
        </p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>6. Litiges</h2>
        <p className={styles.text}>
          En cas de litige, les tribunaux français seront compétents. Conformément à l'article L.612-1 du Code de la consommation,
          vous pouvez recourir à un médiateur de la consommation.
        </p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>7. Contact</h2>
        <p className={styles.text}>
          Pour toute question concernant ces mentions légales, vous pouvez nous contacter à l'adresse email contact@icvinformatique.com
          ou par téléphone au 09 71 26 37 56.
        </p>
      </section>

      <p className={styles.updateDate}>Dernière mise à jour : 15/06/2025</p>
    </div>
  );
}