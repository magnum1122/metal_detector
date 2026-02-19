import axios from "axios";

// Create axios instance
const metalApi = axios.create({
  baseURL: "https://api.metalpriceapi.com/v1",
  timeout: 10000,
  params: {
    api_key: process.env.EXPO_PUBLIC_API_KEY,
  },
});

  const TROY_OZ_TO_GRAM = 31.1035;
  const USD_TO_INR = 90.16;


export const getLatestPrice = async (symbols: string[], base = "INR") => {
  try {
    const response = await metalApi.get("/latest", {
      params: { base, currencies: symbols.join(",") },
    });

    console.log("API RESPONSE:", JSON.stringify(response.data, null, 2)); // 👈 add this

    const { rates, timestamp } = response.data;

    return symbols.map((symbol) => ({
      symbol,
      pricePerGram: parseFloat((1 / rates[symbol] / TROY_OZ_TO_GRAM).toFixed(2)),
      pricePerTroyOz: parseFloat((1 / rates[symbol]).toFixed(2)),
      updatedAt: new Date(timestamp * 1000),
    }));
  } catch (error) {
    console.log("API ERROR:", error);
    throw error;
  }
};


/**
 * Get OHLC data (Open, High, Low, Close)
 * Used for detail screen
 */
export const getOHLC = async (
  baseMetal: string,
  quoteCurrency: string,
  date: string
) => {
  try {
    // const formattedDate =
    //   date || new Date().toISOString().split("T")[0];

    const response = await metalApi.get("/ohlc", {
    params: {
      base: baseMetal,
      currency: quoteCurrency,
      date
    },
  });

  const rate = response?.data?.rate;
    if (!rate) throw new Error(`No OHLC data found for ${baseMetal}`);


    const toPrice10g = (val: number) =>
      parseFloat((val / TROY_OZ_TO_GRAM * USD_TO_INR * 10).toFixed(2));

    return {
      open:  toPrice10g(rate.open),
      high:  toPrice10g(rate.high),
      low:   toPrice10g(rate.low),
      close: toPrice10g(rate.close),
    };
  } catch (error) {
    console.log("OHLC ERROR:", error);
        throw error;
  }
};
export default metalApi;


/**
 * Get historical price for a specific date
 */
// export const getHistoricalPrice = async (
//   symbol,
//   date,
//   base = "USD"
// ) => {
//   try {
//     const response = await metalApi.get(
//       `/${date}?base=${base}&symbols=${symbol}`
//     );

//     return response.data;
//   } catch (error) {
//     handleApiError(error);
//   }
// };

/**
 * Get list of supported symbols
 */
// export const getSupportedSymbols = async () => {
//   try {
//     const response = await metalApi.get("/symbols");
//     return response.data;
//   } catch (error) {
//     handleApiError(error);
//   }
// };

