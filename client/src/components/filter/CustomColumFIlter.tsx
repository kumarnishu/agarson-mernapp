import { MRT_RowData, MRT_TableInstance } from "material-react-table";
import { useEffect, useState } from "react";
import { Box, Button, Checkbox, ListItemText, MenuItem, Stack, TextField, Typography } from "@mui/material";
import { FixedSizeList } from "react-window";
import { onlyUnique } from "../../utils/UniqueArray";

export function CustomColumFilter<T extends MRT_RowData>({
    id,
    table,
    options,
}: {
    id: string;
    table: MRT_TableInstance<T>;
    options: string[];
}) {
    const [filter, setFilter] = useState<string>("");
    const [filteredOptions, setFilteredOptions] = useState<string[]>([]);
    const [selectedOptions, setSelectedOptions] = useState<string[]>(
        //@ts-ignore
        table.getState().columnFilters.find((item) => item.id === id)?.value || []
    );

    // Clear all filters
    function clearAllFilter() {
        setSelectedOptions([]);
        const filteredColumns = table.getState().columnFilters.filter((item) => item.id !== id);
        table.setColumnFilters(filteredColumns);
    }

    // Select or deselect all options
    function toggleSelectAll() {
        if (selectedOptions.length === filteredOptions.length) {
            setSelectedOptions([]); // Deselect all if already selected
        } else {
            setSelectedOptions(filteredOptions); // Select all
        }
    }

    useEffect(() => {
        const uniqueOptions = options.filter(onlyUnique);
        setFilteredOptions(uniqueOptions);
    }, [options]);

    useEffect(() => {
        if (filter) {
            const uniqueOptions = options.filter(onlyUnique);
            setFilteredOptions(uniqueOptions.filter((opt) => opt.toLowerCase().includes(filter.toLowerCase())));
        } else {
            const uniqueOptions = options.filter(onlyUnique);
            setFilteredOptions(uniqueOptions);
        }
    }, [filter, table]);

    useEffect(() => {
        if (selectedOptions.length > 0) {
            const obj = { id, value: selectedOptions };
            const filteredColumns = table.getState().columnFilters.filter((item) => item.id !== id);
            console.log(filteredColumns)
            filteredColumns.push(obj);
            console.log(filteredColumns)
            table.setColumnFilters(filteredColumns);
        }
    }, [selectedOptions, table]);


    // Virtualized row renderer
    const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => {
        const option = filteredOptions[index];
        const isChecked = selectedOptions.includes(option);

        return (
            <MenuItem style={style} key={index} value={option}>
                <label style={{ display: "flex", alignItems: "center", width: "100%", cursor: 'pointer' }}>
                    <Checkbox
                        checked={isChecked}
                        onChange={(e) => {
                            if (e.target.checked) {
                                setSelectedOptions([...selectedOptions, option]);
                            } else {
                                setSelectedOptions(selectedOptions.filter((item) => item !== option));
                            }
                        }}
                    />
                    <ListItemText>{option ? option.toString().slice(0, 50) : ""}</ListItemText>
                </label>
            </MenuItem>
        );
    };

    return (
        <Box sx={{ maxHeight: 500, overflowY: "auto", pt: 2 }}>
            <Box sx={{ position: "sticky", top: 0, zIndex: 1, backgroundColor: "white", p: 1, pb: 2 }}>
                <Stack direction="row" alignItems="center" py={1}>
                    <Typography fontSize={12} minWidth={200}>
                        {selectedOptions.length} selected
                    </Typography>
                    <Button fullWidth onClick={clearAllFilter}>
                        Clear All
                    </Button>
                </Stack>
                <TextField
                    size="small"
                    fullWidth
                    autoFocus
                    variant="outlined"
                    label="Search"
                    onChange={(e) => setFilter(e.target.value)}
                />
                <label style={{ display: "flex", alignItems: "center", width: "100%", cursor: 'pointer' }}>

                    <MenuItem>
                        <Checkbox
                            style={{ marginLeft: -10 }}
                            indeterminate={selectedOptions.length > 0 && selectedOptions.length < filteredOptions.length}
                            checked={selectedOptions.length === filteredOptions.length}
                            onChange={toggleSelectAll}
                        />
                        <ListItemText style={{ fontWeight: "bold", color: "blue" }}>Select All</ListItemText>
                    </MenuItem>
                </label>
            </Box>
            <FixedSizeList
                height={400} // Adjust height as needed
                width="100%"
                itemSize={46} // Height of each row
                itemCount={filteredOptions.length}
            >
                {Row}
            </FixedSizeList>
        </Box>
    );
}
