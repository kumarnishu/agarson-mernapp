import { DropDownDto } from "../dtos/common/dropdown.dto"
import { CreateOrEditMergeLeadsDto, CreateOrEditMergeRefersDto, GetCrmCityDto, GetCrmStateDto, GetReferDto } from "../dtos/crm/crm.dto"
import { apiClient } from "./utils/AxiosInterceptor"


// login
export const Login = async (
    body: {
        username: string,
        password: string,
        multi_login_token?: string
    }
) => {
    return await apiClient.post("login", body);
};

// signup new organization and owner
export const Signup = async (body: FormData) => {
    return await apiClient.post("signup", body);
};
// new user
export const NewUser = async (body: FormData) => {
    return await apiClient.post("users", body);
};
export const NewCustomer = async (body: FormData) => {
    return await apiClient.post("customers", body);
};
// update user
export const UpdateUser = async ({ id, body }: { id: string, body: FormData }) => {
    return await apiClient.put(`users/${id}`, body);
};

// logout
export const Logout = async () => {
    return await apiClient.post("logout");
};
// get users


export const GetUsers = async ({ hidden, permission, show_assigned_only }: { hidden?: string, show_assigned_only: boolean, permission?: string }) => {
    if (hidden && !permission)
        return await apiClient.get(`users/?hidden=${hidden ? hidden : 'false'}&show_assigned_only=${show_assigned_only}`)
    else if (permission && hidden)
        return await apiClient.get(`users/?permission=${permission}&hidden=${hidden ? hidden : 'false'}&show_assigned_only=${show_assigned_only}`)
    return await apiClient.get(`users`)
}


export const GetPermissions = async () => {
    return await apiClient.get(`permissions`)
}


// block user
export const BlockUser = async (id: string) => {
    return await apiClient.patch(`block/user/${id}`)
}
export const ToogleSHowVisitingCard = async (id: string) => {
    return await apiClient.patch(`tooglevisitingcardleads/user/${id}`)
}


export const ResetMultiLogin = async (id: string) => {
    return await apiClient.patch(`allow/multi_login/${id}`)
}
export const BlockMultiLogin = async (id: string) => {
    return await apiClient.patch(`block/multi_login/${id}`)
}
// unblock user
export const UnBlockUser = async (id: string) => {
    return await apiClient.patch(`unblock/user/${id}`)
}



// make admin
export const MakeAdmin = async (id: string) => {
    return await apiClient.patch(`make-admin/user/${id}`)
}
// revoke permissions of a admin 
export const RemoveAdmin = async (id: string) => {
    return await apiClient.patch(`remove-admin/user/${id}`)
}
// get profile
export const GetProfile = async () => {
    return await apiClient.get("profile");
};
// update profile
export const UpdateProfile = async (body: FormData) => {
    return await apiClient.put("profile", body);
};

// //update password
export const UpdatePassword = async (body: { oldPassword: string, newPassword: string, confirmPassword: string }) => {
    return await apiClient.patch("password/update", body)
};
export const UpdateUserPassword = async ({ id, body }: { id: string, body: { newPassword: string, confirmPassword: string } }) => {
    return await apiClient.patch(`password/reset/${id}`, body)
};
// //update password
export const ResetPassword = async ({ token, body }:
    {
        token: string,
        body: { newPassword: string, confirmPassword: string }
    }) => {
    return await apiClient.patch(`password/reset/${token}`, body)
};

// send reset password
export const ResetPasswordSendMail = async ({ email }:
    {
        email: string
    }) => {
    return await apiClient.post(`password/reset`, { email: email })
};

// verify email
export const VerifyEmail = async (token: string) => {
    return await apiClient.patch(`email/verify/${token}`)
};

// send verification main
export const SendVerifyEmail = async ({ email }:
    {
        email: string
    }) => {
    return await apiClient.post(`email/verify`, { email: email })
};

export const AssignUsers = async ({ id, body }: { id: string, body: { ids: string[] } }) => {
    return await apiClient.patch(`assign/users/${id}`, body)
}

export const AssignPermissionsToOneUser = async ({ body }: {
    body: {
        user_id: string,
        permissions: string[]
    }
}) => {
    return await apiClient.post(`permissions/one`, body)
}



export const AssignPermissionsToUsers = async ({ body }: {
    body: {
        user_ids: string[],
        permissions: string[],
        flag: number
    }
}) => {
    return await apiClient.post(`permissions`, body)
}



