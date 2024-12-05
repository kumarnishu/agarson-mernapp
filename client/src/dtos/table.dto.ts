export interface IColumn {
    key: string;
    header: string,
    type: string
}
export interface IRowData {
    [key: string]: any; // Type depends on your data
}

export interface IColumnRowData {
    columns: IColumn[];
    rows: IRowData[];
}