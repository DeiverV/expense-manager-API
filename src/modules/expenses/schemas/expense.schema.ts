import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { User } from '../../users/schema/user.schema';

@Schema()
export class Expense {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  user: User;

  @Prop()
  category: string;

  @Prop({ required: false })
  description: string;

  @Prop()
  amount: number;

  @Prop({ default: new Date() })
  date: Date;
}

export const ExpenseSchema = SchemaFactory.createForClass(Expense);
