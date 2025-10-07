import { IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class CreateExpenseDto {
  @IsNotEmpty()
  category: string;

  @IsOptional()
  description: string;

  @IsNotEmpty()
  @IsNumber()
  amount: number;

  @IsOptional()
  date: string;
}
