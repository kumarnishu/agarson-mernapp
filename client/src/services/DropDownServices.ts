import { CreateOrEditMachineDto, CreateOrEditDyeDTo, CreateOrEditArticleDto } from "../dtos/request/DropDownDto"
import { CreateOrEditExpenseItemDto } from "../dtos/request/ExpenseDto"
import { apiClient } from "./utils/AxiosInterceptor"

export class DropdownService {
  public async GetAllStages() {
    return await apiClient.get(`crm/stages`)
  }
  
  public async CreateOrEditStage({ body, id }: {
    body: { key: string }
    id?: string
  }) {
    if (id) {
      return await apiClient.put(`crm/stages/${id}`, body)
    }
    return await apiClient.post(`crm/stages`, body)
  }
  public async GetAllSources() {
    return await apiClient.get(`crm/sources`)
  }
  public async CreateOrEditSource({ body, id }: {
    body: { key: string }
    id?: string
  }) {
    if (id) {
      return await apiClient.put(`crm/sources/${id}`, body)
    }
    return await apiClient.post(`crm/sources`, body)
  }
  public async GetAllLeadTypes() {
    return await apiClient.get(`crm/leadtypes`)
  }
  public async CreateOrEditLeadType({ body, id }: {
    body: { key: string }
    id?: string
  }) {
    if (id) {
      return await apiClient.put(`crm/leadtypes/${id}`, body)
    }
    return await apiClient.post(`crm/leadtypes`, body)
  }
  public async CreateOrEditPaymentCategory({ body, id }: {
    body: { key: string }
    id?: string
  }) {
    if (id) {
      return await apiClient.put(`payments/categories/${id}`, body)
    }
    return await apiClient.post(`payments/categories`, body)
  }
  public async DeletePaymentsCategory(id: string) {
    return await apiClient.delete(`payments/categories/${id}`)
  }
  
  public async CreateOrEditExpenseItem({ body, id }: { body: CreateOrEditExpenseItemDto, id?: string }) {
    if (id)
      return await apiClient.put(`expense-items/${id}`, body);
    return await apiClient.post(`expense-items`, body);
  };
  public async DeleteExpenseItem(id: string) {
    return await apiClient.delete(`expense-items/${id}`)
  }
  public async GetExpenseItems() {
    return await apiClient.get(`expense-items`)
  }
  public async GetExpenseItemsForDropdown() {
    return await apiClient.get(`dropdown/expense-items`)
  }
  public async CreateExpenseItemFromExcel(body: FormData) {
    return await apiClient.put(`create-from-excel/expense-items`, body)
  }
  public async GetAllExpenseCategories() {
    return await apiClient.get(`expense/categories`)
  }
  public async CreateOrEditExpenseCategory({ body, id }: {
    body: { key: string }
    id?: string
  }) {
    if (id) {
      return await apiClient.put(`expense/categories/${id}`, body)
    }
    return await apiClient.post(`expense/categories`, body)
  }
  public async DeleteExpenseCategory(id: string) {
    return await apiClient.delete(`expense/categories/${id}`)
  }
  public async GetAllExpenseLocations() {
    return await apiClient.get(`expense/locations`)
  }
  public async CreateOrEditExpenseLocation({ body, id }: {
    body: { key: string }
    id?: string
  }) {
    if (id) {
      return await apiClient.put(`expense/locations/${id}`, body)
    }
    return await apiClient.post(`expense/locations`, body)
  }
  public async DeleteExpenseLocation(id: string) {
    return await apiClient.delete(`expense/locations/${id}`)
  }
  public async GetAllItemUnits() {
    return await apiClient.get(`item/unit`)
  }
  public async CreateOrEditItemUnit({ body, id }: {
    body: { key: string }
    id?: string
  }) {
    if (id) {
      return await apiClient.put(`item/unit/${id}`, body)
    }
    return await apiClient.post(`item/unit`, body)
  }
  public async DeleteItemUnit(id: string) {
    return await apiClient.delete(`item/unit/${id}`)
  }
  public async CreateMachine(body: { name: string, display_name: string, serial_no: number, category: string }) {
    return await apiClient.post(`machines`, body);
  };


  public async CreateOrEditMachine({ id, body }: { id?: string, body: CreateOrEditMachineDto }) {
    if (id)
      return await apiClient.put(`machines/${id}`, body);
    return await apiClient.post(`machines`, body);
  };

