import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import { QueryClientProvider, QueryClient } from "react-query";

import './index.css'
import { UserProvider } from "./contexts/userContext";
import { BrowserRouter } from "react-router-dom";
import { LoadingProvider } from './contexts/loaderContext.tsx';
import { AlertProvider } from './contexts/alertContext.tsx';
import { ChoiceProvider } from './contexts/dialogContext.tsx';


export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnReconnect: true,
      refetchOnMount: true,
      refetchOnWindowFocus: true,
      retry: false
    }
  }
});
ReactDOM.createRoot(document.getElementById('root')!).render(
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <LoadingProvider>
        <UserProvider>
          <AlertProvider>
            <ChoiceProvider>
              <App />
            </ChoiceProvider>
          </AlertProvider>
        </UserProvider>
      </LoadingProvider>
    </BrowserRouter>
  </QueryClientProvider>
)

