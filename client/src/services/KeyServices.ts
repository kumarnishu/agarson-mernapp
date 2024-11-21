import { apiClient } from "./utils/AxiosInterceptor";

export const GetAllKeys = async ({ category }: { category: string }) => {
    return await apiClient.get(`keys/?category=${category}`)
}


export const CreateOrEditKey = async ({ body, id }: {
    body: {
        key: string,
        category: string,
        type: string,
        serial_no: number
    }
    id?: string
}) => {
    if (id) {
        return await apiClient.put(`keys/${id}`, body)
    }
    return await apiClient.post(`keys`, body)
}
export const DeleteKey = async (id: string) => {
    return await apiClient.delete(`keys/${id}`)
}


export const GetAllKeyCategoriesForDropdown = async ({ show_assigned_only }: { show_assigned_only?: boolean }) => {
    if (show_assigned_only)
        return await apiClient.get(`key-category/dropdown/?show_assigned_only=${show_assigned_only}`)
    else
        return await apiClient.get(`key-category/dropdown`)
}


export const GetAllKeyCategories = async () => {
    return await apiClient.get(`key-category`)
}
export const GetKeyCategoryById = async (id: string) => {
    return await apiClient.get(`key-category/${id}`)
}


export const CreateOrEditKeyCategory = async ({ body, id }: {
    body: { key: string, display_name:string, skip_bottom_rows: number }
    id?: string
}) => {
    if (id) {
        return await apiClient.put(`key-category/${id}`, body)
    }
    return await apiClient.post(`key-category`, body)
}
export const DeleteKeyCategory = async (id: string) => {
    return await apiClient.delete(`key-category/${id}`)
}

export const AssignKeyCategoryToUsers = async ({ body }: {
    body: {
        user_ids: string[],
        categoryids: string[],
        flag: number
    }
}) => {
    return await apiClient.patch(`key-category/assign`, body)
}
export const AssignKeysToUsers = async ({ body }: {
    body: {
        user_ids: string[],
        key_ids: string[],
        flag: number
    }
}) => {
    return await apiClient.patch(`keys/assign`, body)
}
export const CreateKeysFromExcel = async (body: FormData) => {
    return await apiClient.put(`create-from-excel/keys`, body)
}
