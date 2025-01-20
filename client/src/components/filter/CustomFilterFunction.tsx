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
    row,
    columnId: string,
    filterValue: unknown[]
) => {

    return filterValue.some(
        val => row.getValue<unknown[]>(columnId) == val
    )
}

