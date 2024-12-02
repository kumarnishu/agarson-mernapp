export function isDecimal(num:number) {
    if (typeof num !== 'number' || isNaN(num)) return false;
    return num % 1 !== 0;
}

export function HandleNumbers(num:any){
    if (isDecimal(num)){
        return Number(num).toFixed(2)
    }
    return num
}