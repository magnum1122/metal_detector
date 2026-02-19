import { View, Text } from 'react-native'
import React from 'react'

export default function OHLCCard({ label, value, arrow }: {
  label: string; value?: number; arrow: "up" | "down" | null;
}) {
  const arrowColor = arrow === "up" ? "#4ADE80" : arrow === "down" ? "#F87171" : "#71717a";
  return (
    <View
      style={{ width: "47.5%", backgroundColor: "#18181b", borderRadius: 14, padding: 16 }}
    >
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <Text style={{ color: "#71717a", fontSize: 10, fontWeight: "700", letterSpacing: 1 }}>{label}</Text>
        {arrow && (
          <Text style={{ color: arrowColor, fontSize: 20 }}>{arrow === "up" ? "↗" : "↘"}</Text>
        )}
      </View>
      <Text style={{ color: "#ffffff", fontSize: 17, fontWeight: "700" }}>
        ₹{value?.toLocaleString("en-IN") ?? "--"}
      </Text>
    </View>
  );
}
