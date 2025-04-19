// import User from '../../domain/entities/User';

// export interface IUserRepository {
//     findUserById(id: string): Promise<User | null>;
//     findUserByEmail(email: string): Promise<User | null>;
//     updateUser(id: string, userData: Partial<User>): Promise<User | null>;
//     deleteUser(id: string): Promise<boolean>;
//     getAllUsers(): Promise<User[]>;
// }
export interface IUserRepository {
    getAllUsers(): Promise<any[]>; // can be improved by creating a User union type later
  }
  