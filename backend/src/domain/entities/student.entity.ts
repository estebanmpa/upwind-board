export class Student {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  /** ISO date (YYYY-MM-DD). */
  birthDate: string | null;
  weightKg: number | null;
  emergencyContactName: string | null;
  emergencyContactPhone: string | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;

  constructor(props: Student) {
    Object.assign(this, props);
  }
}

export type StudentData = Omit<Student, 'id' | 'createdAt' | 'updatedAt'>;
