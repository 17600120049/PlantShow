import { IsIn, IsInt, IsOptional, IsString } from 'class-validator';

export class AddFavoriteDto {
  @IsIn(['plant', 'station'])
  targetType: 'plant' | 'station';

  @IsOptional()
  @IsString()
  plantId?: string;

  @IsOptional()
  @IsInt()
  stationId?: number;
}

export class RemoveFavoriteDto {
  @IsIn(['plant', 'station'])
  targetType: 'plant' | 'station';

  @IsOptional()
  @IsString()
  plantId?: string;

  @IsOptional()
  @IsInt()
  stationId?: number;
}
