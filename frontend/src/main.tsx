import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import {ConnectionProvider, WalletProvider} from "@solana/wallet-adapter-react";
import {Adapter} from "@solana/wallet-adapter-base";
import { WalletModalProvider} from "@solana/wallet-adapter-react-ui";
import '@solana/wallet-adapter-react-ui/styles.css';
import { Toaster } from "@/components/ui/sonner"
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';

const wallets:Adapter[] = [] // add your wallet you want :D
const client = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ConnectionProvider endpoint={'http://localhost:8899'} config={{commitment:'confirmed'}} >
      <WalletProvider wallets={wallets} autoConnect={true}>
        <WalletModalProvider>
          <Toaster />
          <QueryClientProvider client={client}>
            <App/>
          </QueryClientProvider>
        
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  </React.StrictMode>,
)
