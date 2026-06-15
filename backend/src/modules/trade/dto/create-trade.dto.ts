import { IsString, IsOptional, IsEnum } from 'class-validator';
import { TradeType } from '@prisma/client';

export class CreateTradeDto {
  @IsString()
  plantId: string;

  @IsString()
  receiverId: string;

  @IsEnum(TradeType)
  type: TradeType;

  @IsOptional()
  @IsString()
  offerContent?: string;
}
