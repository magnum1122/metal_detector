import { useCallback, useEffect, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { getOHLC } from "@/services/api";
import OHLCCard from "@/components/OhlcCard";

const REFRESH_SECONDS = 5 * 60; // 5 minutes

interface OHLCData {
  open: number;
  high: number;
  low: number;
  close: number;
}

interface MetalPrice {
  price10g: number;
  pricePerGram: number;
  change: number;
  changePercent: string;
  updatedAt: Date;
}


function useCountdown(seconds: number, onComplete: () => void) {
  const [remaining, setRemaining] = useState(seconds);

  useEffect(() => {
    setRemaining(seconds);
    const interval = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          onComplete();
          return seconds; 
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [seconds]);

  const mm = String(Math.floor(remaining / 60)).padStart(2, "0");
  const ss = String(remaining % 60).padStart(2, "0");

  return { display: `${mm}:${ss}` };
}

export default function DetailScreen() {
  const router = useRouter(); 
  const params = useLocalSearchParams();

  const metal = {
    symbol: params.id as string,
    name: params.name as string,
    element: params.element as string,
    color: params.color as string,
    textColor: params.textColor as string,
  };

  const priceData = {
    price10g: parseFloat(params.price10g as string),
    pricePerGram: parseFloat(params.pricePerGram as string),
    change: parseFloat(params.change as string),
    changePercent: params.changePercent as string,
    updatedAt: new Date(params.updatedAt as string), // string → Date
  };
  const { symbol, name, element, color, textColor } = metal;
  const { price10g, pricePerGram, change, changePercent, updatedAt } = priceData as MetalPrice;

  const [ohlc, setOhlc] = useState<OHLCData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [livePrice, setLivePrice] = useState(price10g);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date(updatedAt));
  
  const getYesterday = () => {
  const d = new Date();
  d.setDate(d.getDate() - 1); 
  return d.toISOString().split("T")[0];
};

  const isPositive = change >= 0;

  const fetchOHLC = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await getOHLC(symbol, "USD", getYesterday());
      console.log("OHLC result:", result); 
      setOhlc(result);
    } catch (e: any) {
      setError(e?.message ?? "Failed to load OHLC");
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(() => {
    setLastUpdated(new Date());
    fetchOHLC();
  },[symbol])

  useEffect(() => {
    fetchOHLC();
  }, []);

  const { display: countdown} = useCountdown(REFRESH_SECONDS, onRefresh);

  return (
    <ScrollView className="flex-1 bg-black" contentContainerStyle={{ paddingBottom: 48 }}>

      {/* ── Nav ── */}
      <View className="px-6 pt-14 pb-4 flex-row items-center">
        <Pressable onPress={router.back} className="mr-3">
          <Text className="text-white text-3xl font-bold pb-3">←</Text>
        </Pressable>
        <Text className="text-white text-xl font-semibold">{name} ({symbol})</Text>
      </View>

      {/* ── Live Price Card ── */}
      <View className="mx-4 rounded-2xl overflow-hidden" style={{ backgroundColor: "#1a1400" }}>
        {/* Gold gradient border effect */}
        <View style={{ padding: 1, borderRadius: 16, backgroundColor: "#3a2a00" }}>
          <View className="rounded-2xl px-6 py-7 items-center" style={{ backgroundColor: "#110e00" }}>

            <Text className="text-xs font-semibold tracking-widest uppercase mb-3" style={{ color: "#B8860B" }}>
              Live Price · 10g
            </Text>

            <Text className="text-5xl font-bold mb-2" style={{ color: "#FFD700" }}>
              ₹{livePrice.toLocaleString("en-IN")}
            </Text>

            {/* Change badge */}
            <View
              className="flex-row items-center gap-1 px-3 py-1 rounded-full mt-1"
              style={{ backgroundColor: isPositive ? "#052e16" : "#1f0909" }}
            >
              <Text className="text-sm font-bold" style={{ color: isPositive ? "#4ADE80" : "#F87171" }}>
                {isPositive ? "↗" : "↘"} {changePercent}
              </Text>
            </View>

            {/* Last updated */}
            <Text className="text-xs mt-4" style={{ color: "#5a4a00" }}>
              Live Data · {lastUpdated.toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}
              {", "}
              {lastUpdated.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
            </Text>
          </View>
        </View>
      </View>

      {/* ── Next Refresh Countdown ── */}
      <View className="mx-4 mt-3 flex-row items-center justify-between bg-zinc-950 rounded-xl px-5 py-3">
        <View>
          <Text className="text-zinc-500 text-xs uppercase tracking-widest">Next Refresh</Text>
          <View className="bg-[#052e16] flex items-center mt-1 py-0.5 rounded-full">
          <Text className="text-[#4ADE80] text-base font-bold font-mono mt-0.5">{countdown}</Text>
          </View>
        </View>
      </View>

      {/* ── OHLC Grid ── */}
      <View className="mx-4 mt-6">
        <Text className="text-zinc-400 text-sm font-semibold mb-3">OHLC (Today)</Text>

        {loading ? (
          <ActivityIndicator color="#FFD700" size="large" style={{ paddingVertical: 32 }} />
        ) : error ? (
          <View style={{ alignItems: "center", paddingVertical: 24, gap: 12 }}>
            <Text className="text-zinc-500 text-sm">{error}</Text>
            <Pressable onPress={fetchOHLC} className="bg-zinc-800 px-5 py-2 rounded-lg">
              <Text className="text-white text-sm">Retry</Text>
            </Pressable>
          </View>
        ) : (
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
            <OHLCCard label="OPEN"       value={ohlc?.open}  arrow={null} />
            <OHLCCard label="HIGH"       value={ohlc?.high}  arrow="up" />
            <OHLCCard label="LOW"        value={ohlc?.low}   arrow="down" />
            <OHLCCard label="PREV CLOSE" value={ohlc?.close} arrow={null} />
          </View>
        )}
      </View>

    </ScrollView>
  );
}
