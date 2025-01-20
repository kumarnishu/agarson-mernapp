//@ts-nocheck
export const CustomFilterFunction = (
    row,
    columnId: string,
    filterValue: unknown[]
) => {

    return filterValue.some(
        val => row.getValue<unknown[]>(columnId) == val
    )
}

//@ts-nocheck
export const CustomBetweenFunction = (
    row: any,
    columnId: string,
    filterValue: [number, number]
) => {
    const rowValue = row.getValue<number>(columnId);

    // Ensure rowValue is a valid number and filterValue contains two valid numbers
    if (typeof rowValue !== 'number' || !Array.isArray(filterValue) || filterValue.length !== 2) {
        return false;
    }

    const [min, max] = filterValue;
    if (min > 0 && max > 0)
        return rowValue >= min && rowValue <= max;
    return true
};

