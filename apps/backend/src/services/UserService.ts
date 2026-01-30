// UserService: Business logic for users
import { UserDAO } from "../daos/UserDAO";

export class UserService {
  private userDAO: UserDAO;
  constructor(private db: any) {
    this.userDAO = new UserDAO(db);
  }

  async getUserById(id: string) {
    return this.userDAO.getById(id);
  }

  async getUserByEmail(email: string) {
    return this.userDAO.getByEmail(email);
  }

  async getAllUsers() {
    return this.userDAO.getAll();
  }

  async createUser(user: {
    id: string;
    email: string;
    name: string;
    password: string;
    role: string;
  }) {
    return this.userDAO.insert(user);
  }

  async updateUser(
    id: string,
    updates: Partial<{
      email: string;
      name: string;
      password: string;
      role: string;
    }>,
  ) {
    return this.userDAO.update(id, updates);
  }

  async deleteUser(id: string) {
    return this.userDAO.delete(id);
  }
}