  public async ToogleMachine(id: string) {

    return await apiClient.patch(`machines/toogle/${id}`);
  };

  public async GetMachines(hidden?: string) {
    if (hidden) {
      return await apiClient.get(`machines?hidden=${hidden}`);
    }
    return await apiClient.get(`machines`);
  };
  public async GetMachinesForDropdown(hidden?: string) {
    if (hidden) {
      return await apiClient.get(`dropdown/machines?hidden=${hidden}`);
    }
    return await apiClient.get(`dropdown/machines`);
  };

  public async BulkUploadMachines(body: FormData) {
    return await apiClient.put(`machines/upload/bulk`, body);
  }
  public async GetMachineCategories() {
    return await apiClient.get(`machine/categories`)
  }
  public async CreateOrEditMachineCategory({ body, id }: {
    body: { key: string }
    id?: string
  }) {
    if (id) {
      return await apiClient.put(`machine/categories/${id}`, body)
    }
    return await apiClient.post(`machine/categories`, body)
  }



  public async CreateOrEditDyeLocation({ body, id }: {
    body: {
      name: string,
      display_name: string
    }
    id?: string
  }) {
    if (id) {
      return await apiClient.put(`dye/locations/${id}`, body)
    }
    return await apiClient.post(`dye/locations`, body)
  }
  public async ToogleDyeLocation(id: string) {
    return await apiClient.patch(`dye/locations/${id}`);
  }

  public async GetAllDyeLocations(hidden?: string) {
    return await apiClient.get(`dye/locations/?hidden=${hidden}`)
  }
  public async GetAllDyeLocationsForDropdown(hidden?: string) {
    return await apiClient.get(`dropdown/dye/locations/?hidden=${hidden}`)
  }
  public async BulkUploadDyes(body: FormData) {
    return await apiClient.put(`dyes/upload/bulk`, body);
  }
  public async CreateOrEditDye({ body, id }: { body: CreateOrEditDyeDTo, id?: string, }) {
    if (id)
      return await apiClient.put(`dyes/${id}`, body);
    return await apiClient.post(`dyes`, body);
  };

  public async GetDyeById(id: string) {
    return await apiClient.get(`dyes/${id}`);
  };
  public async ToogleDye(id: string) {
    return await apiClient.patch(`dyes/toogle/${id}`);
  };

  public async GetDyes(hidden?: string) {
    if (hidden)
      return await apiClient.get(`dyes?hidden=${hidden}`);
    else
      return await apiClient.get(`dyes`);
  };
  public async GetDyesForDropdown(hidden?: string) {
    if (hidden)
      return await apiClient.get(`dropdown/dyes?hidden=${hidden}`);
    else
      return await apiClient.get(`dropdown/dyes`);
  };
  public async CreateOrEditArticle({ body, id }: { body: CreateOrEditArticleDto, id?: string }) {
    if (id)
      return await apiClient.put(`articles/${id}`, body);
    return await apiClient.post(`articles`, body);
  };

  public async ToogleArticle(id: string) {
    return await apiClient.patch(`articles/toogle/${id}`);
  };

  public async GetArticles(hidden?: string) {
    if (hidden)
      return await apiClient.get(`articles?hidden=${hidden}`);
    else
      return await apiClient.get(`articles`);
  };
  public async GetArticlesForDropdown(hidden?: string) {
    if (hidden)
      return await apiClient.get(`dropdown/articles?hidden=${hidden}`);
    else
      return await apiClient.get(`dropdown/articles`);
  };

  public async BulkUploadArticles(body: FormData) {
    return await apiClient.put(`articles/upload/bulk`, body);
  }
  public async GetAllCheckCategories() {
    return await apiClient.get(`checklists/categories`)
  }
  public async CreateOrEditCheckCategory({ body, id }: {
    body: { key: string }
    id?: string
  }) {
    if (id) {
      return await apiClient.put(`checklists/categories/${id}`, body)
    }
    return await apiClient.post(`checklists/categories`, body)
  }
  public async DeleteChecklistCategory(id: string) {
    return await apiClient.delete(`checklists/categories/${id}`)
  }

  public async GetAllPaymentCategories() {
    return await apiClient.get(`payments/categories`)
  }

}