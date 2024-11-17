import React, { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import dayjs from 'dayjs';

const MyYearlyWinsChart = ({ chartData, par1 , par2 }) => {

  const [interval, setInterval] = useState(1);

  useEffect(() => {
    if (chartData.length < 8) {
      setInterval(0);
    }
    else{
      setInterval(1);
    }
  }, [chartData]);

  // console.log('chartData:', chartData);
  return (
<ResponsiveContainer width="90%" height="90%" className="hhP">
        <AreaChart className='area'
          // width={500}
          // height={400}
          data={chartData}
        >
          <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
            <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
          </linearGradient>
          {/* <CartesianGrid strokeDasharray="3 3" /> */}
          <XAxis className='test' dataKey={par2} interval={interval} />
          <YAxis className='yaxis' width={1} />
          <Tooltip className="hove"  />
          <Area type="monotone" dataKey={par1} stroke="#767373" fill="#767373" />
        </AreaChart>
      </ResponsiveContainer>
  );
};

export default MyYearlyWinsChart;