//leads
export const GetLeads = async ({ limit, page, stage }: { limit: number | undefined, page: number | undefined, stage?: string }) => {
    return await apiClient.get(`leads/?limit=${limit}&page=${page}&stage=${stage}`)
}

export const GetReminderRemarks = async () => {
    return await apiClient.get(`reminders`)
}

export const BulkDeleteUselessLeads = async (body: { leads_ids: string[] }) => {
    return await apiClient.post(`bulk/leads/delete/useless`, body)
}


export const FindUnknownCrmSates = async () => {
    return await apiClient.post(`find/crm/states/unknown`)
}

export const FindUnknownCrmStages = async () => {
    return await apiClient.post(`find/crm/stages/unknown`)
}

export const FindUnknownCrmCities = async () => {
    return await apiClient.post(`find/crm/cities/unknown`)
}


export const FuzzySearchLeads = async ({ searchString, limit, page, stage }: { searchString?: string, limit: number | undefined, page: number | undefined, stage?: string }) => {
    return await apiClient.get(`search/leads?key=${searchString}&limit=${limit}&page=${page}&stage=${stage}`)
}



export const ConvertLeadToRefer = async ({ id, body }: { id: string, body: { remark: string } }) => {
    return await apiClient.patch(`leads/torefer/${id}`, body)
}

export const GetRemarks = async ({ stage, limit, page, start_date, end_date, id }: { stage: string, limit: number | undefined, page: number | undefined, start_date?: string, end_date?: string, id?: string }) => {
    if (id)
        return await apiClient.get(`activities/?id=${id}&start_date=${start_date}&end_date=${end_date}&limit=${limit}&page=${page}&stage=${stage}`)
    else
        return await apiClient.get(`activities/?start_date=${start_date}&end_date=${end_date}&limit=${limit}&page=${page}&stage=${stage}`)
}

export const GetActivitiesTopBarDeatils = async ({ start_date, end_date, id }: { start_date: string, end_date: string, id?: string }) => {
    if (id) {
        return await apiClient.get(`activities/topbar/?id=${id}&start_date=${start_date}&end_date=${end_date}`)
    }
    return await apiClient.get(`activities/topbar/?start_date=${start_date}&end_date=${end_date}`)

}

export const CreateOrUpdateLead = async ({ id, body }: { body: FormData, id?: string }) => {
    if (id) {
        return await apiClient.put(`leads/${id}`, body)
    }
    return await apiClient.post("leads", body)
}


export const DeleteCrmItem = async ({ refer, lead, state, city, type, source, stage }: { refer?: DropDownDto, lead?: DropDownDto, state?: GetCrmStateDto, city?: GetCrmCityDto, type?: DropDownDto, source?: DropDownDto, stage?: DropDownDto }) => {
    if (refer)
        return await apiClient.delete(`refers/${refer.id}`)
    if (state)
        return await apiClient.delete(`crm/states/${state._id}`)
    if (lead)
        return await apiClient.delete(`leads/${lead.id}`)
    if (source)
        return await apiClient.delete(`crm/sources/${source.id}`)
    if (type)
        return await apiClient.delete(`crm/leadtypes/${type.id}`)
    if (city)
        return await apiClient.delete(`crm/cities/${city._id}`)
    return await apiClient.delete(`crm/stages/${stage ? stage.id : ""}`)

}


export const BulkLeadUpdateFromExcel = async (body: FormData) => {
    return await apiClient.put(`update/leads/bulk`, body)
}
export const MergeTwoLeads = async ({ id, body }: { id: string, body: CreateOrEditMergeLeadsDto }) => {
    return await apiClient.put(`merge/leads/${id}`, body)
}
export const MergeTwoRefers = async ({ id, body }: { id: string, body: CreateOrEditMergeRefersDto }) => {
    return await apiClient.put(`merge/refers/${id}`, body)
}
//remarks


export const CreateOrEditBill = async ({ body, id }: {
    body: FormData,
    id?: string,

}) => {
    if (!id) {
        return await apiClient.post(`bills`, body)
    }
    return await apiClient.put(`bills/${id}`, body)
}
export const CreateOrEditRemark = async ({ body, lead_id, remark_id }: {
    body: {
        remark: string,
        remind_date?: string,
        stage: string,
        has_card: boolean
    },
    lead_id?: string,
    remark_id?: string

}) => {
    if (lead_id) {
        return await apiClient.post(`remarks/${lead_id}`, body)
    }
    return await apiClient.put(`remarks/${remark_id}`, body)
}


