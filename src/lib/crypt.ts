import * as bcrypt from 'bcrypt';

const saltOrRounds = 10;

const hashPassword = async (password: string) =>
  await bcrypt.hash(password, saltOrRounds);

const isMatchPassword = async (password: string, hashedPassword: string) =>
  await bcrypt.compare(password, hashedPassword);

export default { hashPassword, isMatchPassword };
