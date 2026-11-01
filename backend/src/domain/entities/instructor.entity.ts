export class Instructor {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  ikoInstructorId: string | null;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;

  constructor(props: Instructor) {
    Object.assign(this, props);
  }
}

export type InstructorData = Omit<Instructor, 'id' | 'createdAt' | 'updatedAt'>;
