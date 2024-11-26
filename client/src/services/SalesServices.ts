import { apiClient } from "./utils/AxiosInterceptor"


export const GetSalesmanVisit = async ({ date }: { date: string }) => {
    return await apiClient.get(`salesman-visit/?date=${date}`)
}

export const GetVisitReports = async ({ employee }: { employee: string }) => {
    return await apiClient.get(`visit-reports/?employee=${employee}`)
}