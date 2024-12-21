import { CreateOrEditArticleDto } from "../dtos/article.dto";
import { CreateOrEditChecklistRemarkDto, GetChecklistRemarksDto } from "../dtos/checklist-remark.dto";
import { GetCrmCityDto } from "../dtos/crm-city.dto";
import { GetCrmStateDto } from "../dtos/crm-state.dto";
import { CreateOrEditDriverSystemDto } from "../dtos/driver.dto";
import { DropDownDto } from "../dtos/dropdown.dto";
import { CreateOrEditDyeDTo } from "../dtos/dye.dto";
import { CreateOrEditExpenseItemDto } from "../dtos/expense-item.dto";
import { IssueOrAddExpenseItemDto } from "../dtos/expense.dto";
import { CreateOrEditMergeLeadsDto } from "../dtos/lead.dto";
import { CreateOrEditMachineDto } from "../dtos/machine.dto";
import { CreateOrEditPaymentDto } from "../dtos/payment.dto";
import { CreateOrEditProductionDto, GetProductionDto } from "../dtos/production.dto";
import { CreateOrEditMergeRefersDto, GetReferDto } from "../dtos/refer.dto";
import { GetShoeWeightDto } from "../dtos/shoe-weight.dto";
import { CreateOrEditSoleThicknessDto, GetSoleThicknessDto } from "../dtos/sole-thickness.dto";
import { GetSpareDyeDto } from "../dtos/spare-dye.dto";
import { apiClient } from "./utils/AxiosInterceptor";

export class FeatureService {

  public async CreateOrEditProduction({ id, body }: {
    body: CreateOrEditProductionDto, id?: string

  }) {
    if (id)
      return await apiClient.put(`productions/${id}`, body);
    return await apiClient.post(`productions`, body);
  }


  public async GetMyProductions({ date, machine }: { date: string, machine?: string }) {
    if (machine)
      return await apiClient.get(`productions/me/?date=${date}&machine=${machine}`);
    else
      return await apiClient.get(`productions/me/?date=${date}`);
  }

  public async GetProductions({ limit, page, start_date, end_date, id }: { limit: number | undefined, page: number | undefined, start_date?: string, end_date?: string, id?: string }) {
    if (id)
      return await apiClient.get(`productions/?id=${id}&start_date=${start_date}&end_date=${end_date}&limit=${limit}&page=${page}`)
    else
      return await apiClient.get(`productions/?start_date=${start_date}&end_date=${end_date}&limit=${limit}&page=${page}`)

  }

  public async GetproductionMachineWise({ start_date, end_date }: { start_date?: string, end_date?: string }) {
    return await apiClient.get(`production/machinewise/?start_date=${start_date}&end_date=${end_date}`)
  }
  public async GetproductionThekedarWise({ start_date, end_date }: { start_date?: string, end_date?: string }) {
    return await apiClient.get(`production/thekedarwise/?start_date=${start_date}&end_date=${end_date}`)
  }
  public async GetproductioncategoryWise({ start_date, end_date }: { start_date?: string, end_date?: string }) {
    return await apiClient.get(`production/categorywise/?start_date=${start_date}&end_date=${end_date}`)
  }







  public async CreateOrEditShoeWeight({ id, body }: { id?: string, body: FormData }) {
    if (id)
      return await apiClient.put(`weights/${id}`, body);
    return await apiClient.post(`weights`, body);
  }

  public async UpdateShoeWeight2({ id, body }: { id: string, body: FormData }) {
    return await apiClient.put(`weights2/${id}`, body);
  }
  public async UpdateShoeWeight3({ id, body }: { id: string, body: FormData }) {
    return await apiClient.put(`weights3/${id}`, body);
  }
  public async ValidateShoeWeight(id: string) {
    return await apiClient.patch(`weights/validate/${id}`);
  }
  public async DeleteShoeWeight(id: string) {
    return await apiClient.delete(`weights/${id}`);
  }

