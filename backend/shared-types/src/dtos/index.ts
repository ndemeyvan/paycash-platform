import {
  IsString,
  IsNumber,
  Min,
  Max,
  Matches,
  IsEnum,
  IsOptional,
  Length,
  IsNotEmpty,
  IsBoolean,
  IsEmail,
} from 'class-validator';
import {
  Operator,
  TransactionStatus,
  TransactionType,
} from '../interfaces/index.js';

export class InitiateTransactionDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^6\d{8}$/, {
    message: 'Le numéro doit être au format 6XXXXXXXX (ex: 671234567)',
  })
  phoneNumber!: string;

  @IsNumber()
  @Min(100, { message: 'Le montant minimum est de 100 XAF' })
  @Max(1000000, { message: 'Le montant maximum est de 1,000,000 XAF' })
  amount!: number;

  @IsOptional()
  @IsEnum(Operator, { message: 'Opérateur invalide' })
  operator?: Operator;

  @IsString()
  @IsNotEmpty()
  @Length(5, 50)
  reference!: string;

  @IsOptional()
  metadata?: Record<string, unknown>;

  @IsOptional()
  @IsEmail({}, { message: 'Adresse email invalide' })
  email?: string;
}

export class TransactionResponseDto {
  transactionId!: string;
  status!: TransactionStatus;
  signature!: string;
  fees!: number;
  createdAt!: string;
}

export class TransactionStatusDto {
  id!: string;
  status!: TransactionStatus;
  amount!: number;
  phoneNumber!: string;
  fees!: number;
  createdAt!: string;
  updatedAt?: string;
  errorMessage?: string;
}

export class VerifyAccountDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^6\d{8}$/, { message: 'Le numéro doit être au format 6XXXXXXXX' })
  phoneNumber!: string;

  @IsEnum(Operator, { message: 'Opérateur invalide' })
  operator!: Operator;
}

export class CalculateFeeDto {
  @IsNumber()
  @Min(100)
  @Max(1000000)
  amount!: number;

  @IsEnum(Operator)
  operator!: Operator;

  @IsEnum(TransactionType)
  transactionType!: TransactionType;

  @IsBoolean()
  userPaysFees!: boolean;
}

export class FeeResponseDto {
  total!: number;
  baseFee!: number;
  tax!: number;
  rate!: number;
  transactionType!: TransactionType;
  grossAmount!: number;
  netAmount!: number;
}
