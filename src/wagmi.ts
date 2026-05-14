import { createWeb3Modal, defaultWagmiConfig } from '@web3modal/wagmi/react'
import { mainnet, polygon, optimism, arbitrum, base } from 'wagmi/chains'

// 1. Get projectId from https://cloud.walletconnect.com
// This is the "Public" ID that lets mobile wallets talk to your app.
// I've used a placeholder, but for mobile deep-linking to work perfectly, 
// you should eventually swap this with your own free project ID.
export const projectId = '540e2d8d5d7f36c7e6b0a6c0eb89ac9d'

// 2. Create wagmiConfig
const metadata = {
  name: 'GoldTrust Imperial Vault',
  description: 'Institutional-grade investment management',
  url: 'https://goldtrust.vault', // origin must match your domain & subdomain
  icons: ['https://avatars.githubusercontent.com/u/37784886']
}

const chains = [mainnet, polygon, optimism, arbitrum, base] as const
export const config = defaultWagmiConfig({ 
  chains, 
  projectId, 
  metadata,
  enableWalletConnect: true,
  enableInjected: true,
  enableEIP6963: true,
  enableCoinbaseWallet: true,
})

// 3. Create modal
createWeb3Modal({
  wagmiConfig: config,
  projectId,
  enableAnalytics: true, // Optional - defaults to your Cloud configuration
  themeMode: 'dark',
  themeVariables: {
    '--w3m-accent': '#d4af37',
    '--w3m-border-radius-master': '1px',
  }
})
