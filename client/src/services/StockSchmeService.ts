import { ConsumeStockSchemeDto } from "../dtos/stock.scheme.dto"
import { apiClient } from "./utils/AxiosInterceptor"

export class StockSchmeService {
    public async GetAllConsumedStockSchemes() {
        return await apiClient.get(`consumed/stock`)
    }
    public async ConsumeStockScheme({ body }: {
        body: ConsumeStockSchemeDto,
    }) {
        return await apiClient.post(`consumed/stock`, body)
    }
    public async GetAllStockSchemes() {
        return await apiClient.get(`stock/schemes`)
    }

    public async CreateStockSchemeFromExcel(body: FormData) {
        return await apiClient.post(`stock/schemes`, body)
    }
}
