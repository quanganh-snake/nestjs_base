import { PartialType } from "@nestjs/mapped-types";
import { CreateRoleDto } from "src/modules/roles/dto/create-role.dto";

export class UpdateRoleDto extends PartialType(CreateRoleDto) { }