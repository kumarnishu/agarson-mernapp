import { CreateOrEditPartyRemarkDto, GetPartyRemarkDto } from "../dtos/PartyPageDto";
import { apiClient } from "./utils/AxiosInterceptor";

export class PartyPageService {

  public async GetPartyLast5Remarks(party: string) {
    return await apiClient.get(`partypage/remarks/?party=${encodeURIComponent(party)}`)
  }
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
  public async GetPartyPendingOrders(party: string) {
    return await apiClient.get(`partypage/orders/?party=${encodeURIComponent(party)}`)
  }
  public async GetCurrentStock(party: string) {
    return await apiClient.get(`partypage/stock/?party=${encodeURIComponent(party)}`)
  }

  public async CreateOrEditPartyRemark({ body, remark }: {
    body: CreateOrEditPartyRemarkDto,
    remark?: GetPartyRemarkDto

  }) {
    if (!remark) {
      return await apiClient.post(`partypage/remarks`, body)
    }
    return await apiClient.put(`partypage/remarks/${remark._id}`, body)
  }
  public async DeleteAgeingRemark(id: string) {
    return await apiClient.delete(`partypage/remarks/${id}`)
  }
  public async GetAgeingRemarksHistory(party: string) {
    return await apiClient.get(`partypage/remarks/?party=${encodeURIComponent(party)}`)
  }
}

