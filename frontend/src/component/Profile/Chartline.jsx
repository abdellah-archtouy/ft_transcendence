import React, { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import dayjs from 'dayjs';

const MyYearlyWinsChart = ({ chartData, par }) => {

  // console.log('chartData:', chartData);
  return (
<ResponsiveContainer width="90%" height="90%" className="hhP">
        <AreaChart className='area'
          // width={500}
          // height={400}
          data={chartData}
        >
          {/* <CartesianGrid strokeDasharray="3 3" /> */}
          <XAxis className='test' dataKey="hour" interval={1}  />
          <YAxis className='yaxis' width={1} />
          <Tooltip className="hove" />
          <Area type="monotone" dataKey={par} stroke="#767373" fill="#767373" />
        </AreaChart>
      </ResponsiveContainer>
  );
};

export default MyYearlyWinsChart;
