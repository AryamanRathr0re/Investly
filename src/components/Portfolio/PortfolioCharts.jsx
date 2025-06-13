import React, { useState, useEffect } from "react";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
} from "chart.js";
import { Pie, Line } from "react-chartjs-2";
import axios from "axios";
import "./PortfolioCharts.css";

// Register ChartJS components
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title
);

const PortfolioCharts = ({ portfolioData }) => {
  const [assetDistribution, setAssetDistribution] = useState(null);
  const [performanceData, setPerformanceData] = useState(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState("1W");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (portfolioData) {
      processPortfolioData();
    }
  }, [portfolioData, selectedTimeframe]);

  const processPortfolioData = () => {
    // Process data for pie chart (asset distribution)
    const assetTypes = {};
    portfolioData.investments.forEach((investment) => {
      const type = investment.type;
      const value = investment.quantity * investment.currentPrice;
      assetTypes[type] = (assetTypes[type] || 0) + value;
    });

    const pieData = {
      labels: Object.keys(assetTypes),
      datasets: [
        {
          data: Object.values(assetTypes),
          backgroundColor: [
            "#64ffda",
            "#4caf50",
            "#2196f3",
            "#ff9800",
            "#e91e63",
            "#9c27b0",
          ],
          borderColor: "rgba(255, 255, 255, 0.1)",
          borderWidth: 2,
        },
      ],
    };

    // Process data for line chart (performance over time)
    // In a real application, this would come from an API
    const generatePerformanceData = () => {
      const days =
        selectedTimeframe === "1W" ? 7 : selectedTimeframe === "1M" ? 30 : 365;
      const labels = Array.from({ length: days }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (days - i - 1));
        return date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        });
      });

      const totalValue = Object.values(assetTypes).reduce((a, b) => a + b, 0);
      const baseValue = totalValue * 0.8; // Simulate starting value
      const values = labels.map((_, i) => {
        const randomFactor = 0.95 + Math.random() * 0.1; // Random fluctuation
        return baseValue * (1 + (i / days) * 0.2) * randomFactor;
      });

      return {
        labels,
        datasets: [
          {
            label: "Portfolio Value",
            data: values,
            borderColor: "#64ffda",
            backgroundColor: "rgba(100, 255, 218, 0.1)",
            fill: true,
            tension: 0.4,
          },
        ],
      };
    };

    setAssetDistribution(pieData);
    setPerformanceData(generatePerformanceData());
    setLoading(false);
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "right",
        labels: {
          color: "#fff",
          font: {
            size: 12,
          },
        },
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            const value = context.raw;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${
              context.label
            }: $${value.toLocaleString()} (${percentage}%)`;
          },
        },
      },
    },
  };

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        mode: "index",
        intersect: false,
        callbacks: {
          label: function (context) {
            return `$${context.raw.toLocaleString()}`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          color: "rgba(255, 255, 255, 0.1)",
        },
        ticks: {
          color: "#a0a0a0",
          maxRotation: 45,
          minRotation: 45,
        },
      },
      y: {
        grid: {
          color: "rgba(255, 255, 255, 0.1)",
        },
        ticks: {
          color: "#a0a0a0",
          callback: function (value) {
            return "$" + value.toLocaleString();
          },
        },
      },
    },
    interaction: {
      mode: "nearest",
      axis: "x",
      intersect: false,
    },
  };

  if (loading) {
    return <div className="charts-loading">Loading charts...</div>;
  }

  return (
    <div className="portfolio-charts">
      <div className="charts-header">
        <h3>Portfolio Analytics</h3>
        <div className="timeframe-selector">
          {["1W", "1M", "1Y"].map((timeframe) => (
            <button
              key={timeframe}
              className={`timeframe-btn ${
                selectedTimeframe === timeframe ? "active" : ""
              }`}
              onClick={() => setSelectedTimeframe(timeframe)}
            >
              {timeframe}
            </button>
          ))}
        </div>
      </div>

      <div className="charts-grid">
        <div className="chart-container">
          <h4>Asset Distribution</h4>
          <div className="pie-chart">
            <Pie data={assetDistribution} options={pieOptions} />
          </div>
        </div>

        <div className="chart-container">
          <h4>Portfolio Performance</h4>
          <div className="line-chart">
            <Line data={performanceData} options={lineOptions} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PortfolioCharts;
