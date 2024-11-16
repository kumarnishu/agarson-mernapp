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
    let str = new Date(date).toString().split(" ")
    return str[2] + "-" + str[1]
}