import { apiClient } from "./utils/AxiosInterceptor"


export const GetSalesmanVisit = async ({ date }: { date: string }) => {
    return await apiClient.get(`salesman-visit/?date=${date}`)
}