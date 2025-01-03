import { MRT_TableInstance } from "material-react-table"
import { useEffect, useState } from "react"
import { Box, Button, Checkbox, ListItemText, MenuItem, TextField, Typography } from "@mui/material"

export function CustomColumFilter({ id, table, options }: { id: string, table: MRT_TableInstance<any>, options: string[] }) {

    const [filter, setFilter] = useState<string>()
    const [filteredOptions, setFilteredOptions] = useState<string[]>(options)
    //@ts-ignore
    const [selectedOptions, setSelectedOptions] = useState<string[]>(table.getState().columnFilters.find((item) => item.id === id)?.value || [])


    //clear filter
    function clearAllFilter() {
        setSelectedOptions([])
        let filteredcolumns = table.getState().columnFilters.filter((item) => item.id !== id)
        table.setColumnFilters(filteredcolumns)

    }

    useEffect(() => { //filter the options
        if (filter) { //if there is a filter
            setFilteredOptions(options.filter((option) => option.toLowerCase().includes(filter.toLowerCase())))
        }
        else {
            setFilteredOptions(options)
        } //if there is no filter 
    }, [filter])




    useEffect(() => {
        if (selectedOptions.length > 0) {
            let obj = { id: id, value: selectedOptions };
            let filteredcolumns = table.getState().columnFilters.filter((item) => item.id !== id)
            filteredcolumns.push(obj)
            table.setColumnFilters(filteredcolumns)
        }
    }
        , [selectedOptions])


    return (
        <Box sx={{ maxHeight: 500, overflowY: 'auto', pt: 2 }}>
            {selectedOptions.length > 0 && <Typography>{selectedOptions.length} selected</Typography>}
            <TextField size="small" variant="outlined" label="Search" onChange={(e) => {
                const value = e.target.value
                setFilter(value)
            }} />
            <br />
            {selectedOptions.length > 0 && <Button fullWidth onClick={() => clearAllFilter()} >Clear All</Button>}

            {filteredOptions.map((option, index) => (
                <MenuItem key={index} value={option}>
                    <Checkbox checked={Boolean(selectedOptions.find(item => item == option))} onChange={(e) => {
                        if (e.target.checked) {
                            setSelectedOptions([...selectedOptions, option])
                        }
                        else {
                            setSelectedOptions(selectedOptions.filter(item => item !== option))
                        }
                    }} />
                    <ListItemText>{option.slice(0, 50)}</ListItemText>
                </MenuItem>
            ))}
        </Box>
    );
}
