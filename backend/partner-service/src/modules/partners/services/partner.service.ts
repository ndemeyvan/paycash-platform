import { Injectable, Logger } from '@nestjs/common';
import { Operator } from '../../../types/index.js';
import type { IPartnerVerifyResponse } from '../interfaces/partner.interface.js';

@Injectable()
export class PartnerService {
  private readonly logger = new Logger(PartnerService.name);

  async verifyAccount(
    phoneNumber: string,
    operator: Operator,
  ): Promise<IPartnerVerifyResponse> {
    this.logger.log(`Verifying account ${phoneNumber} with ${operator}`);

    try {
      await this.simulateApiLatency(300);

      const isValid = Math.random() < 0.95;

      this.logger.debug(`Account ${phoneNumber} verification: ${isValid}`);

      return {
        phoneNumber,
        operator,
        isValid,
        message: isValid ? 'Compte valide' : 'Compte invalide ou inexistant',
      };
    } catch (error) {
      this.logger.error(
        `Verification error for ${phoneNumber}: ${String(error)}`,
      );
      return {
        phoneNumber,
        operator,
        isValid: false,
        message: 'Erreur lors de la vérification du compte',
      };
    }
  }

  getPartnerInfo(operator: Operator) {
    this.logger.log(`Getting partner info for ${operator}`);

    const partners = {
      [Operator.ORANGE]: {
        id: 'orange-cm',
        name: 'Orange Money Cameroon',
        operator: Operator.ORANGE,
        apiUrl: 'https://api.orange.cm/money/v1',
        isActive: true,
      },
      [Operator.MTN]: {
        id: 'mtn-cm',
        name: 'MTN Mobile Money Cameroon',
        operator: Operator.MTN,
        apiUrl: 'https://api.mtn.cm/momo/v1',
        isActive: true,
      },
    };

    return Promise.resolve(partners[operator] || null);
  }

  private simulateApiLatency(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
