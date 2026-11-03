export enum EquipmentType {
  Kite = 'kite',
  Board = 'board',
  Bar = 'bar',
  Harness = 'harness',
  Wetsuit = 'wetsuit',
  ImpactVest = 'impact_vest',
  Helmet = 'helmet',
  Radio = 'radio',
  Other = 'other',
}

export enum EquipmentStatus {
  /** Ready to be assigned to lessons. */
  Available = 'available',
  /** Temporarily out of service (repairs, inspection...). */
  Maintenance = 'maintenance',
  /** No longer in use; kept for the lesson history. */
  Retired = 'retired',
}

/** A piece of school gear that can be assigned to lessons. */
export class Equipment {
  id: string;
  name: string;
  type: EquipmentType;
  brand: string | null;
  model: string | null;
  /** Free text: "9 m²", "138x41", "M"... */
  size: string | null;
  serialNumber: string | null;
  status: EquipmentStatus;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;

  constructor(props: Equipment) {
    Object.assign(this, props);
  }
}

export type EquipmentData = Omit<Equipment, 'id' | 'createdAt' | 'updatedAt'>;
