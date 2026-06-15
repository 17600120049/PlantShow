import { IsString, IsOptional, IsEnum, IsArray } from 'class-validator';
import { PostType } from '@prisma/client';

export class CreatePostDto {
  @IsString()
  content: string;

  @IsOptional()
  @IsString()
  plantId?: string;

  @IsOptional()
  @IsArray()
  images?: string[];

  @IsEnum(PostType)
  type: PostType;
}
