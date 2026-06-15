import { IsEnum } from 'class-validator';
import { TradeStatus, TradeType } from '@prisma/client';

export class UpdateTradeDto {
  @IsEnum(TradeStatus)
  status: TradeStatus;

  type?: TradeType;
}
