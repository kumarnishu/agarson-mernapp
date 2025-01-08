import { utils, writeFileXLSX } from "xlsx";

    const wb = utils.book_new();
    sheets.forEach((sheet) => {
        let sh = utils.json_to_sheet(sheet.data)
        utils.book_append_sheet(wb, sh, `${sheet.sheet_name}`);
    })
    writeFileXLSX(wb, `file`);
}
export default function ConvertJsonToExcel(sheets: { sheet_name: string, data: any[] }[]) {
