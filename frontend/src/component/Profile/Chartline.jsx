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
    <ResponsiveContainer width="90%" height="90%" className="hhP">
      <AreaChart
        className="area"
        // width={500}
        // height={400}
        data={chartData}
      >
        <defs>
          <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
            <stop offset="1%" stopColor="#767373" stopOpacity={1} />
            <stop offset="99%" stopColor="#767373" stopOpacity={0} />
          </linearGradient>
        </defs>
        {/* <CartesianGrid strokeDasharray="3 3" /> */}
        <XAxis className="test" dataKey={par2} interval={interval} />
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
