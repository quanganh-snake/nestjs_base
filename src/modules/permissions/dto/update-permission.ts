import { PartialType } from "@nestjs/mapped-types";
import { CreatePermissionDto } from "src/modules/permissions/dto/create-permission";

export class UpdatePermissionDto extends PartialType(CreatePermissionDto) { }