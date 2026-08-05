import { IsNumber, Min, Max, IsEnum, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Operator, TransactionType } from '../../../types/index.js';

export class CalculateFeeDto {
  @ApiProperty({
    description: 'Montant de la transaction en XAF',
    minimum: 100,
    maximum: 1000000,
    example: 5000,
  })
  @IsNumber()
  @Min(100)
  @Max(1000000)
  amount!: number;

  @ApiProperty({
    description: 'Opérateur Mobile Money',
    enum: Operator,
    example: Operator.ORANGE,
  })
  @IsEnum(Operator)
  operator!: Operator;

  @ApiProperty({
    description: 'Type de transaction',
    enum: TransactionType,
    example: TransactionType.P2P,
  })
  @IsEnum(TransactionType)
  transactionType!: TransactionType;

  @ApiProperty({
    description: "Si l'utilisateur paie les frais",
    example: true,
  })
  @IsBoolean()
  userPaysFees!: boolean;
}
