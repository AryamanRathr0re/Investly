import React, { useState, useEffect } from "react";
import axios from "axios";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import "./AssetDetail.css";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const AssetDetail = ({ asset, onClose }) => {
  const [marketData, setMarketData] = useState(null);
  const [historicalData, setHistoricalData] = useState(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState("1M");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAssetData = async () => {
      if (!asset?.symbol) return;

      try {
        setLoading(true);
        setError(null);

        // Fetch current market data
        const quoteResponse = await axios.post(
          "http://localhost:5000/api/market/quotes",
          { symbols: [asset.symbol] },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        if (quoteResponse.data?.[0]) {
          setMarketData(quoteResponse.data[0]);
        }

        // Fetch historical data
        const period =
          selectedTimeframe === "1W"
            ? "5d"
            : selectedTimeframe === "1M"
            ? "1mo"
            : "1y";

        const historicalResponse = await axios.get(
          `http://localhost:5000/api/market/historical/${asset.symbol}?period=${period}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        if (historicalResponse.data) {
          setHistoricalData(historicalResponse.data);
        }
      } catch (err) {
        console.error("Error fetching asset data:", err);
        setError("Failed to fetch asset data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchAssetData();
  }, [asset, selectedTimeframe]);

  const chartData = historicalData
    ? {
        labels: historicalData.map((point) =>
          new Date(point.date).toLocaleDateString()
        ),
        datasets: [
          {
            label: "Price",
            data: historicalData.map((point) => point.close),
            borderColor: "#64ffda",
            backgroundColor: "rgba(100, 255, 218, 0.1)",
            fill: true,
            tension: 0.4,
          },
        ],
      }
    : null;

  const chartOptions = {
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
            return `$${context.raw.toFixed(2)}`;
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
            return "$" + value.toFixed(2);
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
    return (
      <div className="asset-detail-modal">
        <div className="asset-detail-content">
          <div className="asset-detail-loading">Loading asset data...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="asset-detail-modal">
        <div className="asset-detail-content">
          <div className="asset-detail-error">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="asset-detail-modal">
      <div className="asset-detail-content">
        <div className="asset-detail-header">
          <div className="asset-detail-title">
            <h2>{asset.symbol}</h2>
            <span className="asset-name">{asset.name}</span>
          </div>
          <button className="close-button" onClick={onClose}>
            ×
          </button>
        </div>

        {marketData && (
          <div className="asset-detail-summary">
            <div className="price-section">
              <div className="current-price">
                ${marketData.currentPrice.toFixed(2)}
              </div>
              <div
                className={`price-change ${
                  marketData.change >= 0 ? "positive" : "negative"
                }`}
              >
                {marketData.change >= 0 ? "+" : ""}
                {marketData.change.toFixed(2)} (
                {marketData.changePercent.toFixed(2)}%)
              </div>
            </div>
            <div className="market-details">
              <div className="detail-item">
                <span className="label">Open</span>
                <span className="value">${marketData.open.toFixed(2)}</span>
              </div>
              <div className="detail-item">
                <span className="label">High</span>
                <span className="value">${marketData.dayHigh.toFixed(2)}</span>
              </div>
              <div className="detail-item">
                <span className="label">Low</span>
                <span className="value">${marketData.dayLow.toFixed(2)}</span>
              </div>
              <div className="detail-item">
                <span className="label">Volume</span>
                <span className="value">
                  {marketData.volume.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        )}

        <div className="asset-detail-chart">
          <div className="chart-header">
            <h3>Price History</h3>
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
          <div className="chart-container">
            {chartData ? (
              <Line data={chartData} options={chartOptions} />
            ) : (
              <div className="chart-placeholder">
                No historical data available
              </div>
            )}
          </div>
        </div>

        <div className="asset-detail-info">
          <div className="info-section">
            <h3>Investment Details</h3>
            <div className="info-grid">
              <div className="info-item">
                <span className="label">Quantity</span>
                <span className="value">{asset.quantity.toFixed(6)}</span>
              </div>
              <div className="info-item">
                <span className="label">Purchase Price</span>
                <span className="value">${asset.purchasePrice.toFixed(2)}</span>
              </div>
              <div className="info-item">
                <span className="label">Purchase Date</span>
                <span className="value">
                  {new Date(asset.purchaseDate).toLocaleDateString()}
                </span>
              </div>
              <div className="info-item">
                <span className="label">Current Value</span>
                <span className="value">
                  $
                  {(
                    asset.quantity *
                    (marketData?.currentPrice || asset.currentPrice)
                  ).toFixed(2)}
                </span>
              </div>
              <div className="info-item">
                <span className="label">Total Gain/Loss</span>
                <span
                  className={`value ${
                    marketData?.change >= 0 ? "positive" : "negative"
                  }`}
                >
                  $
                  {(
                    asset.quantity *
                    (marketData?.currentPrice - asset.purchasePrice)
                  ).toFixed(2)}
                </span>
              </div>
              <div className="info-item">
                <span className="label">% Change</span>
                <span
                  className={`value ${
                    marketData?.change >= 0 ? "positive" : "negative"
                  }`}
                >
                  {(
                    (((marketData?.currentPrice || asset.currentPrice) -
                      asset.purchasePrice) /
                      asset.purchasePrice) *
                    100
                  ).toFixed(2)}
                  %
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssetDetail;
