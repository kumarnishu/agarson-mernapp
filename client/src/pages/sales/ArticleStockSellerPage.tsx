import { Stack, Button } from '@mui/material'
import { ArticlesProvider } from '../../contexts/ArticlesContext'
import CurrentStockSellerPage from './CurrentStockSellerPage'

function ArticleStockSellerPage() {
    return (
        <>
            <Stack direction={{ sm: 'column', md: 'row' }} gap={2} alignItems={'center'} justifyContent={'left'} sx={{ width: '100vw' }}>


                {/* <Stack direction={{ sm: 'column', md: 'row' }} gap={2}> */}

                <Button variant='text' fullWidth color="error" sx={{ fontSize: 17 }} >
                    Article Stock Sellers
                </Button>
                {/* </Stack> */}
            </Stack>
            <ArticlesProvider>

                <Stack direction={{ sm: 'column', md: 'row' }} sx={{ width: '100vw' }} gap={1}   >
                    <Stack gap={1} direction={'column'} justifyContent={'space-between'} sx={{
                        width: {
                            sm: "100%",
                            md: '49%'
                        }
                    }}>
                    </Stack>
                    <Stack direction={'row'} >
                        <CurrentStockSellerPage party={"bsjd"} />
                    </Stack>
                </Stack>
            </ArticlesProvider>
        </>
    )
}

export default ArticleStockSellerPage