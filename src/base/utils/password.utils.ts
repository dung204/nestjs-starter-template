export class PasswordUtils {
  public static hashPassword(password: string) {
    return Bun.password.hashSync(password, {
      algorithm: 'bcrypt',
      cost: 12,
    });
  }

  public static isMatchPassword(password: string, hashedPassword: string) {
    return Bun.password.verifySync(password, hashedPassword, 'bcrypt');
  }
}
