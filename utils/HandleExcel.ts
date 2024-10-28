import { utils, writeFileXLSX } from "xlsx";


export default function SaveExcelTemplateToDisk(data: any[], guide?: any[]) {
    const wb = utils.book_new();
    const ws = utils.json_to_sheet(data);
    utils.book_append_sheet(wb, ws, "Template");
    if (guide && guide.length > 0) {
        let nn = utils.json_to_sheet(guide)
        utils.book_append_sheet(wb, nn, `Guide`);
    }
    writeFileXLSX(wb, `file`);

}
