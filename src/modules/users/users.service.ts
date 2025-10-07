import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './schema/user.schema';
import { Model } from 'mongoose';
import crypt from 'src/lib/crypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}

  async create(user: User) {
    const existingUser = await this.userModel.findOne({
      username: user.username,
    });
    if (existingUser) throw new Error('User already exists');

    user.password = await crypt.hashPassword(user.password);
    const createdUser = new this.userModel(user);
    return await createdUser.save();
  }

  async findOne(username: string) {
    return await this.userModel.findOne({ username }).exec();
  }
}
