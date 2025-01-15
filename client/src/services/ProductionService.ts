
import { CreateOrEditProductionDto, CreateOrEditSoleThicknessDto } from "../dtos/ProductionDto";
import { DropDownDto } from "../dtos/DropDownDto";
import { GetShoeWeightDto, GetSoleThicknessDto, GetSpareDyeDto, GetProductionDto } from "../dtos/ProductionDto";
import { apiClient } from "./utils/AxiosInterceptor";

export class ProductionService {

    public async CreateOrEditProduction({ id, body }: {
        body: CreateOrEditProductionDto, id?: string
    
      }) {
        if (id)
          return await apiClient.put(`productions/${id}`, body);
        return await apiClient.post(`productions`, body);
      }
    
    
      public async GetMyProductions({ date, machine }: { date: string, machine?: string }) {
        if (machine)
          return await apiClient.get(`productions/me/?date=${date}&machine=${machine}`);
        else
          return await apiClient.get(`productions/me/?date=${date}`);
      }
    
      public async GetProductions({  start_date, end_date, id }: {  start_date?: string, end_date?: string, id?: string }) {
        if (id)
          return await apiClient.get(`productions/?id=${id}&start_date=${start_date}&end_date=${end_date}`)
        else
          return await apiClient.get(`productions/?start_date=${start_date}&end_date=${end_date}`)
    
      }
    
      public async GetproductionMachineWise({ start_date, end_date }: { start_date?: string, end_date?: string }) {
        return await apiClient.get(`production/machinewise/?start_date=${start_date}&end_date=${end_date}`)
      }
      public async GetproductionThekedarWise({ start_date, end_date }: { start_date?: string, end_date?: string }) {
        return await apiClient.get(`production/thekedarwise/?start_date=${start_date}&end_date=${end_date}`)
      }
      public async GetproductioncategoryWise({ start_date, end_date }: { start_date?: string, end_date?: string }) {
        return await apiClient.get(`production/categorywise/?start_date=${start_date}&end_date=${end_date}`)
      }
    
    
    
    
    
    
    
      public async CreateOrEditShoeWeight({ id, body }: { id?: string, body: FormData }) {
        if (id)
          return await apiClient.put(`weights/${id}`, body);
        return await apiClient.post(`weights`, body);
      }
    
      public async UpdateShoeWeight2({ id, body }: { id: string, body: FormData }) {
        return await apiClient.put(`weights2/${id}`, body);
      }
      public async UpdateShoeWeight3({ id, body }: { id: string, body: FormData }) {
        return await apiClient.put(`weights3/${id}`, body);
      }
      public async ValidateShoeWeight(id: string) {
        return await apiClient.patch(`weights/validate/${id}`);
      }
      public async DeleteShoeWeight(id: string) {
        return await apiClient.delete(`weights/${id}`);
      }
    
      public async GetShoeWeights({  start_date, end_date, id }: { start_date?: string, end_date?: string, id?: string }) {
        if (id)
          return await apiClient.get(`weights/?id=${id}&start_date=${start_date}&end_date=${end_date}`)
        else
          return await apiClient.get(`weights/?start_date=${start_date}&end_date=${end_date}`)
    
      }
    
      public async GetShoeWeightDiffReports({ start_date, end_date }: { start_date?: string, end_date?: string }) {
        return await apiClient.get(`shoeweight/diffreports/?start_date=${start_date}&end_date=${end_date}`)
      }
    
    
    
    
    
    
    
    
    
      public async CreateOrEditSpareDye({ id, body }: { id?: string, body: FormData }) {
        if (id)
          return await apiClient.put(`sparedyes/${id}`, body);
        return await apiClient.post(`sparedyes`, body);
      }
    
      public async ValidateSpareDye(id: string) {
        return await apiClient.patch(`sparedyes/validate/${id}`);
      }
    
      public async DeleteSpareDye(id: string) {
        return await apiClient.delete(`sparedyes/${id}`);
      }
    
      public async GetSpareDyes({  start_date, end_date, id }: {  start_date?: string, end_date?: string, id?: string }) {
        if (id)
          return await apiClient.get(`sparedyes/?id=${id}&start_date=${start_date}&end_date=${end_date}`)
        else
          return await apiClient.get(`sparedyes/?start_date=${start_date}&end_date=${end_date}`)
    
      }
    
      public async GetDyeStatusReport({ start_date, end_date }: { start_date?: string, end_date?: string }) {
        return await apiClient.get(`dyestatus/report/?start_date=${start_date}&end_date=${end_date}`)
      }
    
    
    
    
    
    
    
      public async CreateOrEditSoleThickness({ id, body }: {
        body: CreateOrEditSoleThicknessDto, id?: string
    
      }) {
        if (id)
          return await apiClient.put(`solethickness/${id}`, body);
        return await apiClient.post(`solethickness`, body);
      }
    
      public async DeleteSoleThickness(id: string) {
        return await apiClient.delete(`solethickness/${id}`);
      }
    
      public async GetSoleThickness({  start_date, end_date, id }: { start_date?: string, end_date?: string, id?: string }) {
        if (id)
          return await apiClient.get(`solethickness/?id=${id}&start_date=${start_date}&end_date=${end_date}`)
        else
          return await apiClient.get(`solethickness/?start_date=${start_date}&end_date=${end_date}`)
    
      }
    
    
    
    
    
    
    
    
      public async DeleteProductionItem({ category, spare_dye, weight, thickness, production }: { category?: DropDownDto, weight?: GetShoeWeightDto, thickness?: GetSoleThicknessDto, spare_dye?: GetSpareDyeDto, production?: GetProductionDto }) {
        if (category)
          return await apiClient.delete(`machine/categories/${category.id}`)
        if (weight)
          return await apiClient.delete(`weights/${weight._id}`)
        if (thickness)
          return await apiClient.delete(`solethickness/${thickness._id}`)
        if (spare_dye)
          return await apiClient.delete(`sparedyes/${spare_dye._id}`)
        else
          return await apiClient.delete(`productions/${production ? production._id : ""}`)
    
      }
    
}

