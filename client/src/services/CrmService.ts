import { CreateOrEditMergeLeadsDto, CreateOrEditMergeRefersDto } from "../dtos/request/CrmDto";
import { GetCrmCityDto, GetCrmStateDto } from "../dtos/response/AuthorizationDto";
import { GetReferDto } from "../dtos/response/CrmDto";
import { DropDownDto,  } from "../dtos/response/DropDownDto";
import { apiClient } from "./utils/AxiosInterceptor";

export class CrmService {

  
    public async GetLeads({ limit, page, stage }: { limit: number | undefined, page: number | undefined, stage?: string }) {
        return await apiClient.get(`leads/?limit=${limit}&page=${page}&stage=${stage}`)
      }
    
      public async GetReminderRemarks() {
        return await apiClient.get(`reminders`)
      }
    
      public async BulkDeleteUselessLeads(body: { leads_ids: string[] }) {
        return await apiClient.post(`bulk/leads/delete/useless`, body)
      }
    
    
    
      public async FindUnknownCrmStages() {
        return await apiClient.post(`find/crm/stages/unknown`)
      }
    
    
      public async FuzzySearchLeads({ searchString, limit, page, stage }: { searchString?: string, limit: number | undefined, page: number | undefined, stage?: string }) {
        return await apiClient.get(`search/leads?key=${searchString}&limit=${limit}&page=${page}&stage=${stage}`)
      }
    
    
    
      public async ConvertLeadToRefer({ id, body }: { id: string, body: { remark: string } }) {
        return await apiClient.patch(`leads/torefer/${id}`, body)
      }
    
      public async GetRemarks({ stage, limit, page, start_date, end_date, id }: { stage: string, limit: number | undefined, page: number | undefined, start_date?: string, end_date?: string, id?: string }) {
        if (id)
          return await apiClient.get(`activities/?id=${id}&start_date=${start_date}&end_date=${end_date}&limit=${limit}&page=${page}&stage=${stage}`)
        else
          return await apiClient.get(`activities/?start_date=${start_date}&end_date=${end_date}&limit=${limit}&page=${page}&stage=${stage}`)
      }
    
      public async GetActivitiesTopBarDeatils({ start_date, end_date, id }: { start_date: string, end_date: string, id?: string }) {
        if (id) {
          return await apiClient.get(`activities/topbar/?id=${id}&start_date=${start_date}&end_date=${end_date}`)
        }
        return await apiClient.get(`activities/topbar/?start_date=${start_date}&end_date=${end_date}`)
    
      }
    
      public async CreateOrUpdateLead({ id, body }: { body: FormData, id?: string }) {
        if (id) {
          return await apiClient.put(`leads/${id}`, body)
        }
        return await apiClient.post("leads", body)
      }
    
      public async DeleteCrmItem({ refer, lead, state, city, type, source, stage }: { refer?: DropDownDto, lead?: DropDownDto, state?: GetCrmStateDto, city?: GetCrmCityDto, type?: DropDownDto, source?: DropDownDto, stage?: DropDownDto }) {
        if (refer)
          return await apiClient.delete(`refers/${refer.id}`)
        if (state)
          return await apiClient.delete(`crm/states/${state._id}`)
        if (lead)
          return await apiClient.delete(`leads/${lead.id}`)
        if (source)
          return await apiClient.delete(`crm/sources/${source.id}`)
        if (type)
          return await apiClient.delete(`crm/leadtypes/${type.id}`)
        if (city)
          return await apiClient.delete(`crm/cities/${city._id}`)
        return await apiClient.delete(`crm/stages/${stage ? stage.id : ""}`)
    
      }
      public async BulkLeadUpdateFromExcel(body: FormData) {
        return await apiClient.put(`update/leads/bulk`, body)
      }
      public async MergeTwoLeads({ id, body }: { id: string, body: CreateOrEditMergeLeadsDto }) {
        return await apiClient.put(`merge/leads/${id}`, body)
      }
      public async MergeTwoRefers({ id, body }: { id: string, body: CreateOrEditMergeRefersDto }) {
        return await apiClient.put(`merge/refers/${id}`, body)
      }
    
      public async ToogleReferPartyConversion(id: string) {
        return await apiClient.patch(`toogle-convert/refers/${id}`)
      }
    
      //remarks
    
    
      public async CreateOrEditBill({ body, id }: {
        body: FormData,
        id?: string,
    
      }) {
        if (!id) {
          return await apiClient.post(`bills`, body)
        }
        return await apiClient.put(`bills/${id}`, body)
      }
      public async CreateOrEditRemark({ body, lead_id, remark_id }: {
        body: {
          remark: string,
          remind_date?: string,
          stage: string,
          has_card: boolean
        },
        lead_id?: string,
        remark_id?: string
    
      }) {
        if (lead_id) {
          return await apiClient.post(`remarks/${lead_id}`, body)
        }
        return await apiClient.put(`remarks/${remark_id}`, body)
      }
    
    
      public async DeleteRemark(id: string) {
        return await apiClient.delete(`remarks/${id}`)
      }
      public async DeleteBill(id: string) {
        return await apiClient.delete(`bills/${id}`)
      }
    
    
      //refers
      public async GetPaginatedRefers({ limit, page }: { limit: number | undefined, page: number | undefined }) {
        return await apiClient.get(`refers/paginated/?limit=${limit}&page=${page}`)
      }
      public async GetRefers() {
        return await apiClient.get(`refers`)
      }
      public async GetRemarksHistory({ id }: { id: string }) {
        return await apiClient.get(`remarks/${id}`)
      }
      public async GetLeadBillHistory({ id }: { id: string }) {
        return await apiClient.get(`bills/history/leads/${id}`)
      }
      public async GetReferBillHistory({ id }: { id: string }) {
        return await apiClient.get(`bills/history/refers/${id}`)
      }
      public async GetReferRemarksHistory({ id }: { id: string }) {
        return await apiClient.get(`remarks/refers/${id}`)
      }
      public async FuzzySearchRefers({ searchString, limit, page }: { searchString?: string, limit: number | undefined, page: number | undefined }) {
        return await apiClient.get(`search/refers?key=${searchString}&limit=${limit}&page=${page}`)
      }
      public async CreateOrUpdateRefer({ id, body }: { body: FormData, id?: string }) {
        if (id) {
          return await apiClient.put(`refers/${id}`, body)
        }
        return await apiClient.post("refers", body)
      }
      public async BulkReferUpdateFromExcel(body: FormData) {
        return await apiClient.put(`update/refers/bulk`, body)
      }
      //stages
    
    
      public async ReferLead({ id, body }: { id: string, body: { party_id: string, remark: string, remind_date?: string } }) {
        return await apiClient.post(`refers/leads/${id}`, body)
      }
      public async RemoveReferLead({ id, body }: { id: string, body: { remark: string } }) {
        return await apiClient.patch(`refers/leads/${id}`, body)
      }
    
    
      public async GetAssignedRefers({ start_date, end_date }: { start_date?: string, end_date?: string }) {
        return await apiClient.get(`assigned/refers/report/?start_date=${start_date}&end_date=${end_date}`)
      }
    
      public async GetNewRefers({ start_date, end_date }: { start_date?: string, end_date?: string }) {
        return await apiClient.get(`new/refers/report/?start_date=${start_date}&end_date=${end_date}`)
      }
      public async GetAllReferrals({ refer }: { refer: GetReferDto }) {
        return await apiClient.get(`assigned/referrals/${refer._id}`)
      }
}

