import { CreateOrEditArticleDto } from "../dtos/article.dto";
import { DropDownDto } from "../dtos/dropdown.dto";
import { CreateOrEditDyeDTo } from "../dtos/dye.dto";
import { CreateOrEditMachineDto } from "../dtos/machine.dto";
import { CreateOrEditProductionDto, GetProductionDto } from "../dtos/production.dto";
import { GetShoeWeightDto } from "../dtos/shoe-weight.dto";
import { CreateOrEditSoleThicknessDto, GetSoleThicknessDto } from "../dtos/sole-thickness.dto";
import { GetSpareDyeDto } from "../dtos/spare-dye.dto";
import { apiClient } from "./utils/AxiosInterceptor";


export const CreateMachine = async (body: { name: string, display_name: string, serial_no: number, category: string }) => {
    return await apiClient.post(`machines`, body);
};


export const CreateOrEditMachine = async ({ id, body }: { id?: string, body: CreateOrEditMachineDto }) => {
    if (id)
        return await apiClient.put(`machines/${id}`, body);
    return await apiClient.post(`machines`, body);
};

export const ToogleMachine = async (id: string) => {

    return await apiClient.patch(`machines/toogle/${id}`);
};

export const GetMachines = async (hidden?: string) => {
    if (hidden) {
        return await apiClient.get(`machines?hidden=${hidden}`);
    }
    return await apiClient.get(`machines`);
};
export const GetMachinesForDropdown = async (hidden?: string) => {
    if (hidden) {
        return await apiClient.get(`dropdown/machines?hidden=${hidden}`);
    }
    return await apiClient.get(`dropdown/machines`);
};

export const BulkUploadMachines = async (body: FormData) => {
    return await apiClient.put(`machines/upload/bulk`, body);
}
export const GetMachineCategories = async () => {
    return await apiClient.get(`machine/categories`)
}
export const CreateOrEditMachineCategory = async ({ body, id }: {
    body: { key: string }
    id?: string
}) => {
    if (id) {
        return await apiClient.put(`machine/categories/${id}`, body)
    }
    return await apiClient.post(`machine/categories`, body)
}



export const CreateOrEditDyeLocation = async ({ body, id }: {
    body: {
        name: string,
        display_name: string
    }
    id?: string
}) => {
    if (id) {
        return await apiClient.put(`dye/locations/${id}`, body)
    }
    return await apiClient.post(`dye/locations`, body)
}
export const ToogleDyeLocation = async (id: string) => {
    return await apiClient.patch(`dye/locations/${id}`);
}

export const GetAllDyeLocations = async (hidden?: string) => {
    return await apiClient.get(`dye/locations/?hidden=${hidden}`)
}
export const GetAllDyeLocationsForDropdown = async (hidden?: string) => {
    return await apiClient.get(`dropdown/dye/locations/?hidden=${hidden}`)
}
export const BulkUploadDyes = async (body: FormData) => {
    return await apiClient.put(`dyes/upload/bulk`, body);
}
export const CreateOrEditDye = async ({ body, id }: { body: CreateOrEditDyeDTo, id?: string, }) => {
    if (id)
        return await apiClient.put(`dyes/${id}`, body);
    return await apiClient.post(`dyes`, body);
};

export const GetDyeById = async (id: string) => {
    return await apiClient.get(`dyes/${id}`);
};
export const ToogleDye = async (id: string) => {
    return await apiClient.patch(`dyes/toogle/${id}`);
};

export const GetDyes = async (hidden?: string) => {
    if (hidden)
        return await apiClient.get(`dyes?hidden=${hidden}`);
    else
        return await apiClient.get(`dyes`);
};
export const GetDyesForDropdown = async (hidden?: string) => {
    if (hidden)
        return await apiClient.get(`dropdown/dyes?hidden=${hidden}`);
    else
        return await apiClient.get(`dropdown/dyes`);
};
export const CreateOrEditArticle = async ({ body, id }: { body: CreateOrEditArticleDto, id?: string }) => {
    if (id)
        return await apiClient.put(`articles/${id}`, body);
    return await apiClient.post(`articles`, body);
};

export const ToogleArticle = async (id: string) => {
    return await apiClient.patch(`articles/toogle/${id}`);
};

export const GetArticles = async (hidden?: string) => {
    if (hidden)
        return await apiClient.get(`articles?hidden=${hidden}`);
    else
        return await apiClient.get(`articles`);
};
export const GetArticlesForDropdown = async (hidden?: string) => {
    if (hidden)
        return await apiClient.get(`dropdown/articles?hidden=${hidden}`);
    else
        return await apiClient.get(`dropdown/articles`);
};

export const BulkUploadArticles = async (body: FormData) => {
    return await apiClient.put(`articles/upload/bulk`, body);
}

export const CreateOrEditProduction = async ({ id, body }: {
    body: CreateOrEditProductionDto, id?: string

}) => {
    if (id)
        return await apiClient.put(`productions/${id}`, body);
    return await apiClient.post(`productions`, body);
}


