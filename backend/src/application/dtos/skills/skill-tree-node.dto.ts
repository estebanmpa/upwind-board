import { ApiProperty } from '@nestjs/swagger';

export class SkillTreeNodeDto {
  id: string;
  parentId: string | null;
  code: string;
  name: string;
  description: string | null;
  sortOrder: number;
  active: boolean;
  /** Leaves are the only nodes evaluated in a student's progression. */
  isLeaf: boolean;

  @ApiProperty({ type: () => [SkillTreeNodeDto] })
  children: SkillTreeNodeDto[];
}
