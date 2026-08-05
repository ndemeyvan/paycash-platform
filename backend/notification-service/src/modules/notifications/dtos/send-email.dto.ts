import { IsString, IsEmail, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SendEmailDto {
  @ApiProperty({
    description: 'Adresse email du destinataire',
    example: 'client@example.com',
  })
  @IsEmail({}, { message: 'Adresse email invalide' })
  to!: string;

  @ApiProperty({
    description: "Sujet de l'email",
    example: 'Confirmation de transaction PayCash',
  })
  @IsString()
  @IsNotEmpty()
  subject!: string;

  @ApiProperty({
    description: "Contenu HTML de l'email",
    example: '<h1>Transaction réussie</h1><p>Montant: 5000 XAF</p>',
  })
  @IsString()
  @IsNotEmpty()
  html!: string;

  @ApiProperty({
    description: 'Identifiant de la transaction (optionnel, pour tracking)',
    required: false,
    example: 'TRX-LWK5G8-K9M2X',
  })
  @IsOptional()
  @IsString()
  transactionId?: string;
}

export class TransactionSuccessEmailDto {
  @ApiProperty({
    description: 'Email du client',
    example: 'client@example.com',
  })
  @IsEmail({}, { message: 'Adresse email invalide' })
  to!: string;

  @ApiProperty({ example: 'TRX-LWK5G8-K9M2X' })
  @IsString()
  @IsNotEmpty()
  transactionId!: string;

  @ApiProperty({ example: 5000 })
  amount!: number;

  @ApiProperty({ example: '671234567' })
  @IsString()
  @IsNotEmpty()
  phoneNumber!: string;

  @ApiProperty({ example: 50 })
  fees!: number;

  @ApiProperty({ example: 'ORANGE' })
  @IsString()
  @IsNotEmpty()
  operator!: string;

  @ApiProperty({ example: '2024-01-15T10:30:00.000Z' })
  @IsString()
  @IsNotEmpty()
  createdAt!: string;
}
