import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { NotificationsService } from '../services/notifications.service.js';
import {
  SendEmailDto,
  TransactionSuccessEmailDto,
} from '../dtos/send-email.dto.js';

@ApiTags('Notifications')
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post('email')
  @ApiOperation({
    summary: 'Envoyer un email',
    description: 'Envoie un email avec contenu HTML personnalisé',
  })
  @ApiResponse({
    status: 201,
    description: 'Email envoyé avec succès',
  })
  @ApiResponse({ status: 400, description: 'Paramètres invalides' })
  async sendEmail(@Body() dto: SendEmailDto) {
    return this.notificationsService.sendEmail({
      to: dto.to,
      subject: dto.subject,
      html: dto.html,
      transactionId: dto.transactionId,
    });
  }

  @Post('email/transaction-success')
  @ApiOperation({
    summary: 'Envoyer un email de confirmation de transaction',
    description:
      'Envoie un email formaté avec les détails de la transaction réussie',
  })
  @ApiResponse({
    status: 201,
    description: 'Email de confirmation envoyé',
  })
  @ApiResponse({ status: 400, description: 'Paramètres invalides' })
  async sendTransactionSuccessEmail(@Body() dto: TransactionSuccessEmailDto) {
    return this.notificationsService.sendTransactionSuccessEmail({
      to: dto.to,
      transactionId: dto.transactionId,
      amount: dto.amount,
      phoneNumber: dto.phoneNumber,
      fees: dto.fees,
      operator: dto.operator,
      createdAt: dto.createdAt,
    });
  }
}
