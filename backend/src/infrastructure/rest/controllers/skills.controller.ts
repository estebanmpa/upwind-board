import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PaginationQueryDto } from '../../../application/dtos/common/pagination-query.dto.js';
import { CreateSkillDto } from '../../../application/dtos/skills/create-skill.dto.js';
import { SkillPageDto } from '../../../application/dtos/skills/skill-page.dto.js';
import { SkillTreeNodeDto } from '../../../application/dtos/skills/skill-tree-node.dto.js';
import { SkillTreeQueryDto } from '../../../application/dtos/skills/skill-tree-query.dto.js';
import { UpdateSkillDto } from '../../../application/dtos/skills/update-skill.dto.js';
import { CreateSkillUseCase } from '../../../application/use-cases/skills/create-skill.use-case.js';
import { DeleteSkillUseCase } from '../../../application/use-cases/skills/delete-skill.use-case.js';
import { GetSkillTreeUseCase } from '../../../application/use-cases/skills/get-skill-tree.use-case.js';
import { GetSkillUseCase } from '../../../application/use-cases/skills/get-skill.use-case.js';
import { ListSkillsUseCase } from '../../../application/use-cases/skills/list-skills.use-case.js';
import { UpdateSkillUseCase } from '../../../application/use-cases/skills/update-skill.use-case.js';
import { Skill } from '../../../domain/entities/skill.entity.js';

@ApiTags('skills')
@Controller('skills')
export class SkillsController {
  constructor(
    private readonly createSkill: CreateSkillUseCase,
    private readonly updateSkill: UpdateSkillUseCase,
    private readonly deleteSkill: DeleteSkillUseCase,
    private readonly getSkill: GetSkillUseCase,
    private readonly listSkills: ListSkillsUseCase,
    private readonly getSkillTree: GetSkillTreeUseCase,
  ) {}

  /** Full IKO progression tree, siblings ordered by sort_order. */
  @Get('tree')
  tree(@Query() query: SkillTreeQueryDto): Promise<SkillTreeNodeDto[]> {
    return this.getSkillTree.execute({
      includeInactive: query.includeInactive ?? false,
    });
  }

  /** Flat, paginated list ordered by code. */
  @Get()
  list(@Query() query: PaginationQueryDto): Promise<SkillPageDto> {
    return this.listSkills.execute(query.toPageRequest());
  }

  @Get(':id')
  get(@Param('id', ParseUUIDPipe) id: string): Promise<Skill> {
    return this.getSkill.execute(id);
  }

  @Post()
  create(@Body() dto: CreateSkillDto): Promise<Skill> {
    return this.createSkill.execute(dto);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateSkillDto,
  ): Promise<Skill> {
    return this.updateSkill.execute(id, dto);
  }

  /** Only leaves without lesson records can be deleted; deactivate otherwise. */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.deleteSkill.execute(id);
  }
}
