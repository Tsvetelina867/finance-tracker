import React, { useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

const SpendingChart = ({ data }) => {
  const chartData = useMemo(() => {
    if (!Array.isArray(data) || data.length === 0) return [];

    const grouped = {};

    data
      .filter((t) => t.type === "EXPENSE")
      .forEach((t) => {
        const date = new Date(t.date);
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
        grouped[key] = (grouped[key] || 0) + t.amount;
      });

    return Object.entries(grouped)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, amount]) => ({
        month,
        amount: parseFloat(amount.toFixed(2)),
      }));
  }, [data]);

  if (chartData.length === 0) {
    return (
      <p
        style={{
          fontSize: "1.2rem",
          color: "#777",
          textAlign: "center",
          padding: "20px",
          backgroundColor: "#f9f9f9",
          border: "1px solid #ccc",
          borderRadius: "8px",
          marginTop: "20px",
        }}
      >
        No data available for chart.
      </p>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData}>
        <XAxis dataKey="month" />
        <YAxis />
        <Tooltip />
        <CartesianGrid stroke="#ccc" />
        <Line
          type="monotone"
          dataKey="amount"
          stroke="#8884d8"
          strokeWidth={2}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default SpendingChart;
