import {
  Injectable,
  BadRequestException,
  NotFoundException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import {
  InitiateTransactionDto,
  TransactionResponseDto,
  TransactionStatusDto,
  TransactionStatus,
  Operator,
  SERVICE_URLS,
  generateTransactionId,
  generateHmacSignature,
  detectOperator,
} from '../../../types/index.js';
import { Transaction } from '../entities/transaction.entity.js';
import { TransactionRepository } from '../repositories/transaction.repository.js';

@Injectable()
export class TransactionService {
  private readonly logger = new Logger(TransactionService.name);

  constructor(
    private readonly transactionRepository: TransactionRepository,
    private readonly httpService: HttpService,
  ) {}

  async initiate(dto: InitiateTransactionDto): Promise<TransactionResponseDto> {
    this.logger.log(`Initiating transaction: ${dto.reference}`);

    const operator = dto.operator || this.resolveOperator(dto.phoneNumber);
    this.logger.debug(`Operator resolved: ${operator}`);

    const isAccountValid = await this.verifyPartnerAccount(
      dto.phoneNumber,
      operator,
    );

    if (!isAccountValid) {
      this.logger.warn(`Invalid Mobile Money account: ${dto.phoneNumber}`);
      throw new BadRequestException('Compte Mobile Money invalide');
    }

    const fees = await this.calculateTransactionFees(dto.amount, operator);

    this.logger.debug(`Fees calculated: ${fees} XAF`);

    const transaction = new Transaction();
    transaction.id = generateTransactionId();
    transaction.phoneNumber = dto.phoneNumber;
    transaction.amount = dto.amount;
    transaction.operator = operator;
    transaction.reference = dto.reference;
    transaction.fees = fees;
    transaction.status = TransactionStatus.PENDING;
    transaction.metadata = dto.metadata || {};
    transaction.createdAt = new Date();

    try {
      await this.transactionRepository.save(transaction);
      this.logger.log(`Transaction saved: ${transaction.id}`);
    } catch (error) {
      this.logger.error(`Failed to save transaction: ${String(error)}`);
      throw new InternalServerErrorException(
        'Erreur lors de la sauvegarde de la transaction',
      );
    }

    const signature = this.buildSignature(transaction);

    this.scheduleProcessing(transaction, dto.email);

    return {
      transactionId: transaction.id,
      status: transaction.status,
      signature,
      fees: transaction.fees,
      createdAt: transaction.createdAt.toISOString(),
    };
  }

  async getStatus(id: string): Promise<TransactionStatusDto> {
    this.logger.log(`Fetching status for transaction: ${id}`);

    const transaction = await this.transactionRepository.findById(id);

    if (!transaction) {
      this.logger.warn(`Transaction not found: ${id}`);
      throw new NotFoundException('Transaction introuvable');
    }

    return {
      id: transaction.id,
      status: transaction.status,
      amount: transaction.amount,
      phoneNumber: transaction.phoneNumber,
      fees: transaction.fees,
      createdAt: transaction.createdAt.toISOString(),
      updatedAt: transaction.updatedAt?.toISOString(),
      errorMessage: transaction.errorMessage,
    };
  }

  async getAll(
    page = 1,
    limit = 10,
  ): Promise<{
    items: TransactionStatusDto[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const { items, total } = await this.transactionRepository.findAllPaginated(
      page,
      limit,
    );

    const mappedItems = items.map((tx) => ({
      id: tx.id,
      status: tx.status,
      amount: tx.amount,
      phoneNumber: tx.phoneNumber,
      fees: tx.fees,
      createdAt: tx.createdAt.toISOString(),
      updatedAt: tx.updatedAt?.toISOString(),
      errorMessage: tx.errorMessage,
    }));

    return {
      items: mappedItems,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getByPhoneNumber(
    phoneNumber: string,
    page = 1,
    limit = 10,
  ): Promise<{
    phoneNumber: string;
    items: TransactionStatusDto[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const { items, total } =
      await this.transactionRepository.findByPhoneNumberPaginated(
        phoneNumber,
        page,
        limit,
      );

    return {
      phoneNumber,
      items: items.map((tx) => ({
        id: tx.id,
        status: tx.status,
        amount: tx.amount,
        phoneNumber: tx.phoneNumber,
        fees: tx.fees,
        createdAt: tx.createdAt.toISOString(),
        updatedAt: tx.updatedAt?.toISOString(),
        errorMessage: tx.errorMessage,
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  private resolveOperator(phoneNumber: string): Operator {
    try {
      return detectOperator(phoneNumber);
    } catch {
      throw new BadRequestException(
        "Impossible de détecter l'opérateur pour ce numéro",
      );
    }
  }

  private async verifyPartnerAccount(
    phoneNumber: string,
    operator: Operator,
  ): Promise<boolean> {
    try {
      const response = await this.httpService.axiosRef.post<{
        data: { isValid: boolean };
      }>(`${SERVICE_URLS.PARTNER_SERVICE}/partners/verify`, {
        phoneNumber,
        operator,
      });
      return response.data.data?.isValid === true;
    } catch (error) {
      this.logger.error(
        `Partner verification failed for ${phoneNumber}: ${String(error)}`,
      );
      return false;
    }
  }

  private async calculateTransactionFees(
    amount: number,
    operator: Operator,
  ): Promise<number> {
    try {
      const response = await this.httpService.axiosRef.post<{
        data: { total: number };
      }>(`${SERVICE_URLS.FEE_SERVICE}/fees/calculate`, {
        amount,
        operator,
        transactionType: 'P2P',
        userPaysFees: true,
      });
      return response.data.data?.total ?? 0;
    } catch (error) {
      this.logger.error(`Fee calculation failed: ${String(error)}`);
      return 0;
    }
  }

  private buildSignature(transaction: Transaction): string {
    const payload = `${transaction.id}:${transaction.amount}:${transaction.phoneNumber}:${transaction.createdAt.getTime()}`;
    return generateHmacSignature(payload);
  }

  private scheduleProcessing(transaction: Transaction, email?: string): void {
    const processingTime = 4000 + Math.random() * 2000;

    this.logger.log(
      `Transaction ${transaction.id} processing in ${Math.round(processingTime / 1000)}s...`,
    );

    setTimeout(() => {
      void (async () => {
        const success = Math.random() < 0.95;
        const newStatus = success
          ? TransactionStatus.SUCCESS
          : TransactionStatus.FAILED;

        await this.transactionRepository.updateStatus(
          transaction.id,
          newStatus,
          success ? undefined : 'Échec du traitement opérateur',
        );

        this.logger.log(`Transaction ${transaction.id} -> ${newStatus}`);

        if (success && email) {
          await this.sendSuccessNotification(email, transaction);
        }
      })();
    }, processingTime);
  }

  private async sendSuccessNotification(
    email: string | undefined,
    transaction: Transaction,
  ): Promise<void> {
    if (!email) return;

    try {
      await this.httpService.axiosRef.post(
        `${SERVICE_URLS.NOTIFICATION_SERVICE}/notifications/email/transaction-success`,
        {
          to: email,
          transactionId: transaction.id,
          amount: transaction.amount,
          phoneNumber: transaction.phoneNumber,
          fees: transaction.fees,
          operator: transaction.operator,
          createdAt: transaction.createdAt.toISOString(),
        },
      );
      this.logger.log(
        `Success notification sent to ${email} for ${transaction.id}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to send success notification: ${String(error)}`,
      );
    }
  }
}
