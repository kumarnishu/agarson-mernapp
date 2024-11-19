import { AcUnitTwoTone } from '@mui/icons-material';
import { Popover } from '@mui/material';
import { useState } from 'react'

function PopUp({ element }: { element: JSX.Element }) {
    const [popup, setPopup] = useState<any | null>(null);
    return (
        <div>
            <AcUnitTwoTone color='primary' onClick={(e) => setPopup(e.currentTarget)} sx={{ height: 14, width: 14, cursor: 'pointer' }} />
            <Popover
            
                open={Boolean(popup)}
                anchorEl={popup}
                onClose={() =>
                    setPopup(null)
                }
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left',
                }}
            >
                {element}
            </Popover>
        </div >
    )
}

export default PopUp