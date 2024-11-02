import moment from "moment";

const currentDate = new Date();

export const previousMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);

// Get next month
export const nextMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);

export const previousYear = new Date(currentDate.getFullYear() - 1, currentDate.getMonth(), currentDate.getDate());
export const currentYear = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());

// Get next year
export const nextYear = new Date(currentDate.getFullYear() + 1, currentDate.getMonth(), currentDate.getDate());



export function dateToExcelFormat(date:any) {
    const excelEpoch = moment('1899-12-30'); // Excel epoch date
    const diffInDays = moment(date).diff(excelEpoch, 'days', true); // Calculate difference in days
    return diffInDays;
}



export function getNextMonday() {
    const today = new Date();
    const nextMonday = new Date(today);
    const daysUntilMonday = (8 - today.getDay()) % 7 || 7;
    nextMonday.setDate(today.getDate() + daysUntilMonday);
    nextMonday.setHours(0, 0, 0, 0)
    return nextMonday;
}
export function getPrevMonday() {
    const nextMonday = new Date(getNextMonday());
    let preMon = new Date(nextMonday);
    preMon.setDate(preMon.getDate() - 7);
    preMon.setHours(0, 0, 0, 0)
    return preMon;
}