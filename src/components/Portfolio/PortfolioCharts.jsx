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

// Default empty chart data
const emptyChartData = {
  labels: [],
  datasets: [
    {
      data: [],
      backgroundColor: [],
      borderColor: "rgba(255, 255, 255, 0.1)",
      borderWidth: 2,
    },
  ],
};

const PortfolioCharts = ({ portfolioData }) => {
  console.log("PortfolioCharts received data:", {
    hasData: !!portfolioData,
    investments: portfolioData?.investments?.length || 0,
    totalValue: portfolioData?.totalValue,
    investments: portfolioData?.investments?.map((inv) => ({
      symbol: inv.symbol,
      type: inv.type,
      quantity: inv.quantity,
      currentPrice: inv.currentPrice,
    })),
  });

  const [assetDistribution, setAssetDistribution] = useState(emptyChartData);
  const [performanceData, setPerformanceData] = useState(emptyChartData);
  const [selectedTimeframe, setSelectedTimeframe] = useState("1W");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasData, setHasData] = useState(false);
  const [usingStoredData, setUsingStoredData] = useState(false);

  useEffect(() => {
    console.log("PortfolioCharts useEffect triggered:", {
      hasInvestments: portfolioData?.investments?.length > 0,
      investmentCount: portfolioData?.investments?.length,
      selectedTimeframe,
      loading,
      error,
      hasData,
    });

    if (portfolioData?.investments?.length > 0) {
      setHasData(true);
      processPortfolioData();
    } else {
      console.log("No portfolio data available");
      setHasData(false);
      setLoading(false);
    }
  }, [portfolioData, selectedTimeframe]);

  const handleApiError = (error) => {
    console.error("API Error:", error);
    setUsingStoredData(true);

    if (error.response) {
      const { error: errorCode, message } = error.response.data;

      switch (errorCode) {
        case "SYMBOL_NOT_FOUND":
          return "One or more stock symbols could not be found. Using stored values.";
        case "NO_VALID_SYMBOLS":
          return "No valid stock symbols found in your portfolio. Using stored values.";
        case "NO_VALID_QUOTES":
          return "Unable to fetch current market data. Using stored values.";
        case "INVALID_PERIOD":
        case "INVALID_INTERVAL":
          return "Invalid time period selected. Using stored values.";
        default:
          return message || "Using stored market data values.";
      }
    }

    return "Using stored market data values.";
  };

  const processPortfolioData = async () => {
    if (!portfolioData?.investments?.length) {
      console.log("No investments to process");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setUsingStoredData(false);

      console.log("Processing portfolio data:", {
        investmentCount: portfolioData.investments.length,
        timeframe: selectedTimeframe,
        investments: portfolioData.investments.map((inv) => ({
          symbol: inv.symbol,
          type: inv.type,
          quantity: inv.quantity,
          currentPrice: inv.currentPrice,
        })),
      });

      // Process data for pie chart (asset distribution)
      const assetTypes = {};
      const symbols = new Set();

      portfolioData.investments.forEach((investment) => {
        if (
          !investment?.type ||
          !investment?.quantity ||
          !investment?.currentPrice
        ) {
          console.warn("Invalid investment data:", investment);
          return;
        }

        const type = investment.type;
        const value = investment.quantity * investment.currentPrice;
        assetTypes[type] = (assetTypes[type] || 0) + value;

        if (investment.symbol) {
          symbols.add(investment.symbol);
        }
      });

      console.log("Processed asset types:", assetTypes);

      if (Object.keys(assetTypes).length === 0) {
        console.log("No valid asset types found");
        setLoading(false);
        setHasData(false);
        return;
      }

      // Set initial data from stored values
      const initialAssetData = {
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

      console.log("Setting initial asset distribution:", initialAssetData);
      setAssetDistribution(initialAssetData);

      // Try to fetch real-time data
      if (symbols.size > 0) {
        try {
          console.log("Fetching quotes for symbols:", Array.from(symbols));
          const quotesResponse = await axios.post(
            "http://localhost:5000/api/market/quotes",
            { symbols: Array.from(symbols) },
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
          );

          console.log("Quotes response:", quotesResponse.data);

          if (quotesResponse.data?.length > 0) {
            const quotes = quotesResponse.data;
            const quotesMap = new Map(
              quotes.map((quote) => [quote.symbol, quote])
            );

            // Update pie chart with real-time prices
            const updatedAssetTypes = { ...assetTypes };
            portfolioData.investments.forEach((investment) => {
              if (investment.symbol && quotesMap.has(investment.symbol)) {
                const quote = quotesMap.get(investment.symbol);
                const value = investment.quantity * quote.currentPrice;
                updatedAssetTypes[investment.type] =
                  (updatedAssetTypes[investment.type] || 0) + value;
              }
            });

            setAssetDistribution({
              labels: Object.keys(updatedAssetTypes),
              datasets: [
                {
                  data: Object.values(updatedAssetTypes),
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
            });

            // Try to fetch historical data
            const period =
              selectedTimeframe === "1W"
                ? "5d"
                : selectedTimeframe === "1M"
                ? "1mo"
                : "1y";

            console.log("Fetching historical data for period:", period);
            const historicalDataPromises = Array.from(symbols).map((symbol) =>
              axios
                .get(
                  `http://localhost:5000/api/market/historical/${symbol}?period=${period}`,
                  {
                    headers: {
                      Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                  }
                )
                .catch((error) => {
                  console.error(
                    `Error fetching historical data for ${symbol}:`,
                    error.response?.data || error.message
                  );
                  return null;
                })
            );

            console.log("Waiting for historical data responses...");
            const historicalResponses = await Promise.all(
              historicalDataPromises
            );
            console.log(
              "Historical data responses received:",
              historicalResponses.length
            );

            const historicalData = historicalResponses
              .filter((response) => response && response.data?.length > 0)
              .map((response) => response.data);

            console.log("Valid historical data sets:", historicalData.length);

            if (historicalData.length > 0) {
              // Process historical data
              const combinedData = new Map();
              historicalData.forEach((data, index) => {
                const symbol = Array.from(symbols)[index];
                const investment = portfolioData.investments.find(
                  (inv) => inv.symbol === symbol
                );

                if (investment && Array.isArray(data)) {
                  data.forEach((point) => {
                    if (!point?.date || !point?.close) return;
                    const date = new Date(point.date).toLocaleDateString();
                    const value = point.close * investment.quantity;
                    combinedData.set(
                      date,
                      (combinedData.get(date) || 0) + value
                    );
                  });
                }
              });

              if (combinedData.size > 0) {
                console.log("Setting performance data with historical values");
                const sortedDates = Array.from(combinedData.keys()).sort(
                  (a, b) => new Date(a) - new Date(b)
                );
                setPerformanceData({
                  labels: sortedDates,
                  datasets: [
                    {
                      label: "Portfolio Value",
                      data: sortedDates.map((date) => combinedData.get(date)),
                      borderColor: "#64ffda",
                      backgroundColor: "rgba(100, 255, 218, 0.1)",
                      fill: true,
                      tension: 0.4,
                    },
                  ],
                });
              } else {
                console.log("No valid combined data, using stored values");
                const storedPerformanceData = generateStoredPerformanceData(
                  portfolioData,
                  selectedTimeframe
                );
                setPerformanceData(storedPerformanceData);
                setUsingStoredData(true);
              }
            } else {
              console.log("No historical data available, using stored values");
              const storedPerformanceData = generateStoredPerformanceData(
                portfolioData,
                selectedTimeframe
              );
              setPerformanceData(storedPerformanceData);
              setUsingStoredData(true);
            }
          }
        } catch (err) {
          console.error(
            "Error in market data fetch:",
            err.response?.data || err.message
          );
          const errorMessage = handleApiError(err);
          setError(errorMessage);
          // Use stored values for performance chart
          const storedPerformanceData = generateStoredPerformanceData(
            portfolioData,
            selectedTimeframe
          );
          setPerformanceData(storedPerformanceData);
        }
      }
    } catch (err) {
      console.error("Error processing portfolio data:", err);
      setError("Error processing portfolio data. Using stored values.");
      setUsingStoredData(true);
    } finally {
      setLoading(false);
    }
  };

  const generateStoredPerformanceData = (portfolioData, timeframe) => {
    const now = new Date();
    const dates = [];
    const values = [];
    let days;

    switch (timeframe) {
      case "1W":
        days = 7;
        break;
      case "1M":
        days = 30;
        break;
      case "1Y":
        days = 365;
        break;
      default:
        days = 30;
    }

    // Generate dates
    for (let i = days; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      dates.push(date.toLocaleDateString());
    }

    // Calculate portfolio values using stored prices
    const totalValue = portfolioData.investments.reduce((sum, inv) => {
      return sum + inv.quantity * inv.currentPrice;
    }, 0);

    // Generate a simple linear progression for stored data
    const startValue = totalValue * 0.9; // Start at 90% of current value
    const endValue = totalValue;
    const step = (endValue - startValue) / days;

    for (let i = 0; i <= days; i++) {
      values.push(startValue + step * i);
    }

    return {
      labels: dates,
      datasets: [
        {
          label: "Portfolio Value (Stored)",
          data: values,
          borderColor: "#64ffda",
          backgroundColor: "rgba(100, 255, 218, 0.1)",
          fill: true,
          tension: 0.4,
          borderDash: [5, 5], // Dashed line for stored data
        },
      ],
    };
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
            if (!context.raw) return "";
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
            if (!context.raw) return "";
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
    console.log("Charts are loading...");
    return <div className="charts-loading">Loading charts...</div>;
  }

  if (error) {
    console.log("Charts error:", error);
    return <div className="charts-error">{error}</div>;
  }

  if (!hasData) {
    console.log("No data available for charts");
    return <div className="charts-empty">No investment data available</div>;
  }

  console.log("Rendering charts with data:", {
    assetDistribution: assetDistribution.labels.length > 0,
    performanceData: performanceData.labels.length > 0,
    usingStoredData,
  });

  return (
    <div className="portfolio-charts">
      <div className="charts-header">
        <div className="header-left">
          <h3>Portfolio Analytics</h3>
          {usingStoredData && (
            <span className="stored-data-badge">Using stored data</span>
          )}
        </div>
        <div className="timeframe-selector">
          {["1W", "1M", "1Y"].map((timeframe) => (
            <button
              key={timeframe}
              className={`timeframe-btn ${
                selectedTimeframe === timeframe ? "active" : ""
              }`}
              onClick={() => {
                console.log("Changing timeframe to:", timeframe);
                setSelectedTimeframe(timeframe);
              }}
            >
              {timeframe}
            </button>
          ))}
        </div>
      </div>

      {error && <div className="charts-warning">{error}</div>}

      <div className="charts-grid">
        <div className="chart-container">
          <h4>Asset Distribution</h4>
          <div className="pie-chart">
            {assetDistribution.labels.length > 0 ? (
              <Pie
                data={assetDistribution}
                options={pieOptions}
                key={`pie-${assetDistribution.labels.length}`} // Force re-render when data changes
              />
            ) : (
              <div className="chart-empty">No asset data available</div>
            )}
          </div>
        </div>

        <div className="chart-container">
          <h4>Portfolio Performance</h4>
          <div className="line-chart">
            {performanceData.labels.length > 0 ? (
              <Line
                data={performanceData}
                options={lineOptions}
                key={`line-${performanceData.labels.length}`} // Force re-render when data changes
              />
            ) : (
              <div className="chart-empty">No performance data available</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PortfolioCharts;
