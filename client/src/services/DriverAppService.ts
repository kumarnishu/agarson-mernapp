import { apiClient } from "./utils/AxiosInterceptor";

export class DriverAppService {

  public async GetDriverSystems({ start_date, end_date, id }: { start_date?: string, end_date?: string, id?: string }) {
    if (id)
      return await apiClient.get(`driver-system/?id=${id}&start_date=${start_date}&end_date=${end_date}`)
    else
      return await apiClient.get(`driver-system/?start_date=${start_date}&end_date=${end_date}`)

  }

  public async DeleteDriverSystem(id: string) {
    return await apiClient.delete(`driver-system/${id}`);
  }
}

