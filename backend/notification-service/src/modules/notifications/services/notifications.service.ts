import { Injectable, Logger } from '@nestjs/common';
import type { IEmailResult } from '../interfaces/notification.interface.js';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  transactionId?: string;
}

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  async sendEmail(options: EmailOptions): Promise<IEmailResult> {
    this.logger.log(
      `Sending email to ${options.to} - Subject: "${options.subject}"`,
    );

    try {
      const messageId = await this.dispatchEmail();

      this.logger.log(
        `Email sent successfully to ${options.to} (ID: ${messageId})`,
      );

      return { success: true, messageId };
    } catch (error) {
      this.logger.error(
        `Failed to send email to ${options.to}: ${String(error)}`,
      );
      return { success: false, error: String(error) };
    }
  }

  async sendTransactionSuccessEmail(data: {
    to: string;
    transactionId: string;
    amount: number;
    phoneNumber: string;
    fees: number;
    operator: string;
    createdAt: string;
  }): Promise<IEmailResult> {
    const subject = `Transaction réussie - ${data.transactionId}`;
    const html = this.buildTransactionSuccessTemplate(data);

    return this.sendEmail({
      to: data.to,
      subject,
      html,
      transactionId: data.transactionId,
    });
  }

  private buildTransactionSuccessTemplate(data: {
    transactionId: string;
    amount: number;
    phoneNumber: string;
    fees: number;
    operator: string;
    createdAt: string;
  }): string {
    const total = data.amount + data.fees;
    const date = new Date(data.createdAt).toLocaleString('fr-FR', {
      timeZone: 'Africa/Douala',
    });

    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: #00A859; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0;">PayCash Cameroon</h1>
        </div>
        <div style="background: white; padding: 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 8px 8px;">
          <h2 style="color: #00A859; margin-top: 0;">Transaction réussie ✅</h2>
          <p style="color: #555;">Bonjour,</p>
          <p style="color: #555;">Votre transaction Mobile Money a été effectuée avec succès.</p>
          <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <table style="width: 100%;">
              <tr><td style="padding: 5px 0; color: #888;">Référence</td><td style="font-weight: bold;">${data.transactionId}</td></tr>
              <tr><td style="padding: 5px 0; color: #888;">Montant</td><td style="font-weight: bold;">${data.amount.toLocaleString()} XAF</td></tr>
              <tr><td style="padding: 5px 0; color: #888;">Frais</td><td style="font-weight: bold;">${data.fees.toLocaleString()} XAF</td></tr>
              <tr><td style="padding: 5px 0; color: #888;">Total débité</td><td style="font-weight: bold; color: #00A859;">${total.toLocaleString()} XAF</td></tr>
              <tr><td style="padding: 5px 0; color: #888;">Numéro</td><td style="font-weight: bold;">${data.phoneNumber}</td></tr>
              <tr><td style="padding: 5px 0; color: #888;">Opérateur</td><td style="font-weight: bold;">${data.operator}</td></tr>
              <tr><td style="padding: 5px 0; color: #888;">Date</td><td style="font-weight: bold;">${date}</td></tr>
            </table>
          </div>
          <p style="color: #555;">Merci d'utiliser <strong>PayCash</strong> pour vos transactions Mobile Money.</p>
          <p style="color: #aaa; font-size: 12px; margin-top: 30px;">Cet email est généré automatiquement, merci de ne pas y répondre.</p>
        </div>
      </div>
    `;
  }

  private async dispatchEmail(): Promise<string> {
    const messageId = `MSG-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
    await this.simulateSmtpLatency(400);
    this.logger.debug(`Email dispatched: ${messageId} (simulated)`);
    return messageId;
  }

  private simulateSmtpLatency(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
