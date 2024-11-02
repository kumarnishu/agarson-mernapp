export function getFirstMonday(){
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const daysToMonday = (8 - firstDayOfMonth.getDay()) % 7;

    const firstMonday = new Date(firstDayOfMonth);
    firstMonday.setDate(firstDayOfMonth.getDate() + daysToMonday);
    return firstMonday;

}