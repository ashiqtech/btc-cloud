import { CryptoPrice } from '../types';
import { COINGECKO_IDS } from '../constants';

const BASE_URL = 'https://api.coingecko.com/api/v3';

// Fallback data in case of API rate limits
const MOCK_DATA: CryptoPrice[] = [
  { id: 'bitcoin', symbol: 'btc', name: 'Bitcoin', image: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png', current_price: 64230, price_change_percentage_24h: 2.5 },
  { id: 'ethereum', symbol: 'eth', name: 'Ethereum', image: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png', current_price: 3450, price_change_percentage_24h: 1.2 },
  { id: 'solana', symbol: 'sol', name: 'Solana', image: 'https://assets.coingecko.com/coins/images/4128/large/solana.png', current_price: 145, price_change_percentage_24h: -0.5 },
  { id: 'ripple', symbol: 'xrp', name: 'XRP', image: 'https://assets.coingecko.com/coins/images/44/large/xrp-symbol-white-128.png', current_price: 0.62, price_change_percentage_24h: 0.1 },
  { id: 'dogecoin', symbol: 'doge', name: 'Dogecoin', image: 'https://assets.coingecko.com/coins/images/5/large/dogecoin.png', current_price: 0.12, price_change_percentage_24h: 5.0 },
];

export const fetchCryptoPrices = async (): Promise<CryptoPrice[]> => {
  try {
    const ids = COINGECKO_IDS.join(',');
    const response = await fetch(`${BASE_URL}/coins/markets?vs_currency=usd&ids=${ids}&order=market_cap_desc&per_page=5&page=1&sparkline=false`);
    
    if (!response.ok) {
      throw new Error('API Rate Limit or Error');
    }
    
    return await response.json();
  } catch (error) {
    console.warn("Using mock crypto data due to API limit:", error);
    return MOCK_DATA;
  }
};