export const DeleteRemark = async (id: string) => {
    return await apiClient.delete(`remarks/${id}`)
}
export const DeleteBill = async (id: string) => {
    return await apiClient.delete(`bills/${id}`)
}


//refers
export const GetPaginatedRefers = async ({ limit, page }: { limit: number | undefined, page: number | undefined }) => {
    return await apiClient.get(`refers/paginated/?limit=${limit}&page=${page}`)
}
export const GetRefers = async () => {
    return await apiClient.get(`refers`)
}
export const GetRemarksHistory = async ({ id }: { id: string }) => {
    return await apiClient.get(`remarks/${id}`)
}
export const GetLeadBillHistory = async ({ id }: { id: string }) => {
    return await apiClient.get(`bills/history/leads/${id}`)
}
export const GetReferBillHistory = async ({ id }: { id: string }) => {
    return await apiClient.get(`bills/history/refers/${id}`)
}
export const GetReferRemarksHistory = async ({ id }: { id: string }) => {
    return await apiClient.get(`remarks/refers/${id}`)
}


export const FuzzySearchRefers = async ({ searchString, limit, page }: { searchString?: string, limit: number | undefined, page: number | undefined }) => {
    return await apiClient.get(`search/refers?key=${searchString}&limit=${limit}&page=${page}`)
}


export const CreateOrUpdateRefer = async ({ id, body }: { body: FormData, id?: string }) => {
    if (id) {
        return await apiClient.put(`refers/${id}`, body)
    }
    return await apiClient.post("refers", body)
}




export const BulkReferUpdateFromExcel = async (body: FormData) => {
    return await apiClient.put(`update/refers/bulk`, body)
}

//states

export const GetAllStates = async () => {
    return await apiClient.get(`crm/states`)
}


export const CreateOrEditState = async ({ body, id }: {
    body: { key: string }
    id?: string
}) => {
    if (id) {
        return await apiClient.put(`crm/states/${id}`, body)
    }
    return await apiClient.post(`crm/states`, body)
}



export const BulkStateUpdateFromExcel = async (body: FormData) => {
    return await apiClient.put(`/states`, body)
}

export const BulkCrmStateUpdateFromExcel = async (body: FormData) => {
    return await apiClient.put(`crm/states/excel/createorupdate`, body)
}
//cities
export const GetAllCities = async ({ state }: { state?: string }) => {
    if (state)
        return await apiClient.get(`crm/cities/?state=${state}`)
    return await apiClient.get(`crm/cities`)
}

export const GetAllReferrals = async ({ refer }: { refer: GetReferDto }) => {
    return await apiClient.get(`assigned/referrals/${refer._id}`)
}


export const CreateOrEditCity = async ({ body, id }: {
    body: { state: string, city: string }
    id?: string

}) => {
    if (id) {
        return await apiClient.put(`crm/cities/${id}`, body)
    }
    return await apiClient.post(`crm/cities`, body)
}



export const BulkCityUpdateFromExcel = async ({ state, body }: { state: string, body: FormData }) => {
    return await apiClient.put(`crm/cities/excel/createorupdate/${state}`, body)
}


//stages
export const GetAllStages = async () => {
    return await apiClient.get(`crm/stages`)
}


export const CreateOrEditStage = async ({ body, id }: {
    body: { key: string }
    id?: string
}) => {
    if (id) {
        return await apiClient.put(`crm/stages/${id}`, body)
    }
    return await apiClient.post(`crm/stages`, body)
}


//sources
export const GetAllSources = async () => {
    return await apiClient.get(`crm/sources`)
}


export const CreateOrEditSource = async ({ body, id }: {
    body: { key: string }
    id?: string
}) => {
    if (id) {
        return await apiClient.put(`crm/sources/${id}`, body)
    }
    return await apiClient.post(`crm/sources`, body)
}



//types
export const GetAllLeadTypes = async () => {
    return await apiClient.get(`crm/leadtypes`)
}


export const CreateOrEditLeadType = async ({ body, id }: {
    body: { key: string }
    id?: string
}) => {
    if (id) {
        return await apiClient.put(`crm/leadtypes/${id}`, body)
    }
    return await apiClient.post(`crm/leadtypes`, body)
}


