import {
  FlatList,
  Text,
  View,
} from "react-native";
import MetalCard from "@/components/MetalCard";


const METALS = [
  { symbol: "XAU", name: "Gold",      element: "Au", color: "#FFD700", textColor: "#000" },
  { symbol: "XAG", name: "Silver",    element: "Ag", color: "#C0C0C0", textColor: "#000" },
  { symbol: "XPT", name: "Platinum",  element: "Pt", color: "#6E8B9E", textColor: "#fff" },
  { symbol: "XPD", name: "Palladium", element: "Pd", color: "#4A5568", textColor: "#fff" },
];



export default function HomeScreen() {

  return (
    <View className="flex-1 bg-[#000D02]">
      {/* Header */}
      <View className="px-6 pt-16 pb-6">
        <Text className="text-zinc-500 text-sm font-medium tracking-widest uppercase mb-1">
          Live Prices
        </Text>
        <Text className="text-white text-4xl font-bold tracking-tight">Metals</Text>
        <Text className="text-zinc-600 text-xs mt-2">Showing price per 10g · 24 Karat · INR</Text>
      </View>

      <View className="h-px bg-zinc-800 mx-4" />

      <FlatList
        data={METALS}
        keyExtractor={(item) => item.symbol}
        renderItem={({ item }) => (
          <MetalCard
            key={item.symbol}
            {...item}
          />
        )}
        
        ListFooterComponent={
          <Text className="text-center text-zinc-700 text-xs py-6">
            Prices update every 5 min · Data via MetalPriceAPI
          </Text>
        }
      />
    </View>
  );
}