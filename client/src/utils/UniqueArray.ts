export function onlyUnique(value:any, index:number, array:any[]) {
    return array.indexOf(value) === index;
}
export function onlyUniqueByKey<T>(array: T[], key: keyof T): T[] {
    const seen = new Set();
    return array.filter(item => {
        const keyValue = item[key];
        if (seen.has(keyValue)) {
            return false;
        } else {
            seen.add(keyValue);
            return true;
        }
    });
}