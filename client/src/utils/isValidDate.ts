export function isvalidDate(d: any) {
    if (Object.prototype.toString.call(d) === "[object Date]") {
        // it is a date
        if (isNaN(d)) { // d.getTime() or d.valueOf() will also work
            return false
        } else {
            return true
        }
    } else {
        return false
    }
}
