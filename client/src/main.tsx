import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import { QueryClientProvider, QueryClient } from "react-query";

import './index.css'
import { UserProvider } from "./contexts/userContext";
import { BrowserRouter } from "react-router-dom";
import { ChoiceProvider } from "./contexts/dialogContext";
import { MenuProvider } from "./contexts/menuContext";
import { LoadingProvider } from './contexts/loaderContext.tsx';
import { FeatureProvider } from './contexts/featureContext.tsx';


export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnReconnect: true,
      refetchOnMount: true,
      refetchOnWindowFocus:true,
      retry: false
    }
  }
});
ReactDOM.createRoot(document.getElementById('root')!).render(
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <UserProvider>
        <LoadingProvider>
          <ChoiceProvider>
            <MenuProvider>
              <FeatureProvider>
                <App />
              </FeatureProvider>
            </MenuProvider>
          </ChoiceProvider>
        </LoadingProvider>
      </UserProvider>
    </BrowserRouter>
  </QueryClientProvider>
)

