import { CreateOrEditPartyRemarkDto, CreateOrEditSampleSystemDto, GetPartyRemarkDto, GetSampleSystemDto } from "../dtos/PartyPageDto";
import { CreateOrEditSampleRemarkDto, GetSampleSystemRemarkDto } from "../dtos/RemarkDto";
import { apiClient } from "./utils/AxiosInterceptor";

export class PartyPageService {


  public async GetPartyAgeing1(party: string) {
    return await apiClient.get(`partypage/ageing1/?party=${encodeURIComponent(party)}`)
  }
  public async GetPartyAgeingReport2(party: string) {
    return await apiClient.get(`partypage/ageing2/?party=${encodeURIComponent(party)}`)
  }
  public async GetPartyForcastAndGrowth(party: string) {
    return await apiClient.get(`partypage/forcast-growth/?party=${encodeURIComponent(party)}`)
  }
  public async GetPartyArticleSaleMonthly(party: string) {
    return await apiClient.get(`partypage/sale/?party=${encodeURIComponent(party)}`)
  }
  public async GetStockSellerParties() {
    return await apiClient.get(`stocksellers`)
  }

  public async GetPartyPendingOrders(party: string) {
    return await apiClient.get(`partypage/orders/?party=${encodeURIComponent(party)}`)
  }

  public async GetPartyMobile(party: string) {
    return await apiClient.get(`mobile/?party=${encodeURIComponent(party)}`)
  }
  public async GetCurrentStock() {
    return await apiClient.get(`partypage/stock`)
  }

  public async CreateOrEditPartyRemark({ body, remark }: {
    body: CreateOrEditPartyRemarkDto,
    remark?: GetPartyRemarkDto

  }) {
    if (!remark) {
      return await apiClient.post(`partypage/remarks`, body)
    }
    else
      return await apiClient.put(`partypage/remarks/${remark._id}`, body)
  }
  public async DeletePartyRemark(id: string) {
    return await apiClient.delete(`partypage/remarks/${id}`)
  }
  public async GetPartyLast5Remarks(party: string) {
    return await apiClient.get(`partypage/remarks/?party=${encodeURIComponent(party)}`)
  }
  public async GetPartyList() {
    return await apiClient.get(`partypage/list`)
  }
  public async GetSampleSystems({ start_date, end_date, hidden }: { start_date?: string, end_date?: string, hidden: boolean }) {
    return await apiClient.get(`sample-system/?start_date=${start_date}&end_date=${end_date}&hidden=${hidden}`)
  }
  public async CreateOrEditSampleSystems({ sample, body }: { sample?: GetSampleSystemDto, body: CreateOrEditSampleSystemDto }) {
    if (sample)
      return await apiClient.put(`sample-system/${sample._id}`, body)
    return await apiClient.post(`sample-system/`, body)
  }
  public async DeleteSampleSystem(id: string) {
    return await apiClient.delete(`sample-system/${id}`)
  }

  public async CreateOrEditSampleRemark({ body, remark }: {
    body: CreateOrEditSampleRemarkDto,
    remark?: GetSampleSystemRemarkDto

  }) {
    if (remark)
      return await apiClient.put(`sample-system/remarks/${remark._id}`, body)
    return await apiClient.post(`sample-system/remarks`, body)
  }
  public async DeleteSampleRemark(id: string) {
    return await apiClient.delete(`sample-system/remarks/${id}`)
  }
  public async GetSampleRemarksHistory(id: string) {
    return await apiClient.get(`sample-system/remarks/${id}`)
  }

}

