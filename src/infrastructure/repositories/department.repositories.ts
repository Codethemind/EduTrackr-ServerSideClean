import { IDepartmentsCollection } from '../../application/Interfaces/IDepartmentsCollection';
import DepartmentsCollection from '../models/DepartmentModel';

export class DepartmentRepository {
  async create(departmentData: Partial<IDepartmentsCollection>): Promise<IDepartmentsCollection> {
    return await DepartmentsCollection.create(departmentData);
  }

  async findAll(): Promise<IDepartmentsCollection[]> {
    return await DepartmentsCollection.find();
  }

  async findById(id: string): Promise<IDepartmentsCollection | null> {
    return await DepartmentsCollection.findById(id);
  }

  async updateById(id: string, departmentData: Partial<IDepartmentsCollection>): Promise<IDepartmentsCollection | null> {
    return await DepartmentsCollection.findByIdAndUpdate(id, departmentData, { new: true });
  }

  async deleteById(id: string): Promise<IDepartmentsCollection | null> {
    return await DepartmentsCollection.findByIdAndDelete(id);
  }

  async findPaginated(page: number, limit: number): Promise<IDepartmentsCollection[]> {
    const skip = (page - 1) * limit;
    return await DepartmentsCollection.find().skip(skip).limit(limit);
  }

  async count(): Promise<number> {
    return await DepartmentsCollection.countDocuments();
  }

  async findByCode(code: string): Promise<IDepartmentsCollection | null> {
    return await DepartmentsCollection.findOne({ Code: code });
  }
} 