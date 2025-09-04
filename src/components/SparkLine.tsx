"use client";
import { ResponsiveContainer, LineChart, Line, Tooltip } from "recharts";
export default function SparkLine({ data }: { data: { date: string; count: number }[] }) {
  return (
    <div className="h-16 w-full">
      <ResponsiveContainer>
        <LineChart data={data}>
          <Line type="monotone" dataKey="count" strokeWidth={2} dot={false} />
          <Tooltip contentStyle={{ background: "rgba(0,0,0,.7)", border: "1px solid rgba(255,255,255,.1)" }} labelStyle={{ color: "white" }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
