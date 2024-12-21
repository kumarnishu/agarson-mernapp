import { CreateOrEditExpenseItemDto } from "../dtos/expense-item.dto"
import { CreateOrEditPaymentDto } from "../dtos/payment.dto"
import { apiClient } from "./utils/AxiosInterceptor"

export class DropdownService {    
    public async GetAllStages() {
        return await apiClient.get(`crm/stages`)
    }
    public async CreateOrEditStage({ body, id }: {
        body: { key: string }
        id?: string
    }) {
        if (id) {
            return await apiClient.put(`crm/stages/${id}`, body)
        }
        return await apiClient.post(`crm/stages`, body)
    }
    public async GetAllSources() {
        return await apiClient.get(`crm/sources`)
    }
    public async CreateOrEditSource({ body, id }: {
        body: { key: string }
        id?: string
    }) {
        if (id) {
            return await apiClient.put(`crm/sources/${id}`, body)
        }
        return await apiClient.post(`crm/sources`, body)
    }
    public async GetAllLeadTypes() {
        return await apiClient.get(`crm/leadtypes`)
    }
    public async CreateOrEditLeadType({ body, id }: {
        body: { key: string }
        id?: string
    }) {
        if (id) {
            return await apiClient.put(`crm/leadtypes/${id}`, body)
        }
        return await apiClient.post(`crm/leadtypes`, body)
    }
    public async CreateOrEditPaymentCategory({ body, id }: {
        body: { key: string }
        id?: string
    }) {
        if (id) {
            return await apiClient.put(`payments/categories/${id}`, body)
        }
        return await apiClient.post(`payments/categories`, body)
    }
    public async DeletePaymentsCategory(id: string) {
        return await apiClient.delete(`payments/categories/${id}`)
    }
    public async CreateOrEditPayment({ body, id }: { body: CreateOrEditPaymentDto, id?: string }) {
        if (id)
            return await apiClient.put(`payments/${id}`, body);
        return await apiClient.post(`payments`, body);
    };
    public async CreateOrEditExpenseItem({ body, id }: { body: CreateOrEditExpenseItemDto, id?: string }) {
        if (id)
            return await apiClient.put(`expense-items/${id}`, body);
        return await apiClient.post(`expense-items`, body);
    };
    public async DeleteExpenseItem(id: string) {
        return await apiClient.delete(`expense-items/${id}`)
    }
    public async GetExpenseItems() {
        return await apiClient.get(`expense-items`)
    }
    public async GetExpenseItemsForDropdown() {
        return await apiClient.get(`dropdown/expense-items`)
    }
    public async CreateExpenseItemFromExcel(body: FormData) {
        return await apiClient.put(`create-from-excel/expense-items`, body)
    }
    public async GetAllExpenseCategories() {
        return await apiClient.get(`expense/categories`)
    }
    public async CreateOrEditExpenseCategory({ body, id }: {
        body: { key: string }
        id?: string
    }) {
        if (id) {
            return await apiClient.put(`expense/categories/${id}`, body)
        }
        return await apiClient.post(`expense/categories`, body)
    }
    public async DeleteExpenseCategory(id: string) {
        return await apiClient.delete(`expense/categories/${id}`)
    }
    public async GetAllExpenseLocations() {
        return await apiClient.get(`expense/locations`)
    }
    public async CreateOrEditExpenseLocation({ body, id }: {
        body: { key: string }
        id?: string
    }) {
        if (id) {
            return await apiClient.put(`expense/locations/${id}`, body)
        }
        return await apiClient.post(`expense/locations`, body)
    }
    public async DeleteExpenseLocation(id: string) {
        return await apiClient.delete(`expense/locations/${id}`)
    }
    public async GetAllItemUnits() {
        return await apiClient.get(`item/unit`)
    }
    public async CreateOrEditItemUnit({ body, id }: {
        body: { key: string }
        id?: string
    }) {
        if (id) {
            return await apiClient.put(`item/unit/${id}`, body)
        }
        return await apiClient.post(`item/unit`, body)
    }
    public async DeleteItemUnit(id: string) {
        return await apiClient.delete(`item/unit/${id}`)
    }
}