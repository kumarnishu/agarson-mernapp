import moment from "moment";

const currentDate = new Date();
currentDate.setHours(0, 0, 0, 0)

export const previousMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
export const currentMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
export const nextMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);


export const previousYear = new Date(currentDate.getFullYear() - 1, 1, 1);
export const currentYear = new Date(currentDate.getFullYear(), 1, 1);
export const nextYear = new Date(currentDate.getFullYear() + 1, 1, 1);


export const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);

export const today = new Date();
today.setHours(0, 0, 0, 0);
export const tomorrow = new Date(today);
tomorrow.setDate(today.getDate() + 1);
tomorrow.setHours(0, 0, 0, 0);
export const hundredDaysAgo = new Date(today);
hundredDaysAgo.setDate(today.getDate() - 100);
hundredDaysAgo.setHours(0, 0, 0, 0);

export const prevWeekDate = new Date(today);
prevWeekDate.setDate(today.getDate() - 7);

export function parseExcelDate(dateStr: any) {
    const [day, month, year] = dateStr.split('-');
    return new Date(`${year}-${month}-${day}`);
}

export const invalidate = new Date("1970-01-01T00:00:00.000+00:00")
export function extractDateFromExcel(date: any) {
    return new Date(new Date(Date.UTC(1900, 0, 1)).getTime() + (Number(date) - 2) * 86400000)
}
export function dateToExcelFormat(date: any) {
    const excelEpoch = moment('1899-12-30'); // Excel epoch date
    const diffInDays = moment(date).diff(excelEpoch, 'days', true); // Calculate difference in days
    return diffInDays;
}

export function excelSerialToDate(serial: any) {
    // Excel's base date is January 1, 1900
    const excelBaseDate = new Date(1900, 0, 1); // Month is 0-indexed (0 = January)
    // Add the serial number to the base date (Excel uses 1-based indexing, so we subtract 1)
    const date = new Date(excelBaseDate.setDate(excelBaseDate.getDate() + serial - 2));
    return date;
}

export function getFirstMonday() {
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const daysToMonday = (8 - firstDayOfMonth.getDay()) % 7;

    const firstMonday = new Date(firstDayOfMonth);
    firstMonday.setDate(firstDayOfMonth.getDate() + daysToMonday);
    return firstMonday;

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
export function decimalToTimeForXlsx(decimal: any) {
    // Convert decimal to total hours
    const totalHours = decimal * 24;

    // Get whole hours
    const hours = Math.floor(totalHours);

    // Get minutes from the remaining fraction
    const minutes = Math.round((totalHours - hours) * 60);

    // Format hours and minutes to "HH:MM"
    const formattedTime = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;

    return formattedTime;
}


export function convertDateToExcelFormat(date: any) {
    let str = new Date(excelSerialToDate(date)).toString().split(" ")
    return str[2] + "-" + str[1]
}
export function areDatesEqual(date1: any, date2: any) {
    return date1.getFullYear() === date2.getFullYear() &&
        date1.getMonth() === date2.getMonth() &&
        date1.getDate() === date2.getDate();
}