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
}

