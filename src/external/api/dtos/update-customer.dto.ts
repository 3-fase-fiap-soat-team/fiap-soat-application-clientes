import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";

export class UpdateCustomerDto {
    @ApiProperty({
    example: 'John Doe',
    required: false,
    })
    @IsOptional()
    @IsString()
    name?: string;

    @ApiProperty({
    example: 'john_doe@email.com',
    required: false,
    })
    @IsOptional()
    @IsString()
    email?: string;

    @ApiProperty({
    example: '123456789',
    required: false,
    })
    @IsOptional()
    @IsString()
    cpf?: string;
}

