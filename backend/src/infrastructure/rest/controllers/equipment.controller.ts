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
import { CreateEquipmentDto } from '../../../application/dtos/equipment/create-equipment.dto.js';
import { EquipmentPageDto } from '../../../application/dtos/equipment/equipment-page.dto.js';
import { ListEquipmentQueryDto } from '../../../application/dtos/equipment/list-equipment-query.dto.js';
import { UpdateEquipmentDto } from '../../../application/dtos/equipment/update-equipment.dto.js';
import { CreateEquipmentUseCase } from '../../../application/use-cases/equipment/create-equipment.use-case.js';
import { DeleteEquipmentUseCase } from '../../../application/use-cases/equipment/delete-equipment.use-case.js';
import { GetEquipmentUseCase } from '../../../application/use-cases/equipment/get-equipment.use-case.js';
import { ListEquipmentUseCase } from '../../../application/use-cases/equipment/list-equipment.use-case.js';
import { UpdateEquipmentUseCase } from '../../../application/use-cases/equipment/update-equipment.use-case.js';
import { Equipment } from '../../../domain/entities/equipment.entity.js';

@ApiTags('equipment')
@Controller('equipment')
export class EquipmentController {
  constructor(
    private readonly createEquipment: CreateEquipmentUseCase,
    private readonly updateEquipment: UpdateEquipmentUseCase,
    private readonly deleteEquipment: DeleteEquipmentUseCase,
    private readonly getEquipment: GetEquipmentUseCase,
    private readonly listEquipment: ListEquipmentUseCase,
  ) {}

  @Get()
  list(@Query() query: ListEquipmentQueryDto): Promise<EquipmentPageDto> {
    return this.listEquipment.execute(
      { search: query.search, type: query.type, status: query.status },
      query.toPageRequest(),
    );
  }

  @Get(':id')
  get(@Param('id', ParseUUIDPipe) id: string): Promise<Equipment> {
    return this.getEquipment.execute(id);
  }

  @Post()
  create(@Body() dto: CreateEquipmentDto): Promise<Equipment> {
    return this.createEquipment.execute(dto);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateEquipmentDto,
  ): Promise<Equipment> {
    return this.updateEquipment.execute(id, dto);
  }

  /** Equipment used in lessons cannot be deleted; retire it instead. */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.deleteEquipment.execute(id);
  }
}
