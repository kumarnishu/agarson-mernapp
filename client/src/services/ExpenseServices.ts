import { CreateOrEditExpenseItemDto, IssueOrAddExpenseItemDto } from "../dtos/expense-item.dto";
import { apiClient } from "./utils/AxiosInterceptor"



export const CreateOrEditExpenseItem = async ({ body, id }: { body: CreateOrEditExpenseItemDto, id?: string }) => {
    if (id)
        return await apiClient.put(`expense-items/${id}`, body);
    return await apiClient.post(`expense-items`, body);
};

export const IssueOrAddExpenseItem = async ({ body, id, val }: { body: IssueOrAddExpenseItemDto, id?: string, val: string }) => {
    if (val == 'issue')
        return await apiClient.put(`issue-expense-items/${id}`, body);
    return await apiClient.put(`add-expense-items/${id}`, body);

};

export const DeleteExpenseItem = async (id: string) => {
    return await apiClient.delete(`expense-items/${id}`)
}

export const GetExpenseItems = async () => {
    return await apiClient.get(`expense-items`)
}


export const GetExpenseItemsForDropdown = async () => {
    return await apiClient.get(`dropdown/expense-items`)
}
export const CreateExpenseItemFromExcel = async (body: FormData) => {
    return await apiClient.put(`create-from-excel/expense-items`, body)
}

export const DownloadExcelTemplateForCreateChecklist = async () => {
    return await apiClient.get("download/template/checklists");
};

export const GetAllExpenseCategories = async () => {
    return await apiClient.get(`expense/categories`)
}

export const CreateOrEditExpenseCategory = async ({ body, id }: {
    body: { key: string }
    id?: string
}) => {
    if (id) {
        return await apiClient.put(`expense/categories/${id}`, body)
    }
    return await apiClient.post(`expense/categories`, body)
}
export const DeleteExpenseCategory = async (id: string) => {
    return await apiClient.delete(`expense/categories/${id}`)
}



export const GetAllExpenseLocations = async () => {
    return await apiClient.get(`expense/locations`)
}

export const CreateOrEditExpenseLocation = async ({ body, id }: {
    body: { key: string }
    id?: string
}) => {
    if (id) {
        return await apiClient.put(`expense/locations/${id}`, body)
    }
    return await apiClient.post(`expense/locations`, body)
}
export const DeleteExpenseLocation = async (id: string) => {
    return await apiClient.delete(`expense/locations/${id}`)
}


export const GetAllItemUnits = async () => {
    return await apiClient.get(`item/unit`)
}


export const CreateOrEditItemUnit = async ({ body, id }: {
    body: { key: string }
    id?: string
}) => {
    if (id) {
        return await apiClient.put(`item/unit/${id}`, body)
    }
    return await apiClient.post(`item/unit`, body)
}
export const DeleteItemUnit = async (id: string) => {
    return await apiClient.delete(`item/unit/${id}`)
}