import { Instructor } from '../../src/domain/entities/instructor.entity.js';
import { Student } from '../../src/domain/entities/student.entity.js';

export const instructorFixture = (data: Partial<Instructor> = {}) =>
  new Instructor({
    id: '11111111-1111-4111-8111-111111111111',
    firstName: 'Ana',
    lastName: 'Ríos',
    email: 'ana@example.com',
    phone: '+54 9 11 5555 0000',
    ikoInstructorId: null,
    active: true,
    createdAt: new Date(0),
    updatedAt: new Date(0),
    ...data,
  });

export const studentFixture = (data: Partial<Student> = {}) =>
  new Student({
    id: '22222222-2222-4222-8222-222222222222',
    firstName: 'Juan',
    lastName: 'Pérez',
    email: null,
    phone: '+54 9 11 5555 1111',
    birthDate: null,
    weightKg: null,
    emergencyContactName: 'María Pérez',
    emergencyContactPhone: '+54 9 11 5555 2222',
    notes: null,
    createdAt: new Date(0),
    updatedAt: new Date(0),
    ...data,
  });
