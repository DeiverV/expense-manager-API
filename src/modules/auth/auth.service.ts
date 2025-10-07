import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import crypt from 'src/lib/crypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async logIn(username: string, pass: string): Promise<any> {
    const user = await this.usersService.findOne(username);
    if (!user) throw new NotFoundException('User not found');

    const isCorrectPassword = await crypt.isMatchPassword(pass, user.password);
    if (!isCorrectPassword) throw new UnauthorizedException();

    const jwtPayload = {
      sub: user._id,
      username: user.username,
      email: user.email,
    };

    const access_token = await this.jwtService.signAsync(jwtPayload);

    return {
      access_token,
    };
  }
}
