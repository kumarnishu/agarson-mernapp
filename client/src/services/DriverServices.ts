import { CreateOrEditDriverSystemDto } from "../dtos/driver.dto";
import { apiClient } from "./utils/AxiosInterceptor";

export const CreateOrEditDriverSystem = async ({ id, body }: { id?: string, body: CreateOrEditDriverSystemDto }) => {
    if (id)
        return await apiClient.put(`driver-system/${id}`, body);
    return await apiClient.post(`driver-system`, body);
}
export const GetDriverSystems = async ({ limit, page, start_date, end_date, id }: { limit: number | undefined, page: number | undefined, start_date?: string, end_date?: string, id?: string }) => {
    if (id)
        return await apiClient.get(`driver-system/?id=${id}&start_date=${start_date}&end_date=${end_date}&limit=${limit}&page=${page}`)
    else
        return await apiClient.get(`driver-system/?start_date=${start_date}&end_date=${end_date}&limit=${limit}&page=${page}`)

}

export const DeleteDriverSystem = async (id: string) => {
    return await apiClient.delete(`driver-system/${id}`);
}