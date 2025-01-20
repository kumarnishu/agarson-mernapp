import { Box, Stack } from '@mui/material'
import { ArticlesProvider } from '../../contexts/ArticlesContext'
import CurrentStockSellerPage from '../../pages/sales/CurrentStockSellerPage'
import StockSellerPartiesList from '../../pages/sales/StockSellerPartiesList'

function ArticleStockSellerPage() {
    return (
        <>
            <ArticlesProvider>

                <Stack direction={{ sm: 'column', md: 'row' }} gap={1}   >
                    <Box sx={{ width: '49vw' }}>
                        <StockSellerPartiesList />
                    </Box>
                    <Box sx={{ width: '49vw' }}>

                        <CurrentStockSellerPage />
                    </Box>

                </Stack>
            </ArticlesProvider>
        </>
    )
}

export default ArticleStockSellerPage