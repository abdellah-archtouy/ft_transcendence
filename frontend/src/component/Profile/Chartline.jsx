import React, { useEffect, useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const MyYearlyWinsChart = ({ chartData, par1, par2 }) => {
  const [interval, setInterval] = useState(1);

  useEffect(() => {
    if (chartData.length < 8) {
      setInterval(0);
    } else {
      setInterval(1);
    }
  }, [chartData]);

  return (
    <ResponsiveContainer width="100%" height="100%" className="hhP">
      <AreaChart
        className="area"
        data={chartData}
        margin={{ top: 10, right: 20, left: 20, bottom: 0 }}
      >
        <defs>
          <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
            <stop offset="1%" stopColor="#767373" stopOpacity={1} />
            <stop offset="99%" stopColor="#767373" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis
          className="test"
          dataKey={par2}
          interval={interval}
          tick={{ fontSize: "6px", fill: "#555", fontWeight:"400" }}
        />
        <YAxis className="yaxis" width={1} />
        <Tooltip className="hove" />
        <Area
          type="monotone"
          dataKey={par1}
          stroke="#767373"
          fill="url(#colorUv)"
          isAnimationActive={true}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};

export default MyYearlyWinsChart;
