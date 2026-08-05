import { Controller, Post, Get, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { FeesService } from '../services/fees.service.js';
import { CalculateFeeDto } from '../dtos/fee.dto.js';

@ApiTags('Fees')
@Controller('fees')
export class FeesController {
  constructor(private readonly feesService: FeesService) {}

  @Post('calculate')
  @ApiOperation({
    summary: 'Calculer les frais de transaction',
    description:
      "Calcule les frais applicables selon l'opérateur, le montant et le type de transaction",
  })
  @ApiResponse({
    status: 201,
    description: 'Frais calculés avec succès',
  })
  @ApiResponse({ status: 400, description: 'Paramètres invalides' })
  async calculate(@Body() dto: CalculateFeeDto) {
    return this.feesService.calculate(
      dto.amount,
      dto.operator,
      dto.transactionType,
      dto.userPaysFees,
    );
  }

  @Get('rates')
  @ApiOperation({
    summary: 'Récupérer les grilles tarifaires',
    description: 'Retourne les taux de frais pour tous les opérateurs',
  })
  @ApiResponse({ status: 200, description: 'Grilles tarifaires' })
  getRates() {
    return {
      operators: {
        ORANGE: {
          upTo5000: { rate: '1%' },
          from5001to50000: { flat: '50 XAF', rate: '0.5% sur le surplus' },
          above50000: { flat: '275 XAF', rate: '0.3% sur le surplus' },
        },
        MTN: {
          upTo5000: { rate: '1.2%' },
          from5001to50000: { flat: '60 XAF', rate: '0.6% sur le surplus' },
          above50000: { flat: '330 XAF', rate: '0.4% sur le surplus' },
        },
      },
      tax: '2% sur les frais de base',
      currency: 'XAF',
    };
  }
}
