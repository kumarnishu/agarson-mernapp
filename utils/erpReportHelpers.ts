import { IPartyTargetReport } from "../models/erp_reports/partytarget.model";
import { IState } from "../models/erp_reports/state.model";

export function GetMonthlyachievementBystate(reports: IPartyTargetReport[], mont: number) {
    let result = 0;
    if (mont == 0)
        result = Number(reports.reduce((a, b) => { return Number(a) + Number(b.Cur_Jan) }, 0).toFixed())
    else if (mont == 1)
        result = Number(reports.reduce((a, b) => { return Number(a) + Number(b.Cur_Feb) }, 0).toFixed())
    else if (mont == 2)
        result = Number(reports.reduce((a, b) => { return Number(a) + Number(b.Cur_Mar) }, 0).toFixed())
    else if (mont == 3)
        result = Number(reports.reduce((a, b) => { return Number(a) + Number(b.Cur_Apr) }, 0).toFixed())
    else if (mont == 4)
        result = Number(reports.reduce((a, b) => { return Number(a) + Number(b.Cur_May) }, 0).toFixed())
    else if (mont == 5)
        result = Number(reports.reduce((a, b) => { return Number(a) + Number(b.Cur_Jun) }, 0).toFixed())
    else if (mont == 6)
        result = Number(reports.reduce((a, b) => { return Number(a) + Number(b.Cur_Jul) }, 0).toFixed())
    else if (mont == 7)
        result = Number(reports.reduce((a, b) => { return Number(a) + Number(b.Cur_Aug) }, 0).toFixed())
    else if (mont == 8)
        result = Number(reports.reduce((a, b) => { return Number(a) + Number(b.Cur_Sep) }, 0).toFixed())
    else if (mont == 9)
        result = Number(reports.reduce((a, b) => { return Number(a) + Number(b.Cur_Oct) }, 0).toFixed())
    else if (mont == 10)
        result = Number(reports.reduce((a, b) => { return Number(a) + Number(b.Cur_Nov) }, 0).toFixed())
    else if (mont == 11)
        result = Number(reports.reduce((a, b) => { return Number(a) + Number(b.Cur_Dec) }, 0).toFixed())

    return result
}

export function GetMonthlytargetBystate(state:IState, mont: number) {
    let result = 0;
    if (mont == 0)
        result = state.jan
    else if (mont == 1)
         result = state.feb
    else if (mont == 2)
         result = state.mar
    else if (mont == 3)
         result = state.apr
    else if (mont == 4)
         result = state.may
    else if (mont == 5)
         result = state.jun
    else if (mont == 6)
         result = state.jul
    else if (mont == 7)
         result = state.aug
    else if (mont == 8)
         result = state.sep
    else if (mont == 9)
         result = state.oct
    else if (mont == 10)
         result = state.nov
    else if (mont == 11)
         result = state.dec

    return result
}

export function GetYearlyachievementBystate(reports: IPartyTargetReport[]) {
    let result = Number(reports.reduce((a, b) => { return Number(a) + Number(b.Cur_Apr) + Number(b.Cur_May) + Number(b.Cur_Jun) + Number(b.Cur_Jul) + Number(b.Cur_Aug) + Number(b.Cur_Sep) + Number(b.Cur_Oct) + Number(b.Cur_Nov) + Number(b.Cur_Dec) + Number(b.Cur_Jan) + Number(b.Cur_Feb) + Number(b.Cur_Mar) }, 0).toFixed())
    return result
}

export function GetLastYearlyachievementBystate(reports: IPartyTargetReport[]) {
    let result = Number(reports.reduce((a, b) => { return Number(a) + Number(b.Last_Apr) + Number(b.Last_May) + Number(b.Last_Jun) + Number(b.Last_Jul) + Number(b.Last_Aug) + Number(b.Last_Sep) + Number(b.Last_Oct) + Number(b.Last_Nov) + Number(b.Last_Dec) + Number(b.Last_Jan) + Number(b.Last_Feb) + Number(b.Last_Mar) }, 0).toFixed())
    return result
}