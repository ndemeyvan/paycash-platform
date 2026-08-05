import { IsString, IsNotEmpty, Matches, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Operator } from '../../../types/index.js';

export class VerifyPartnerDto {
  @ApiProperty({
    description: 'Numéro de téléphone mobile',
    example: '671234567',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^6\d{8}$/, {
    message: 'Le numéro doit être au format 6XXXXXXXX',
  })
  phoneNumber!: string;

  @ApiProperty({
    description: 'Opérateur Mobile Money',
    enum: Operator,
    example: Operator.ORANGE,
  })
  @IsEnum(Operator, { message: 'Opérateur invalide' })
  operator!: Operator;
}
