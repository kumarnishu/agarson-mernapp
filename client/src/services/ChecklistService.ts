import { CreateOrEditChecklistRemarkDto } from "../dtos/request/ChecklistDto";
import { GetChecklistRemarksDto } from "../dtos/response/ChecklistDto";
import { apiClient } from "./utils/AxiosInterceptor";

export class ChecklistService {

  public async DownloadExcelTemplateForCreateChecklist() {
    return await apiClient.get("download/template/checklists");
  };

  public async GetChecklistTopBarDetails(emp: string) {
    return await apiClient.get(`checklists/topbar-details/?emp=${emp}`)
  }



  public async CreateOrEditCheckList({ body, id }: { body: FormData, id?: string }) {
    if (id)
      return await apiClient.put(`checklists/${id}`, body);
    return await apiClient.post(`checklists`, body);
  };



  public async GetChecklists({ start_date, end_date, id, stage }: { start_date?: string, end_date?: string, id?: string, stage: string }) {
    if (id)
      return await apiClient.get(`checklists/?id=${id}&start_date=${start_date}&end_date=${end_date}&stage=${stage}`)
    else
      return await apiClient.get(`checklists/?start_date=${start_date}&end_date=${end_date}&stage=${stage}`)
  }
  public async GetChecklistReports({ start_date, end_date, id, stage }: { start_date?: string, end_date?: string, id?: string, stage: string }) {
    if (id)
      return await apiClient.get(`checklists/report/?id=${id}&start_date=${start_date}&end_date=${end_date}&stage=${stage}`)
    else
      return await apiClient.get(`checklists/report/?start_date=${start_date}&end_date=${end_date}&stage=${stage}`)
  }
  public async BulkDeleteChecklists(body: { ids: string[] }) {
    return await apiClient.post(`bulk/delete/checklists`, body)
  }

  public async FixChecklistboxes() {
    return await apiClient.post(`checklists/fixboxes`)
  }



  public async CreateChecklistRemarkFromAdmin({ body }: {
    body: CreateOrEditChecklistRemarkDto,
    remark?: GetChecklistRemarksDto

  }) {
    return await apiClient.post(`checklist/remarks-admin`, body)
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


}

