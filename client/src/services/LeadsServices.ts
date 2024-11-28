import { DropDownDto } from "../dtos"
import { CreateOrEditMergeLeadsDto, CreateOrEditMergeRefersDto, GetCrmCityDto, GetCrmStateDto, GetReferDto } from "../dtos"
import { apiClient } from "./utils/AxiosInterceptor"

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

export const ToogleReferPartyConversion = async (id: string) => {
  return await apiClient.patch(`toogle-convert/refers/${id}`)
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
  body: {
    state: string,
    alias1: string,
    alias2: string,
  }
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
export const GetAllCRMCitiesForDropDown = async ({ state }: { state?: string }) => {
  if (state)
    return await apiClient.get(`dropdown/cities/?state=${state}`)
  return await apiClient.get(`dropdown/cities`)
}

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
