export class Student {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string;
  /** ISO date (YYYY-MM-DD). */
  birthDate: string | null;
  weightKg: number | null;
  emergencyContactName: string;
  emergencyContactPhone: string;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;

  constructor(props: Student) {
    Object.assign(this, props);
  }
}

export type StudentData = Omit<Student, 'id' | 'createdAt' | 'updatedAt'>;
