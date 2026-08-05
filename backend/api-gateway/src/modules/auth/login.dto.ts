import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ description: "Nom d'utilisateur", example: 'admin' })
  @IsString()
  @IsNotEmpty()
  username!: string;

  @ApiProperty({ description: 'Mot de passe', example: 'paycash2024' })
  @IsString()
  @IsNotEmpty()
  password!: string;
}