  public async GetShoeWeights({ limit, page, start_date, end_date, id }: { limit: number | undefined, page: number | undefined, start_date?: string, end_date?: string, id?: string }) {
    if (id)
      return await apiClient.get(`weights/?id=${id}&start_date=${start_date}&end_date=${end_date}&limit=${limit}&page=${page}`)
    else
      return await apiClient.get(`weights/?start_date=${start_date}&end_date=${end_date}&limit=${limit}&page=${page}`)

  }

  public async GetShoeWeightDiffReports({ start_date, end_date }: { start_date?: string, end_date?: string }) {
    return await apiClient.get(`shoeweight/diffreports/?start_date=${start_date}&end_date=${end_date}`)
  }









  public async CreateOrEditSpareDye({ id, body }: { id?: string, body: FormData }) {
    if (id)
      return await apiClient.put(`sparedyes/${id}`, body);
    return await apiClient.post(`sparedyes`, body);
  }

  public async ValidateSpareDye(id: string) {
    return await apiClient.patch(`sparedyes/validate/${id}`);
  }

  public async DeleteSpareDye(id: string) {
    return await apiClient.delete(`sparedyes/${id}`);
  }

  public async GetSpareDyes({ limit, page, start_date, end_date, id }: { limit: number | undefined, page: number | undefined, start_date?: string, end_date?: string, id?: string }) {
    if (id)
      return await apiClient.get(`sparedyes/?id=${id}&start_date=${start_date}&end_date=${end_date}&limit=${limit}&page=${page}`)
    else
      return await apiClient.get(`sparedyes/?start_date=${start_date}&end_date=${end_date}&limit=${limit}&page=${page}`)

  }

  public async GetDyeStatusReport({ start_date, end_date }: { start_date?: string, end_date?: string }) {
    return await apiClient.get(`dyestatus/report/?start_date=${start_date}&end_date=${end_date}`)
  }







  public async CreateOrEditSoleThickness({ id, body }: {
    body: CreateOrEditSoleThicknessDto, id?: string

  }) {
    if (id)
      return await apiClient.put(`solethickness/${id}`, body);
    return await apiClient.post(`solethickness`, body);
  }

  public async DeleteSoleThickness(id: string) {
    return await apiClient.delete(`solethickness/${id}`);
  }

  public async GetSoleThickness({ limit, page, start_date, end_date, id }: { limit: number | undefined, page: number | undefined, start_date?: string, end_date?: string, id?: string }) {
    if (id)
      return await apiClient.get(`solethickness/?id=${id}&start_date=${start_date}&end_date=${end_date}&limit=${limit}&page=${page}`)
    else
      return await apiClient.get(`solethickness/?start_date=${start_date}&end_date=${end_date}&limit=${limit}&page=${page}`)

  }








  public async DeleteProductionItem({ category, spare_dye, weight, thickness, production }: { category?: DropDownDto, weight?: GetShoeWeightDto, thickness?: GetSoleThicknessDto, spare_dye?: GetSpareDyeDto, production?: GetProductionDto }) {
    if (category)
      return await apiClient.delete(`machine/categories/${category.id}`)
    if (weight)
      return await apiClient.delete(`weights/${weight._id}`)
    if (thickness)
      return await apiClient.delete(`solethickness/${thickness._id}`)
    if (spare_dye)
      return await apiClient.delete(`sparedyes/${spare_dye._id}`)
    else
      return await apiClient.delete(`productions/${production ? production._id : ""}`)

  }

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





  public async IssueExpenseItem({ body, id }: { body: IssueOrAddExpenseItemDto, id?: string }) {
    return await apiClient.patch(`issue-expense-items/${id}`, body);
  };
  public async AddExpenseItem({ body, id }: { body: IssueOrAddExpenseItemDto, id?: string }) {
    return await apiClient.patch(`add-expense-items/${id}`, body);

  };



  public async GetExpenseStore() {
    return await apiClient.get('expense-store')
  }
  public async GetAllExpenseTransactions({ start_date, end_date }: { start_date?: string, end_date?: string }) {
    return await apiClient.get(`expense-transactions/?start_date=${start_date}&end_date=${end_date}`)
  }



