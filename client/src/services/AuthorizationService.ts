import { apiClient } from "./utils/AxiosInterceptor"

export class AuthorizationService {
    public async GetAllKeys({ category }: { category: string }) {
        return await apiClient.get(`keys/?category=${category}`)
    }
    public async CreateOrEditKey({ body, id }: {
        body: {
            key: string,
            category: string,
            type: string,
            serial_no: number
        }
        id?: string
    }) {
        if (id) {
            return await apiClient.put(`keys/${id}`, body)
        }
        return await apiClient.post(`keys`, body)
    }
    public async DeleteKey(id: string) {
        return await apiClient.delete(`keys/${id}`)
    }
    public async GetAllKeyCategoriesForDropdown({ show_assigned_only }: { show_assigned_only?: boolean }) {
        if (show_assigned_only)
            return await apiClient.get(`key-category/dropdown/?show_assigned_only=${show_assigned_only}`)
        else
            return await apiClient.get(`key-category/dropdown`)
    }
    public async GetAllKeyCategories() {
        return await apiClient.get(`key-category`)
    }
    public async GetKeyCategoryById(id: string) {
        return await apiClient.get(`key-category/${id}`)
    }
    public async CreateOrEditKeyCategory({ body, id }: {
        body: { key: string, display_name: string, skip_bottom_rows: number }
        id?: string
    }) {
        if (id) {
            return await apiClient.put(`key-category/${id}`, body)
        }
        return await apiClient.post(`key-category`, body)
    }
    public async DeleteKeyCategory(id: string) {
        return await apiClient.delete(`key-category/${id}`)
    }
    public async AssignKeyCategoryToUsers({ body }: {
        body: {
            user_ids: string[],
            categoryids: string[],
            flag: number
        }
    }) {
        return await apiClient.patch(`key-category/assign`, body)
    }
    public async AssignKeysToUsers({ body }: {
        body: {
            user_ids: string[],
            key_ids: string[],
            flag: number
        }
    }) {
        return await apiClient.patch(`keys/assign`, body)
    }
    public async CreateKeysFromExcel(body: FormData) {
        return await apiClient.put(`create-from-excel/keys`, body)
    }
    public async GetAllStates() {
        return await apiClient.get(`crm/states`)
    }
    public async CreateOrEditState({ body, id }: {
        body: {
            state: string,
            alias1: string,
            alias2: string,
        }
        id?: string
    }) {
        if (id) {
            return await apiClient.put(`crm/states/${id}`, body)
        }
        return await apiClient.post(`crm/states`, body)
    }
    public async BulkStateUpdateFromExcel(body: FormData) {
        return await apiClient.put(`/states`, body)
    }
    public async BulkCrmStateUpdateFromExcel(body: FormData) {
        return await apiClient.put(`crm/states/excel/createorupdate`, body)
    }
    //cities
    public async GetAllCRMCitiesForDropDown({ state }: { state?: string }) {
        if (state)
            return await apiClient.get(`dropdown/cities/?state=${state}`)
        return await apiClient.get(`dropdown/cities`)
    }
    public async GetAllCities({ state }: { state?: string }) {
        if (state)
            return await apiClient.get(`crm/cities/?state=${state}`)
        return await apiClient.get(`crm/cities`)
    }

    public async CreateOrEditCity({ body, id }: {
        body: { state: string, city: string }
        id?: string

    }) {
        if (id) {
            return await apiClient.put(`crm/cities/${id}`, body)
        }
        return await apiClient.post(`crm/cities`, body)
    }
    public async BulkCityUpdateFromExcel({ state, body }: { state: string, body: FormData }) {
        return await apiClient.put(`crm/cities/excel/createorupdate/${state}`, body)
    }

    public async AssignCRMStatesToUsers({ body }: {
        body: {
            user_ids: string[],
            state_ids: string[],
            flag: number
        }
    }) {
        return await apiClient.patch(`crm/states/assign`, body)
    }
    public async AssignCRMCitiesToUsers({ body }: {
        body: {
            user_ids: string[],
            city_ids: string[],
            flag: number
        }
    }) {
        return await apiClient.patch(`crm/cities/assign`, body)
    }
    public async FindUnknownCrmSates() {
        return await apiClient.post(`find/crm/states/unknown`)
    }

   

    public async FindUnknownCrmCities() {
        return await apiClient.post(`find/crm/cities/unknown`)
    }

}