import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class QueryListDto {
  @IsOptional()
  @IsNotEmpty()
  @IsNumber()
  page: number;

  @IsOptional()
  @IsNotEmpty()
  @IsNumber()
  limit: number;

  @IsOptional()
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsNotEmpty()
  @IsString()
  email: string;
}

export class ParamDto {
  @IsNotEmpty()
  @IsString()
  id: string;
}
