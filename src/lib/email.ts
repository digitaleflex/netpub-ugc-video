import nodemailer from 'nodemailer';

interface ContactFormData {
  name: string;
  email: string;
  company?: string;
  service?: string;
  message: string;
}

interface AppointmentData {
  service: string;
  date: string;
  time: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
}

interface OrderData {
  service: string;
  details: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
}

class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.BREVO_SMTP_HOST || 'smtp-relay.brevo.com',
      port: parseInt(process.env.BREVO_SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.BREVO_SMTP_USER || '97349a001@smtp-brevo.com',
        pass: process.env.BREVO_SMTP_PASS || 'mot_de_passe_brevo_a_definir',
      },
    });
  }

  async sendContactNotification(contactData: ContactFormData): Promise<boolean> {
    try {
      console.log(`📧 Envoi d'une notification de contact à l'admin pour ${contactData.name}`);
      const mailOptions = {
        from: '"NetPub Contact" <noreply@netpub.agency>',
        to: process.env.ADMIN_EMAIL || 'org.netpub@gmail.com',
        subject: `Nouveau message de contact - ${contactData.name}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333; border-bottom: 2px solid #667eea; padding-bottom: 10px;">
              Nouveau message de contact
            </h2>

            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #495057; margin-top: 0;">Informations du contact :</h3>
              <p><strong>Nom :</strong> ${contactData.name}</p>
              <p><strong>Email :</strong> ${contactData.email}</p>
              ${contactData.company ? `<p><strong>Entreprise :</strong> ${contactData.company}</p>` : ''}
              ${contactData.service ? `<p><strong>Service demandé :</strong> ${contactData.service}</p>` : ''}

              <h3 style="color: #495057; margin-top: 30px;">Message :</h3>
              <div style="background: white; padding: 15px; border-radius: 5px; border-left: 4px solid #667eea;">
                ${contactData.message.replace(/\n/g, '<br>')}
              </div>
            </div>

            <div style="text-align: center; margin-top: 30px; color: #666; font-size: 12px;">
              <p>Ce message a été envoyé automatiquement depuis le formulaire de contact NetPub.</p>
            </div>
          </div>
        `,
        text: `
Nouveau message de contact

Informations du contact :
- Nom : ${contactData.name}
- Email : ${contactData.email}
${contactData.company ? `- Entreprise : ${contactData.company}` : ''}
${contactData.service ? `- Service demandé : ${contactData.service}` : ''}

Message :
${contactData.message}

---
Ce message a été envoyé automatiquement depuis le formulaire de contact NetPub.
        `,
      };

      await this.transporter.sendMail(mailOptions);
      console.log('✅ Email de notification envoyé avec succès à l\'admin');
      return true;
    } catch (error) {
      console.error('❌ Erreur lors de l\'envoi de l\'email de notification:', error);
      return false;
    }
  }

  async sendAutoReply(contactData: ContactFormData): Promise<boolean> {
    try {
      console.log(`📧 Envoi d'une réponse automatique à ${contactData.email}`);
      const mailOptions = {
        from: '"NetPub Agency" <noreply@netpub.agency>',
        to: contactData.email,
        subject: 'Merci pour votre message - NetPub Agency',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #667eea; margin: 0;">NetPub Agency</h1>
              <p style="color: #666; margin: 5px 0;">Agence de production vidéo UGC & publicitaire</p>
            </div>

            <div style="background: #f8f9fa; padding: 30px; border-radius: 8px; margin: 20px 0;">
              <h2 style="color: #333; margin-top: 0;">Merci ${contactData.name} !</h2>

              <p style="font-size: 16px; line-height: 1.6; color: #495057;">
                Nous avons bien reçu votre message et nous vous remercions de l'intérêt que vous portez à nos services.
              </p>

              <p style="font-size: 16px; line-height: 1.6; color: #495057;">
                Notre équipe va analyser votre demande et vous répondra dans les plus brefs délais, généralement sous 24h ouvrées.
              </p>

              <div style="background: white; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #667eea;">
                <h3 style="color: #495057; margin-top: 0;">Récapitulatif de votre demande :</h3>
                ${contactData.service ? `<p><strong>Service demandé :</strong> ${contactData.service}</p>` : ''}
                ${contactData.company ? `<p><strong>Entreprise :</strong> ${contactData.company}</p>` : ''}
              </div>

              <p style="font-size: 16px; line-height: 1.6; color: #495057;">
                N'hésitez pas à nous contacter directement si vous avez des questions urgentes :
              </p>

              <div style="background: white; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <p style="margin: 5px 0;"><strong>📞 Téléphone :</strong> +229 01 54 10 21 25</p>
                <p style="margin: 5px 0;"><strong>✉️ Email :</strong> org.netpub@gmail.com</p>
              </div>
            </div>

            <div style="text-align: center; margin-top: 30px; color: #666; font-size: 12px;">
              <p>Cordialement,<br>L'équipe NetPub Agency</p>
              <p>🇫🇷 Paris & 🇧🇯 Cotonou</p>
            </div>
          </div>
        `,
        text: `
Bonjour ${contactData.name},

Merci pour votre message !

Nous avons bien reçu votre demande et notre équipe vous répondra dans les plus brefs délais.

${contactData.service ? `Service demandé : ${contactData.service}` : ''}
${contactData.company ? `Entreprise : ${contactData.company}` : ''}

Pour nous contacter directement :
- Téléphone : +229 01 54 10 21 25
- Email : org.netpub@gmail.com

Cordialement,
L'équipe NetPub Agency
        `,
      };

      await this.transporter.sendMail(mailOptions);
      console.log('✅ Email de réponse automatique envoyé avec succès');
      return true;
    } catch (error) {
      console.error('❌ Erreur lors de l\'envoi de l\'email de réponse automatique:', error);
      return false;
    }
  }

  async sendAppointmentNotification(appointmentData: AppointmentData): Promise<boolean> {
    try {
      console.log(`📧 Envoi d'une notification de RDV pour ${appointmentData.clientName}`);

      // Email to Admin
      const adminMailOptions = {
        from: '"NetPub RDV" <noreply@netpub.agency>',
        to: process.env.ADMIN_EMAIL || 'org.netpub@gmail.com',
        subject: `Nouveau Rendez-vous : ${appointmentData.service} - ${appointmentData.clientName}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333; border-bottom: 2px solid #667eea; padding-bottom: 10px;">
              Nouveau Rendez-vous Confirmé
            </h2>
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p><strong>Client :</strong> ${appointmentData.clientName}</p>
              <p><strong>Email :</strong> ${appointmentData.clientEmail}</p>
              <p><strong>Téléphone :</strong> ${appointmentData.clientPhone}</p>
              <p><strong>Service :</strong> ${appointmentData.service}</p>
              <p><strong>Date :</strong> ${appointmentData.date}</p>
              <p><strong>Heure :</strong> ${appointmentData.time}</p>
            </div>
          </div>
        `
      };

      // Email to Client
      const clientMailOptions = {
        from: '"NetPub Agency" <noreply@netpub.agency>',
        to: appointmentData.clientEmail,
        subject: 'Confirmation de votre demande de rendez-vous - NetPub Agency',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #667eea;">Demande de rendez-vous reçue !</h2>
            <p>Bonjour ${appointmentData.clientName},</p>
            <p>Nous avons bien reçu votre demande de rendez-vous pour le service <strong>${appointmentData.service}</strong>.</p>
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p><strong>Date souhaitée :</strong> ${appointmentData.date}</p>
              <p><strong>Heure souhaitée :</strong> ${appointmentData.time}</p>
            </div>
            <p>Un membre de notre équipe vous contactera très prochainement pour confirmer ce créneau.</p>
            <p>Cordialement,<br>L'équipe NetPub Agency</p>
          </div>
        `
      };

      await this.transporter.sendMail(adminMailOptions);
      await this.transporter.sendMail(clientMailOptions);
      console.log('✅ Emails de RDV envoyés avec succès');
      return true;
    } catch (error) {
      console.error('❌ Erreur lors de l\'envoi des emails de RDV:', error);
      return false;
    }
  }

  async sendOrderNotification(orderData: OrderData): Promise<boolean> {
    try {
      console.log(`📧 Envoi d'une notification de commande pour ${orderData.clientName}`);

      // Email to Admin
      const adminMailOptions = {
        from: '"NetPub Commande" <noreply@netpub.agency>',
        to: process.env.ADMIN_EMAIL || 'org.netpub@gmail.com',
        subject: `Nouvelle Commande : ${orderData.service} - ${orderData.clientName}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333; border-bottom: 2px solid #667eea; padding-bottom: 10px;">
              Nouvelle Commande Reçue
            </h2>
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p><strong>Client :</strong> ${orderData.clientName}</p>
              <p><strong>Email :</strong> ${orderData.clientEmail}</p>
              <p><strong>Téléphone :</strong> ${orderData.clientPhone}</p>
              <p><strong>Service :</strong> ${orderData.service}</p>
              <p><strong>Détails :</strong> ${orderData.details}</p>
            </div>
          </div>
        `
      };

      // Email to Client
      const clientMailOptions = {
        from: '"NetPub Agency" <noreply@netpub.agency>',
        to: orderData.clientEmail,
        subject: 'Confirmation de votre commande - NetPub Agency',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #667eea;">Commande bien reçue !</h2>
            <p>Bonjour ${orderData.clientName},</p>
            <p>Nous avons bien enregistré votre commande pour le service <strong>${orderData.service}</strong>.</p>
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p><strong>Détails :</strong> ${orderData.details}</p>
            </div>
            <p>Notre équipe va analyser votre demande et revenir vers vous rapidement pour la suite.</p>
            <p>Cordialement,<br>L'équipe NetPub Agency</p>
          </div>
        `
      };

      await this.transporter.sendMail(adminMailOptions);
      await this.transporter.sendMail(clientMailOptions);
      console.log('✅ Emails de commande envoyés avec succès');
      return true;
    } catch (error) {
      console.error('❌ Erreur lors de l\'envoi des emails de commande:', error);
      return false;
    }
  }
}

export const emailService = new EmailService();