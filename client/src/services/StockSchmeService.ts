import { CreateConsumeStockDto, DiscardConsumptionDto } from "../dtos/request/StockSchemeDto"
import { apiClient } from "./utils/AxiosInterceptor"

export class StockSchmeService {
    public async GetAllConsumedStocks({rejected}:{rejected:boolean}) {
        return await apiClient.get(`consumed/stock/?rejected=${rejected}`)
    }
    public async ConsumeStock({ body }: {
        body: CreateConsumeStockDto,
    }) {
        return await apiClient.post(`consumed/stock`, body)
    }

    public async DiscardStock({ body ,id}: {
        body: DiscardConsumptionDto,id:string
    }) {
        return await apiClient.post(`discard/stock/${id}`, body)
    }
    public async GetAllArticlesStock() {
        return await apiClient.get(`stock/schemes`)
    }

    public async CreateArticleStockFromExcel(body: FormData) {
        return await apiClient.post(`stock/schemes`, body)
    }
}
