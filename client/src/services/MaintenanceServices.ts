import { apiClient } from "./utils/AxiosInterceptor";


export const GetAllMaintenanceCategory = async () => {
    return await apiClient.get(`maintenances/categories`)
}


export const CreateOrEditMaintenanceCategory = async ({ body, id }: {
    body: { category: string }
    id?: string
}) => {
    if (id) {
        return await apiClient.put(`maintenances/categories/${id}`, body)
    }
    return await apiClient.post(`maintenances/categories`, body)
}


export const ToogleMaintenanceCategory = async (id: string) => {
    return await apiClient.patch(`maintenances/categories/${id}`)
}



export const CreateOrEditMaintenance = async ({ body, id }: { body: FormData, id?: string }) => {
    if (id)
        return await apiClient.put(`maintenances/${id}`, body);
    return await apiClient.post(`maintenances`, body);
};



export const GetAllMaintenance = async ({ limit, page, id }: { limit: number | undefined, page: number | undefined, id?: string }) => {
    if (id)
        return await apiClient.get(`maintenances/?id=${id}&limit=${limit}&page=${page}`)
    else
        return await apiClient.get(`maintenances/?limit=${limit}&page=${page}`)
}

export const GetAllMaintenanceReport = async ({ limit, page, start_date, end_date, id }: { limit: number | undefined, page: number | undefined, start_date?: string, end_date?: string, id?: string }) => {
    if (id)
        return await apiClient.get(`maintenances/?id=${id}&start_date=${start_date}&end_date=${end_date}&limit=${limit}&page=${page}`)
    else
        return await apiClient.get(`maintenances/?start_date=${start_date}&end_date=${end_date}&limit=${limit}&page=${page}`)
}

export const ToogleMaintenanceItem = async ({ id }: { id: string }) => {
    return await apiClient.patch(`maintenances/item/toogle/${id}`)
}
export const AddMaintenanceItemRemark = async ({ id, remarks, stage }: { id: string, remarks: string, stage: string }) => {
    return await apiClient.patch(`maintenances/item/remarks/${id}`, { remark: remarks, stage: stage })
}

export const ViewMaintenanceItemRemarkHistory = async ({ id }: { id: string }) => {
    return await apiClient.get(`maintenances/item/remarks/${id}`)
}
export const ViewMaintenanceItemRemarkHistoryByDates = async ({ id, start_date ,end_date}: { id: string, start_date: string, end_date: string, }) => {
    return await apiClient.get(`maintenances/item/remarks/dates/${id}/?start_date=${start_date}&end_date=${end_date}`)
}

export const DeleteMaintenance = async (id: string) => {
    return await apiClient.delete(`maintenances/${id}`)
}


export const CreateMaintenanceFromExcel = async (body: FormData) => {
    return await apiClient.put(`create-from-excel/maintenances`, body)
}



export const DownloadExcelTemplateForMaintenance = async () => {
    return await apiClient.get("download/template/maintenances");
};
