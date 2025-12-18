import { Customer } from "../../entities/customer"
import { CustomerIdDto } from "../../../common/dtos/customer-id.dto"

export class CustomerIdPresenter {
    static toDTO(customer: Customer): CustomerIdDto {
        const customerIdDto: CustomerIdDto = { id: customer.id }
        return customerIdDto;
    }
}

