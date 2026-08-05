import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  UseGuards,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { TransactionService } from '../services/transaction.service.js';
import {
  InitiateTransactionDto,
  TransactionResponseDto,
} from '../../../types/index.js';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard.js';

@ApiTags('Transactions')
@Controller('transactions')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Post('initiate')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Initier une transaction de paiement Mobile Money',
    description:
      'Valide le numéro, vérifie le compte partenaire, calcule les frais et initie la transaction',
  })
  @ApiResponse({
    status: 201,
    description: 'Transaction initiée avec succès',
    type: TransactionResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Données de transaction invalides' })
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  @ApiResponse({ status: 502, description: 'Service partenaire indisponible' })
  async initiate(
    @Body() dto: InitiateTransactionDto,
  ): Promise<TransactionResponseDto> {
    return this.transactionService.initiate(dto);
  }

  @Get('phone/:phoneNumber')
  @ApiOperation({
    summary: "Lister les transactions d'un numéro",
    description:
      'Retourne la liste paginée des transactions pour un numéro donné',
  })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  @ApiResponse({ status: 200, description: 'Transactions du numéro' })
  async getByPhoneNumber(
    @Param('phoneNumber') phoneNumber: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNum = Math.max(1, parseInt(page || '1', 10) || 1);
    const limitNum = Math.min(
      100,
      Math.max(1, parseInt(limit || '10', 10) || 10),
    );
    return this.transactionService.getByPhoneNumber(
      phoneNumber,
      pageNum,
      limitNum,
    );
  }

  @Get(':id/status')
  @ApiOperation({
    summary: "Consulter le statut d'une transaction",
    description: 'Retourne le statut actuel et les détails de la transaction',
  })
  @ApiResponse({
    status: 200,
    description: 'Statut récupéré avec succès',
  })
  @ApiResponse({ status: 404, description: 'Transaction non trouvée' })
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  async getStatus(@Param('id') id: string) {
    return this.transactionService.getStatus(id);
  }

  @Get()
  @ApiOperation({
    summary: 'Lister les transactions (paginé)',
    description: 'Retourne la liste paginée des transactions',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    example: 1,
    description: 'Page (défaut: 1)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    example: 10,
    description: 'Éléments par page (défaut: 10, max: 100)',
  })
  @ApiResponse({ status: 200, description: 'Liste paginée des transactions' })
  async getAll(@Query('page') page?: string, @Query('limit') limit?: string) {
    const pageNum = Math.max(1, parseInt(page || '1', 10) || 1);
    const limitNum = Math.min(
      100,
      Math.max(1, parseInt(limit || '10', 10) || 10),
    );
    return this.transactionService.getAll(pageNum, limitNum);
  }
}
