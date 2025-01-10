export type GetReferenceDto = {
    party: string;
    gst: string;
    address: string;
    state: string;
    stage:string,
    next_call:string,
    last_remark:string,
    pincode: string;
    business: string;
    [key: string]: string ; // Index signature for dynamic reference columns
};

export type GetReferenceReportForSalesmanDto = {
    _id: string,
    party: string,
    address: string,
    gst: string,
    state: string,
    stage:string,
    status: string,
    last_remark: string
}




export type GetReferenceExcelDto = {
    _id: string,
    date: string,
    gst: string,
    party: string,
    address: string,
    state: string,
    pincode: number,
    business: string,
    sale_scope: number,
    reference: string,
    status?: string
}

