import React, { useState, useEffect, useRef } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { toBlob } from 'html-to-image';
import { saveAs } from 'file-saver';
import './chart.css';

const getStartOfWeek = (date) => {
  const start = new Date(date);
//   console.log(start)
  const day = start.getDay();
  const diff = start.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(start.setDate(diff));
};

const getWeeklyData = (data) => {
  const weeklyData = [];
  data.reduce((acc, curr) => {
    const weekStart = getStartOfWeek(new Date(curr.timestamp)).toISOString().split('T')[0];
    if (!acc[weekStart]) {
      acc[weekStart] = { timestamp: weekStart, value: 0 };
      weeklyData.push(acc[weekStart]);
    }
    acc[weekStart].value += curr.value;
    return acc;
  }, {});
  return weeklyData;
};

const getMonthlyData = (data) => {
  const monthlyData = [];
  data.reduce((acc, curr) => {
    const monthStart = curr.timestamp.slice(0, 7); 
    if (!acc[monthStart]) {
      acc[monthStart] = { timestamp: monthStart, value: 0 };
      monthlyData.push(acc[monthStart]);
    }
    acc[monthStart].value += curr.value;
    return acc;
  }, {});
  return monthlyData;
};

const Chart = () => {
  const [data, setData] = useState([]);
  const [timeframe, setTimeframe] = useState('daily');
  const chartRef = useRef(null);

  useEffect(() => {
    fetch('/data.json')
      .then(response => response.json())
      .then(data => setData(data));
  }, []);

  const filteredData = (() => {
    switch (timeframe) {
      case 'weekly':
        return getWeeklyData(data);
      case 'monthly':
        return getMonthlyData(data);
      default:
        return data;
    }
  })();

  const exportChart = (format) => {
    if (chartRef.current === null) {
      return;
    }

    toBlob(chartRef.current)
      .then((blob) => {
        if (blob) {
          saveAs(blob, `chart.${format}`);
        }
      });
  };

  return (
    <div className="container">
      <h1 className="chart-title">Data Chart</h1>
      <div className="button-group1">
        <button className='button1' onClick={() => setTimeframe('daily')}>Daily</button>
        <button className='button1' onClick={() => setTimeframe('weekly')}>Weekly</button>
        <button className='button1' onClick={() => setTimeframe('monthly')}>Monthly</button>
      </div>
      <div className="button-group2">
        <button className='button' onClick={() => exportChart('png')}>Export as PNG</button>
        <button className='button' onClick={() => exportChart('jpg')}>Export as JPG</button>
      </div>
      <div ref={chartRef} className="chart-container">
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={filteredData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="timestamp" fontSize={12} />
            <YAxis fontSize={12}/>
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="value" stroke="#8884d8" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Chart;
