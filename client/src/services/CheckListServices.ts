import { CreateOrEditChecklistRemarkDto, GetChecklistRemarksDto } from "../dtos";
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



export const GetChecklists = async ({ limit, page, start_date, end_date, id, hidden }: { limit: number | undefined, page: number | undefined, start_date?: string, end_date?: string, id?: string, hidden?:string }) => {
    if (id)
        return await apiClient.get(`checklists/?id=${id}&start_date=${start_date}&end_date=${end_date}&limit=${limit}&page=${page}&hidden=${hidden}`)
    else
        return await apiClient.get(`checklists/?start_date=${start_date}&end_date=${end_date}&limit=${limit}&page=${page}&hidden=${hidden}`)
}
export const GetChecklistReports = async ({ limit, page, start_date, end_date, id, hidden }: { limit: number | undefined, page: number | undefined, start_date?: string, end_date?: string, id?: string, hidden?: string }) => {
    if (id)
        return await apiClient.get(`checklists/report/?id=${id}&start_date=${start_date}&end_date=${end_date}&limit=${limit}&page=${page}&hidden=${hidden}`)
    else
        return await apiClient.get(`checklists/report/?start_date=${start_date}&end_date=${end_date}&limit=${limit}&page=${page}&hidden=${hidden}`)
}


export const CreateOrEditChecklistRemark = async ({ body, remark }: {
    body: CreateOrEditChecklistRemarkDto,
    remark?: GetChecklistRemarksDto

}) => {
    if (!remark) {
        return await apiClient.post(`checklist/remarks`, body)
    }
    return await apiClient.put(`checklist/remarks/${remark._id}`, body)
}

export const DeleteCheckListRemark = async (id: string) => {
    return await apiClient.delete(`checklist/remarks/${id}`)
}
export const ChangeChecklistNextDate = async ({ id, next_date }: { id: string, next_date: string }) => {
    return await apiClient.patch(`checklists/nextdate/${id}`, { next_date: next_date })
}

export const GetCheckListRemarksHistory = async (id: string) => {
    return await apiClient.get(`checklist/remarks/${id}`)
}

export const DeleteCheckList = async (id: string) => {
    return await apiClient.delete(`checklists/${id}`)
}


export const CreateChecklistFromExcel = async (body: FormData) => {
    return await apiClient.put(`create-from-excel/checklists`, body)
}


export const AssignChecklistsToUsers = async ({ body }: {
    body: {
        user_ids: string[],
        checklist_ids: string[],
        flag: number
    }
}) => {
    return await apiClient.post(`assign/checklists`, body)
}

export const DownloadExcelTemplateForCreateChecklist = async () => {
    return await apiClient.get("download/template/checklists");
};
