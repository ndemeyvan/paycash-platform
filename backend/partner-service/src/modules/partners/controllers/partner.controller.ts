import { Controller, Post, Get, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PartnerService } from '../services/partner.service.js';
import { VerifyPartnerDto } from '../dtos/partner.dto.js';
import { Operator } from '../../../types/index.js';

@ApiTags('Partners')
@Controller('partners')
export class PartnerController {
  constructor(private readonly partnerService: PartnerService) {}

  @Post('verify')
  @ApiOperation({
    summary: 'Vérifier un compte Mobile Money',
    description:
      "Vérifie la validité d'un compte Mobile Money auprès de l'opérateur",
  })
  @ApiResponse({ status: 201, description: 'Résultat de la vérification' })
  async verifyAccount(@Body() dto: VerifyPartnerDto) {
    return this.partnerService.verifyAccount(dto.phoneNumber, dto.operator);
  }

  @Get(':operator')
  @ApiOperation({
    summary: "Récupérer les informations d'un partenaire",
    description: 'Retourne les détails de configuration du partenaire',
  })
  @ApiResponse({ status: 200, description: 'Informations du partenaire' })
  @ApiResponse({ status: 404, description: 'Partenaire non trouvé' })
  async getPartnerInfo(@Param('operator') operator: Operator) {
    return await this.partnerService.getPartnerInfo(operator);
  }
}
