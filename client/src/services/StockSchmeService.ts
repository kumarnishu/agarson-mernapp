import { CreateConsumeStockDto } from "../dtos/stock.scheme.dto"
import { apiClient } from "./utils/AxiosInterceptor"

export class StockSchmeService {
    public async GetAllConsumedStocks() {
        return await apiClient.get(`consumed/stock`)
    }
    public async ConsumeStock({ body }: {
        body: CreateConsumeStockDto,
    }) {
        return await apiClient.post(`consumed/stock`, body)
    }
    public async GetAllArticlesStock() {
        return await apiClient.get(`stock/schemes`)
    }

    public async CreateArticleStockFromExcel(body: FormData) {
        return await apiClient.post(`stock/schemes`, body)
    }
}