  public async DownloadExcelTemplateForCreateChecklist() {
    return await apiClient.get("download/template/checklists");
  };



  public async CreateOrEditDriverSystem({ id, body }: { id?: string, body: CreateOrEditDriverSystemDto }) {
    if (id)
      return await apiClient.put(`driver-system/${id}`, body);
    return await apiClient.post(`driver-system`, body);
  }
  public async GetDriverSystems({ limit, page, start_date, end_date, id }: { limit: number | undefined, page: number | undefined, start_date?: string, end_date?: string, id?: string }) {
    if (id)
      return await apiClient.get(`driver-system/?id=${id}&start_date=${start_date}&end_date=${end_date}&limit=${limit}&page=${page}`)
    else
      return await apiClient.get(`driver-system/?start_date=${start_date}&end_date=${end_date}&limit=${limit}&page=${page}`)

  }

  public async DeleteDriverSystem(id: string) {
    return await apiClient.delete(`driver-system/${id}`);
  }



  public async GetChecklistTopBarDetails() {
    return await apiClient.get(`checklists/topbar-details`)
  }




  public async CreateOrEditCheckList({ body, id }: { body: FormData, id?: string }) {
    if (id)
      return await apiClient.put(`checklists/${id}`, body);
    return await apiClient.post(`checklists`, body);
  };



  public async GetChecklists({ limit, page, start_date, end_date, id, stage }: { limit: number | undefined, page: number | undefined, start_date?: string, end_date?: string, id?: string, stage: string }) {
    if (id)
      return await apiClient.get(`checklists/?id=${id}&start_date=${start_date}&end_date=${end_date}&limit=${limit}&page=${page}&stage=${stage}`)
    else
      return await apiClient.get(`checklists/?start_date=${start_date}&end_date=${end_date}&limit=${limit}&page=${page}&stage=${stage}`)
  }
  public async GetChecklistReports({ limit, page, start_date, end_date, id, stage }: { limit: number | undefined, page: number | undefined, start_date?: string, end_date?: string, id?: string, stage: string }) {
    if (id)
      return await apiClient.get(`checklists/report/?id=${id}&start_date=${start_date}&end_date=${end_date}&limit=${limit}&page=${page}&stage=${stage}`)
    else
      return await apiClient.get(`checklists/report/?start_date=${start_date}&end_date=${end_date}&limit=${limit}&page=${page}&stage=${stage}`)
  }
  public async BulkDeleteChecklists(body: { ids: string[] }) {
    return await apiClient.post(`bulk/delete/checklists`, body)
  }


  public async CreateOrEditChecklistRemark({ body, remark }: {
    body: CreateOrEditChecklistRemarkDto,
    remark?: GetChecklistRemarksDto

  }) {
    if (!remark) {
      return await apiClient.post(`checklist/remarks`, body)
    }
    return await apiClient.put(`checklist/remarks/${remark._id}`, body)
  }

  public async DeleteCheckListRemark(id: string) {
    return await apiClient.delete(`checklist/remarks/${id}`)
  }
  public async ChangeChecklistNextDate({ id, next_date }: { id: string, next_date: string }) {
    return await apiClient.patch(`checklists/nextdate/${id}`, { next_date: next_date })
  }

  public async GetCheckListBoxRemarksHistory(id: string) {
    return await apiClient.get(`checklist/remarks/box/${id}`)
  }
  public async GetCheckListRemarksHistory(id: string) {
    return await apiClient.get(`checklist/remarks/${id}`)
  }

  public async DeleteCheckList(id: string) {
    return await apiClient.delete(`checklists/${id}`)
  }


  public async CreateChecklistFromExcel(body: FormData) {
    return await apiClient.put(`create-from-excel/checklists`, body)
  }



  public async AssignChecklistsToUsers({ body }: {
    body: {
      user_ids: string[],
      checklist_ids: string[],
      flag: number
    }
  }) {
    return await apiClient.post(`assign/checklists`, body)
  }
  public async GetAllReferrals({ refer }: { refer: GetReferDto }) {
    return await apiClient.get(`assigned/referrals/${refer._id}`)
  }
}