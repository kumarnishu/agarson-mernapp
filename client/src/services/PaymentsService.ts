import { CreateOrEditPaymentDto } from "../dtos/payment.dto";
import { apiClient } from "./utils/AxiosInterceptor";

export class PaymentsService {

  
    public async GetPaymentsTopBarDetails() {
        return await apiClient.get(`payments/topbar-details`)
      }
    
      public async CreateOrEditPayment({ body, id }: { body: CreateOrEditPaymentDto, id?: string }) {
        if (id)
          return await apiClient.put(`payments/${id}`, body);
        return await apiClient.post(`payments`, body);
      };
    
    
      public async GetPaymentss({ limit, page, id, stage }: { limit: number | undefined, page: number | undefined, id?: string, stage: string }) {
        if (id)
          return await apiClient.get(`payments/?id=${id}&limit=${limit}&page=${page}&stage=${stage}`)
        else
          return await apiClient.get(`payments/?limit=${limit}&page=${page}&stage=${stage}`)
      }
      public async GetPaymentsReports({ limit, page, id, stage }: { limit: number | undefined, page: number | undefined, id?: string, stage: string }) {
        if (id)
          return await apiClient.get(`payments/report/?id=${id}&limit=${limit}&page=${page}&stage=${stage}`)
        else
          return await apiClient.get(`payments/report/?limit=${limit}&page=${page}&stage=${stage}`)
      }
      public async BulkDeletePaymentss(body: { ids: string[] }) {
        return await apiClient.post(`bulk/delete/payments`, body)
      }
    
      public async ChangePaymentsNextDate({ id, next_date }: { id: string, next_date: string }) {
        return await apiClient.patch(`payments/nextdate/${id}`, { next_date: next_date })
      }
    
      public async ChangePaymentsDueDate({ id, due_date }: { id: string, due_date: string }) {
        return await apiClient.patch(`payments/duedate/${id}`, { due_date: due_date })
      }
    
      public async DeletePayment(id: string) {
        return await apiClient.delete(`payments/${id}`)
      }
    
    
      public async CreatePaymentsFromExcel(body: FormData) {
        return await apiClient.put(`create-from-excel/payments`, body)
      }
    
    
      public async AssignPaymentssToUsers({ body }: {
        body: {
          user_ids: string[],
          payment_ids: string[],
          flag: number
        }
      }) {
        return await apiClient.post(`assign/payments`, body)
      }
    
      public async DownloadExcelTemplateForCreatePayments() {
        return await apiClient.get("download/template/payments");
      };
    
}