export const GetMyProductions = async ({ date, machine }: { date: string, machine?: string }) => {
    if (machine)
        return await apiClient.get(`productions/me/?date=${date}&machine=${machine}`);
    else
        return await apiClient.get(`productions/me/?date=${date}`);
}

export const GetProductions = async ({ limit, page, start_date, end_date, id }: { limit: number | undefined, page: number | undefined, start_date?: string, end_date?: string, id?: string }) => {
    if (id)
        return await apiClient.get(`productions/?id=${id}&start_date=${start_date}&end_date=${end_date}&limit=${limit}&page=${page}`)
    else
        return await apiClient.get(`productions/?start_date=${start_date}&end_date=${end_date}&limit=${limit}&page=${page}`)

}

export const GetproductionMachineWise = async ({ start_date, end_date }: { start_date?: string, end_date?: string }) => {
    return await apiClient.get(`production/machinewise/?start_date=${start_date}&end_date=${end_date}`)
}
export const GetproductionThekedarWise = async ({ start_date, end_date }: { start_date?: string, end_date?: string }) => {
    return await apiClient.get(`production/thekedarwise/?start_date=${start_date}&end_date=${end_date}`)
}
export const GetproductioncategoryWise = async ({ start_date, end_date }: { start_date?: string, end_date?: string }) => {
    return await apiClient.get(`production/categorywise/?start_date=${start_date}&end_date=${end_date}`)
}







export const CreateOrEditShoeWeight = async ({ id, body }: { id?: string, body: FormData }) => {
    if (id)
        return await apiClient.put(`weights/${id}`, body);
    return await apiClient.post(`weights`, body);
}

export const UpdateShoeWeight2 = async ({ id, body }: { id: string, body: FormData }) => {
    return await apiClient.put(`weights2/${id}`, body);
}
export const UpdateShoeWeight3 = async ({ id, body }: { id: string, body: FormData }) => {
    return await apiClient.put(`weights3/${id}`, body);
}
export const ValidateShoeWeight = async (id: string) => {
    return await apiClient.patch(`weights/validate/${id}`);
}
export const DeleteShoeWeight = async (id: string) => {
    return await apiClient.delete(`weights/${id}`);
}

export const GetShoeWeights = async ({ limit, page, start_date, end_date, id }: { limit: number | undefined, page: number | undefined, start_date?: string, end_date?: string, id?: string }) => {
    if (id)
        return await apiClient.get(`weights/?id=${id}&start_date=${start_date}&end_date=${end_date}&limit=${limit}&page=${page}`)
    else
        return await apiClient.get(`weights/?start_date=${start_date}&end_date=${end_date}&limit=${limit}&page=${page}`)

}

export const GetShoeWeightDiffReports = async ({ start_date, end_date }: { start_date?: string, end_date?: string }) => {
    return await apiClient.get(`shoeweight/diffreports/?start_date=${start_date}&end_date=${end_date}`)
}









export const CreateOrEditSpareDye = async ({ id, body }: { id?: string, body: FormData }) => {
    if (id)
        return await apiClient.put(`sparedyes/${id}`, body);
    return await apiClient.post(`sparedyes`, body);
}

export const ValidateSpareDye = async (id: string) => {
    return await apiClient.patch(`sparedyes/validate/${id}`);
}

export const DeleteSpareDye = async (id: string) => {
    return await apiClient.delete(`sparedyes/${id}`);
}

export const GetSpareDyes = async ({ limit, page, start_date, end_date, id }: { limit: number | undefined, page: number | undefined, start_date?: string, end_date?: string, id?: string }) => {
    if (id)
        return await apiClient.get(`sparedyes/?id=${id}&start_date=${start_date}&end_date=${end_date}&limit=${limit}&page=${page}`)
    else
        return await apiClient.get(`sparedyes/?start_date=${start_date}&end_date=${end_date}&limit=${limit}&page=${page}`)

}

export const GetDyeStatusReport = async ({ start_date, end_date }: { start_date?: string, end_date?: string }) => {
    return await apiClient.get(`dyestatus/report/?start_date=${start_date}&end_date=${end_date}`)
}







export const CreateOrEditSoleThickness = async ({ id, body }: {
    body: CreateOrEditSoleThicknessDto, id?: string

}) => {
    if (id)
        return await apiClient.put(`solethickness/${id}`, body);
    return await apiClient.post(`solethickness`, body);
}

export const DeleteSoleThickness = async (id: string) => {
    return await apiClient.delete(`solethickness/${id}`);
}

export const GetSoleThickness = async ({ limit, page, start_date, end_date, id }: { limit: number | undefined, page: number | undefined, start_date?: string, end_date?: string, id?: string }) => {
    if (id)
        return await apiClient.get(`solethickness/?id=${id}&start_date=${start_date}&end_date=${end_date}&limit=${limit}&page=${page}`)
    else
        return await apiClient.get(`solethickness/?start_date=${start_date}&end_date=${end_date}&limit=${limit}&page=${page}`)

}








export const DeleteProductionItem = async ({ category, spare_dye, weight, thickness, production }: { category?: DropDownDto, weight?: GetShoeWeightDto, thickness?: GetSoleThicknessDto, spare_dye?: GetSpareDyeDto, production?: GetProductionDto }) => {
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
