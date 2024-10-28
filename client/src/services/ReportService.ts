import { CreateOrEditErpEmployeeDto, CreateOrEditErpStateDto, GetErpEmployeeDto, GetErpStateDto } from "../dtos/erp reports/erp.reports.dto";
import { apiClient } from "./utils/AxiosInterceptor";


export const GetStates = async () => {
    return await apiClient.get(`states`)
}

export const BulkCreateStateFromExcel = async (body: FormData) => {
    return await apiClient.put(`states`, body)
}
export const CreateOreditErpState = async ({ state, body }: {
    state?: GetErpStateDto | undefined;
    body: CreateOrEditErpStateDto
}) => {
    if (state)
        return await apiClient.put(`states/${state._id}`, body);
    return await apiClient.post(`states`, body);

};

export const GetErpEmployees = async () => {
    return await apiClient.get(`employees`)
}

export const BulkCreateErpEmployeeFromExcel = async (body: FormData) => {
    return await apiClient.put(`employees`, body)
}
export const CreateOreditErpErpEmployee = async ({ employee, body }: {
    employee?: GetErpEmployeeDto | undefined;
    body: CreateOrEditErpEmployeeDto
}) => {
    if (employee)
        return await apiClient.put(`employees/${employee._id}`, body);
    return await apiClient.post(`employees`, body);

};

export const GetPendingOrdersReports = async () => {
    return await apiClient.get(`reports/pending/orders`)
}

export const BulkPendingOrderFromExcel = async (body: FormData) => {
    return await apiClient.put(`reports/pending/orders`, body)
}


export const GetSaleAnalysisReports = async (month: number) => {
    return await apiClient.get(`reports/saleanalysis/${month}`)
}




export const GetBillsAgingReports = async () => {
    return await apiClient.get(`reports/bills/aging`)
}

export const GetVisitReports = async () => {
    return await apiClient.get(`reports/visits`)
}
export const BulkBillsAgingreportFromExcel = async (body: FormData) => {
    return await apiClient.put(`reports/bills/aging`, body)
}

export const BulkVisitreportFromExcel = async (body: FormData) => {
    return await apiClient.put(`reports/visits`, body)
}
export const GetClientSaleReports = async () => {
    return await apiClient.get(`reports/client/sale`);
}

export const BulkClientSalereportFromExcel = async (body: FormData) => {
    return await apiClient.put(`reports/client/sale`, body)
}
export const GetClientSaleReportsForlastyear = async () => {
    return await apiClient.get(`reports/client/sale/lastyear`)
}

export const BulkClientSalereportFromExcelforlastyear = async (body: FormData) => {
    return await apiClient.put(`reports/client/sale/lastyear`, body)
}

export const GetPartyTargetReports = async () => {
    return await apiClient.get(`reports/partytarget`)
}

export const BulkPartyTargetFromExcel = async (body: FormData) => {
    return await apiClient.put(`reports/partytarget`, body)
}


export const AssignErpStatesToUsers = async ({ body }: {
    body: {
        user_ids: string[],
        state_ids: string[],
        flag: number
    }
}) => {
    return await apiClient.patch(`bulk/assign/states`, body)
}


export const AssignErpEmployeesToUsers = async ({ body }: {
    body: {
        user_ids: string[],
        emp_ids: string[],
        flag: number
    }
}) => {
    return await apiClient.patch(`bulk/assign/employees`, body)
}

export const DeleteErpState = async ({ state }: { state: GetErpStateDto }) => {
    return await apiClient.delete(`states/${state._id}`)
}
export const DeleteErpEmployee = async ({ employee }: { employee: GetErpEmployeeDto }) => {
    return await apiClient.delete(`employees/${employee._id}`)
}