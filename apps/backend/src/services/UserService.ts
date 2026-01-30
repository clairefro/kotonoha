import { UserLoginCredentials, UserPublic } from "shared-types";
import { UserDAO } from "../daos/UserDAO";
import { createId, verifyPassword, hashPassword } from "../utils/db-utils";

export class UserService {
  private userDAO: UserDAO;
  constructor(private db: any) {
    this.userDAO = new UserDAO(db);
  }

  async authenticateUser(
    username: string,
    password: string,
  ): Promise<UserPublic | null> {
    const user = await this.userDAO.getByUsernamePrivate(username);
    if (!user) return null;
    const match = await verifyPassword(password, user.password_hash);
    if (!match) return null;
    // Remove password_hash before returning
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password_hash, ...publicUser } = user;
    return publicUser;
  }

  async getUserById(id: string) {
    return this.userDAO.getById(id);
  }

  async getUserByUsername(username: string) {
    return this.userDAO.getByUsernamePublic(username);
  }

  async getAllUsers() {
    return this.userDAO.getAll();
  }

  async createUser(user: UserLoginCredentials & { is_admin?: boolean }) {
    const id = createId.user();
    const is_admin = !!user.is_admin;
    const password_hash = await hashPassword(user.password);
    // Remove plaintext password before passing to DAO
    const { password, ...rest } = user;
    return this.userDAO.insert({
      ...rest,
      id,
      password_hash,
      is_admin,
    });
  }

  async updateUser(
    id: string,
    updates: Partial<{
      username: string;
      password: string;
    }>,
  ) {
    return this.userDAO.update(id, updates);
  }

  async deleteUser(id: string) {
    return this.userDAO.delete(id);
  }
}
