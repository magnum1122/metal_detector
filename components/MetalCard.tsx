import { useCallback, useEffect, useRef, useState } from "react";
import { View, Text, ActivityIndicator, TouchableOpacity } from "react-native";
import { getLatestPrice } from "../services/api";
import { useRouter } from "expo-router";

interface MetalCardProps {
    symbol: string; 
    name: string; 
    element: string;
    color: string; 
    textColor: string;
}

interface MetalPrice {
  symbol: string;
  price10g: number;       // price for 10g in INR
  pricePerGram: number;   // price per gram in INR
  change: number;
  changePercent: string;
  updatedAt: Date;
}

const REFRESH_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes


export default function MetalCard({symbol, name, element, color, textColor}: MetalCardProps) {
  const router = useRouter();  
  const [data, setData] = useState<MetalPrice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const prevPriceRef = useRef<number | null>(null);

  function formatTime(date?: Date) {
  if (!date) return "";
  return date.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
}

const fetchPrice = useCallback(async () => {
  try {
    setError(null);
    const [result] = await getLatestPrice([symbol], "INR");

    const price10g = parseFloat((result.pricePerGram * 10).toFixed(2));

    const prev = prevPriceRef.current;
    const change = prev !== null ? parseFloat((price10g - prev).toFixed(2)) : 0;
    const changePercent =
      prev !== null && prev !== 0
        ? `${change >= 0 ? "+" : ""}${((change / prev) * 100).toFixed(2)}%`
        : "0.00%";

    prevPriceRef.current = price10g;

    setData({
      symbol,
      price10g,
      pricePerGram: result.pricePerGram,
      change,
      changePercent,
      updatedAt: result.updatedAt,
    });
  } catch (e: any) {
    setError(e?.message ?? "Failed to load");
  } finally {
    setLoading(false);
  }
}, [symbol]);

  useEffect(() => {
    fetchPrice();
    const interval = setInterval(fetchPrice, REFRESH_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [fetchPrice]);

  const handlePress = () => {
    if (!data) return;
    router.push({
      pathname: "/metals/[id]",
      params: {
        id: symbol,
        name,
        element,
        color,
        textColor,
        price10g: String(data.price10g),
        pricePerGram: String(data.pricePerGram),
        change: String(data.change),
        changePercent: data.changePercent,
        updatedAt: data.updatedAt.toISOString(),
      },
    });
  };

  const isPositive = (data?.change ?? 0) >= 0;

  return (
    <TouchableOpacity
      onPress={handlePress}
      className="mx-4 mb-2 bg-[#0B1A02] border rounded-xl border-[#174500] py-5 px-4"
    >
      <View className="flex-row items-center justify-between">
        {/* Left: badge + name */}
        <View className="flex-row items-center gap-4">
          <View
            className="w-14 h-14 rounded-xl items-center justify-center"
            style={{ backgroundColor: color }}
          >
            <Text className="text-base font-bold" style={{ color: textColor }}>
              {element}
            </Text>
          </View>
          <View>
            <Text className="text-white text-lg font-semibold">{name}</Text>
            <Text className="text-zinc-500 text-sm">{symbol} · 24K</Text>
          </View>
        </View>

        {/* Right: price + change */}
        <View className="items-end">
          {loading ? (
            <ActivityIndicator size="small" color="#4ADE80" />
          ) : error ? (
            <TouchableOpacity onPress={fetchPrice}>
              <Text className="text-red-500 text-sm">Tap to retry</Text>
            </TouchableOpacity>
          ) : (
            <>
              <Text
                className="text-xs font-semibold mb-1"
                style={{ color: isPositive ? "#4ADE80" : "#F87171" }}
              >
                {isPositive ? "▲" : "▼"} {data?.changePercent}
              </Text>
              <Text className="text-white text-2xl font-bold">
                ₹{data?.price10g.toLocaleString("en-IN")}
              </Text>
              <Text className="text-zinc-600 text-xs mt-1">
                per 10g · {formatTime(data?.updatedAt)}
              </Text>
            </>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}
