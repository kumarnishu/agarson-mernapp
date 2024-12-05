import { CreateOrEditPaymentDto } from "../dtos/payment.dto";
import { apiClient } from "./utils/AxiosInterceptor";


export const GetAllPaymentCategories = async () => {
    return await apiClient.get(`payments/categories`)
}

export const GetPaymentsTopBarDetails = async () => {
    return await apiClient.get(`payments/topbar-details`)
}

export const CreateOrEditPaymentCategory = async ({ body, id }: {
    body: { key: string }
    id?: string
}) => {
    if (id) {
        return await apiClient.put(`payments/categories/${id}`, body)
    }
    return await apiClient.post(`payments/categories`, body)
}
export const DeletePaymentsCategory = async (id: string) => {
    return await apiClient.delete(`payments/categories/${id}`)
}

export const CreateOrEditPayment = async ({ body, id }: { body: CreateOrEditPaymentDto, id?: string }) => {
    if (id)
        return await apiClient.put(`payments/${id}`, body);
    return await apiClient.post(`payments`, body);
};



export const GetPaymentss = async ({ limit, page, id, stage }: { limit: number | undefined, page: number | undefined,  id?: string, stage:string }) => {
    if (id)
        return await apiClient.get(`payments/?id=${id}&limit=${limit}&page=${page}&stage=${stage}`)
    else
        return await apiClient.get(`payments/?limit=${limit}&page=${page}&stage=${stage}`)
}
export const GetPaymentsReports = async ({ limit, page,  id, stage }: { limit: number | undefined, page: number | undefined,  id?: string, stage: string }) => {
    if (id)
        return await apiClient.get(`payments/report/?id=${id}&limit=${limit}&page=${page}&stage=${stage}`)
    else
        return await apiClient.get(`payments/report/?limit=${limit}&page=${page}&stage=${stage}`)
}
export const BulkDeletePaymentss = async (body: { ids: string[] }) => {
    return await apiClient.post(`bulk/delete/payments`, body)
}

export const ChangePaymentsNextDate = async ({ id, next_date }: { id: string, next_date: string }) => {
    return await apiClient.patch(`payments/nextdate/${id}`, { next_date: next_date })
}

export const ChangePaymentsDueDate = async ({ id, due_date }: { id: string, due_date: string }) => {
    return await apiClient.patch(`payments/duedate/${id}`, { due_date: due_date })
}

export const DeletePayment = async (id: string) => {
    return await apiClient.delete(`payments/${id}`)
}


export const CreatePaymentsFromExcel = async (body: FormData) => {
    return await apiClient.put(`create-from-excel/payments`, body)
}


export const AssignPaymentssToUsers = async ({ body }: {
    body: {
        user_ids: string[],
        payment_ids: string[],
        flag: number
    }
}) => {
    return await apiClient.post(`assign/payments`, body)
}

export const DownloadExcelTemplateForCreatePayments = async () => {
    return await apiClient.get("download/template/payments");
};