export const ReferLead = async ({ id, body }: { id: string, body: { party_id: string, remark: string, remind_date?: string } }) => {
    return await apiClient.post(`refers/leads/${id}`, body)
}
export const RemoveReferLead = async ({ id, body }: { id: string, body: { remark: string } }) => {
    return await apiClient.patch(`refers/leads/${id}`, body)
}

export const AssignCRMStatesToUsers = async ({ body }: {
    body: {
        user_ids: string[],
        state_ids: string[],
        flag: number
    }
}) => {
    return await apiClient.patch(`crm/states/assign`, body)
}
export const AssignCRMCitiesToUsers = async ({ body }: {
    body: {
        user_ids: string[],
        city_ids: string[],
        flag: number
    }
}) => {
    return await apiClient.patch(`crm/cities/assign`, body)
}

export const GetAssignedRefers = async ({ start_date, end_date }: { start_date?: string, end_date?: string }) => {
    return await apiClient.get(`assigned/refers/report/?start_date=${start_date}&end_date=${end_date}`)
}

export const GetNewRefers = async ({ start_date, end_date }: { start_date?: string, end_date?: string }) => {
    return await apiClient.get(`new/refers/report/?start_date=${start_date}&end_date=${end_date}`)
}
import { apiClient } from "./utils/AxiosInterceptor";


export const GetAllMaintenanceCategory = async () => {
    return await apiClient.get(`maintenances/categories`)
}


export const CreateOrEditMaintenanceCategory = async ({ body, id }: {
    body: { key: string }
    id?: string
}) => {
    if (id) {
        return await apiClient.put(`maintenances/categories/${id}`, body)
    }
    return await apiClient.post(`maintenances/categories`, body)
}


export const ToogleMaintenanceCategory = async (id: string) => {
    return await apiClient.patch(`maintenances/categories/${id}`)
}



export const CreateOrEditMaintenance = async ({ body, id }: { body: FormData, id?: string }) => {
    if (id)
        return await apiClient.put(`maintenances/${id}`, body);
    return await apiClient.post(`maintenances`, body);
};



export const GetAllMaintenance = async ({ limit, page, id }: { limit: number | undefined, page: number | undefined, id?: string }) => {
    if (id)
        return await apiClient.get(`maintenances/?id=${id}&limit=${limit}&page=${page}`)
    else
        return await apiClient.get(`maintenances/?limit=${limit}&page=${page}`)
}

export const GetAllMaintenanceReport = async ({ limit, page, start_date, end_date, id }: { limit: number | undefined, page: number | undefined, start_date?: string, end_date?: string, id?: string }) => {
    if (id)
        return await apiClient.get(`maintenances/report/?id=${id}&start_date=${start_date}&end_date=${end_date}&limit=${limit}&page=${page}`)
    else
        return await apiClient.get(`maintenances/report/?start_date=${start_date}&end_date=${end_date}&limit=${limit}&page=${page}`)
}

export const ToogleMaintenanceItem = async ({ id }: { id: string }) => {
    return await apiClient.patch(`maintenances/item/toogle/${id}`)
}
export const AddMaintenanceItemRemark = async ({ id, remarks, stage }: { id: string, remarks: string, stage: string }) => {
    return await apiClient.post(`maintenances/item/remarks/${id}`, { remark: remarks, stage: stage })
}

export const ViewMaintenanceItemRemarkHistory = async ({ id }: { id: string }) => {
    return await apiClient.get(`maintenances/item/remarks/${id}`)
}
export const ViewMaintenanceItemRemarkHistoryByDates = async ({ id, start_date, end_date }: { id: string, start_date: string, end_date: string, }) => {
    return await apiClient.get(`maintenances/item/remarks/dates/${id}/?start_date=${start_date}&end_date=${end_date}`)
}

export const DeleteMaintenance = async (id: string) => {
    return await apiClient.delete(`maintenances/${id}`)
}


export const CreateMaintenanceFromExcel = async (body: FormData) => {
    return await apiClient.put(`create-from-excel/maintenances`, body)
}



export const DownloadExcelTemplateForMaintenance = async () => {
    return await apiClient.get("download/template/maintenances");
};
import { DropDownDto } from "../dtos/common/dropdown.dto";
import { CreateOrEditArticleDto, CreateOrEditDyeDTo, CreateOrEditMachineDto, CreateOrEditProductionDto, CreateOrEditSoleThicknessDto, GetProductionDto, GetShoeWeightDto, GetSoleThicknessDto, GetSpareDyeDto } from "../dtos/production/production.dto";
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

