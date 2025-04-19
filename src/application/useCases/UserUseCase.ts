
import { IUserRepository } from "../Interfaces/IUser";

export class GetAllUsersUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute() {
    const users = await this.userRepository.getAllUsers();
    return users;
  }
}
