import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  Request,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { ExpensesService } from './expenses.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';

@Controller('expenses')
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  @Post()
  async create(@Body() createExpenseDto: CreateExpenseDto, @Request() req) {
    return await this.expensesService.create(createExpenseDto, req.user.sub);
  }

  @Get()
  async findAll(@Request() req) {
    return await this.expensesService.findAll(req.user.sub);
  }

  @Get('report')
  async getExpensesReport(
    @Request() req,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    if (!startDate || !endDate)
      throw new BadRequestException('startDate and endDate are required');

    return await this.expensesService.getExpensesReport(
      req.user.sub,
      new Date(startDate),
      new Date(endDate),
    );
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateExpenseDto: UpdateExpenseDto,
  ) {
    return await this.expensesService.update(id, updateExpenseDto);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return await this.expensesService.delete(id);
  }
}
