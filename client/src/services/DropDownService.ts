import { apiClient } from "./utils/AxiosInterceptor";


export const GetAllCheckCategories = async () => {
    return await apiClient.get(`checklists/categories`)
}


export const CreateOrEditCheckCategory = async ({ body, id }: {
    body: { key: string }
    id?: string
}) => {
    if (id) {
        return await apiClient.put(`checklists/categories/${id}`, body)
    }
    return await apiClient.post(`checklists/categories`, body)
}
export const DeleteChecklistCategory = async (id: string) => {
    return await apiClient.delete(`checklists/categories/${id}`)
}



export const CreateOrEditCheckList = async ({ body, id }: { body: FormData, id?: string }) => {
    if (id)
        return await apiClient.put(`checklists/${id}`, body);
    return await apiClient.post(`checklists`, body);
};



export const GetChecklists = async ({ limit, page, start_date, end_date, id }: { limit: number | undefined, page: number | undefined, start_date?: string, end_date?: string, id?: string }) => {
    if (id)
        return await apiClient.get(`checklists/?id=${id}&start_date=${start_date}&end_date=${end_date}&limit=${limit}&page=${page}`)
    else
        return await apiClient.get(`checklists/?start_date=${start_date}&end_date=${end_date}&limit=${limit}&page=${page}`)
}



export const ToogleMyCheckLists = async ({ id, remarks }: { id: string, remarks: string }) => {
    return await apiClient.patch(`checklists/toogle/${id}`, { remarks: remarks })
}


export const DeleteCheckList = async (id: string) => {
    return await apiClient.delete(`checklists/${id}`)
}


export const CreateChecklistFromExcel = async (body: FormData) => {
    return await apiClient.put(`create-from-excel/checklists`, body)
}



export const DownloadExcelTemplateForCreateChecklist = async () => {
    return await apiClient.get("download/template/checklists");
};
