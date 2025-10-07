import { Injectable } from '@nestjs/common';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { Expense } from './schemas/expense.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class ExpensesService {
  constructor(
    @InjectModel(Expense.name) private readonly expensesModel: Model<Expense>,
  ) {}

  async create(createExpenseDto: CreateExpenseDto, userId: string) {
    const createdExpense = new this.expensesModel({
      ...createExpenseDto,
      user: userId,
      date: createExpenseDto.date
        ? new Date(createExpenseDto.date)
        : new Date(),
    });
    return await createdExpense.save();
  }

  async findAll(userId: string) {
    return await this.expensesModel.find({ user: userId }).exec();
  }

  async getExpensesReport(userId: string, startDate: Date, endDate: Date) {
    const expenses = await this.expensesModel.find({
      user: userId,
      date: { $gte: startDate, $lte: endDate },
    });

    const report: Record<
      string,
      {
        totalAmount: number;
        totalExpenses: number;
        avgExpense: number;
      }
    > = {};

    for (const expense of expenses) {
      const category = expense.category;
      const categoryReport = report[category];

      if (!categoryReport) {
        report[category] = {
          totalAmount: expense.amount,
          totalExpenses: 1,
          avgExpense: 0,
        };
        continue;
      }

      report[category] = {
        totalAmount: categoryReport.totalAmount + expense.amount,
        totalExpenses: categoryReport.totalExpenses + 1,
        avgExpense: 0,
      };
    }

    for (const category in report) {
      const categoryReport = report[category];
      categoryReport.avgExpense =
        categoryReport.totalAmount / categoryReport.totalExpenses;
    }

    return report;
  }

  async update(id: string, updateExpenseDto: UpdateExpenseDto) {
    return await this.expensesModel.findByIdAndUpdate(id, updateExpenseDto, {
      new: true,
    });
  }

  async delete(id: string) {
    return await this.expensesModel.findByIdAndDelete(id);
  }
}
