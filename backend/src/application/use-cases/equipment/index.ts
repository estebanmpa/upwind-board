import { CreateEquipmentUseCase } from './create-equipment.use-case.js';
import { DeleteEquipmentUseCase } from './delete-equipment.use-case.js';
import { GetEquipmentUseCase } from './get-equipment.use-case.js';
import { ListEquipmentUseCase } from './list-equipment.use-case.js';
import { UpdateEquipmentUseCase } from './update-equipment.use-case.js';

export const EQUIPMENT_USE_CASES = [
  CreateEquipmentUseCase,
  UpdateEquipmentUseCase,
  DeleteEquipmentUseCase,
  GetEquipmentUseCase,
  ListEquipmentUseCase,
];
