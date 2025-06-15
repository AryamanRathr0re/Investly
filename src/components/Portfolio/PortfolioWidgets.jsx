import React, { useState, useEffect } from "react";
import axios from "axios";
import "./PortfolioWidgets.css";

const PortfolioWidgets = ({ portfolioData, onWidgetSelect }) => {
  const [widgets, setWidgets] = useState([]);
  const [marketData, setMarketData] = useState({});
  const [loading, setLoading] = useState(true);

  // Initialize default widgets
  useEffect(() => {
    if (portfolioData?.investments) {
      const defaultWidgets = [
        {
          id: "asset-distribution",
          type: "chart",
          title: "Asset Distribution",
          size: "large",
          enabled: true,
        },
        {
          id: "portfolio-performance",
          type: "chart",
          title: "Portfolio Performance",
          size: "large",
          enabled: true,
        },
        {
          id: "market-overview",
          type: "market",
          title: "Market Overview",
          size: "medium",
          enabled: true,
        },
        {
          id: "top-performers",
          type: "list",
          title: "Top Performers",
          size: "small",
          enabled: true,
        },
      ];
      setWidgets(defaultWidgets);
    }
  }, [portfolioData]);

  // Fetch market data for widgets
  useEffect(() => {
    const fetchMarketData = async () => {
      if (!portfolioData?.investments?.length) return;

      try {
        setLoading(true);
        const symbols = portfolioData.investments.map((inv) => inv.symbol);
        const response = await axios.post(
          "http://localhost:5000/api/market/quotes",
          { symbols },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        if (response.data) {
          const marketDataMap = {};
          response.data.forEach((quote) => {
            marketDataMap[quote.symbol] = quote;
          });
          setMarketData(marketDataMap);
        }
      } catch (err) {
        console.error("Error fetching market data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMarketData();
    const interval = setInterval(fetchMarketData, 300000); // Refresh every 5 minutes
    return () => clearInterval(interval);
  }, [portfolioData]);

  const toggleWidget = (widgetId) => {
    setWidgets((prevWidgets) =>
      prevWidgets.map((widget) =>
        widget.id === widgetId
          ? { ...widget, enabled: !widget.enabled }
          : widget
      )
    );
  };

  const renderWidgetContent = (widget) => {
    switch (widget.type) {
      case "market":
        return (
          <div className="market-overview">
            {portfolioData?.investments?.map((investment) => {
              const quote = marketData[investment.symbol];
              if (!quote) return null;

              return (
                <div
                  key={investment.symbol}
                  className="market-item"
                  onClick={() => onWidgetSelect(investment)}
                >
                  <div className="market-item-header">
                    <span className="symbol">{investment.symbol}</span>
                    <span
                      className={`change ${
                        quote.change >= 0 ? "positive" : "negative"
                      }`}
                    >
                      {quote.change >= 0 ? "+" : ""}
                      {quote.change.toFixed(2)} (
                      {quote.changePercent.toFixed(2)}%)
                    </span>
                  </div>
                  <div className="market-item-price">
                    ${quote.currentPrice.toFixed(2)}
                  </div>
                </div>
              );
            })}
          </div>
        );

      case "list":
        const sortedInvestments = [...portfolioData.investments]
          .sort((a, b) => {
            const aChange = marketData[a.symbol]?.changePercent || 0;
            const bChange = marketData[b.symbol]?.changePercent || 0;
            return bChange - aChange;
          })
          .slice(0, 5);

        return (
          <div className="top-performers-list">
            {sortedInvestments.map((investment) => {
              const quote = marketData[investment.symbol];
              if (!quote) return null;

              return (
                <div
                  key={investment.symbol}
                  className="performer-item"
                  onClick={() => onWidgetSelect(investment)}
                >
                  <span className="symbol">{investment.symbol}</span>
                  <span
                    className={`change ${
                      quote.changePercent >= 0 ? "positive" : "negative"
                    }`}
                  >
                    {quote.changePercent >= 0 ? "+" : ""}
                    {quote.changePercent.toFixed(2)}%
                  </span>
                </div>
              );
            })}
          </div>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return <div className="widgets-loading">Loading widget data...</div>;
  }

  return (
    <div className="portfolio-widgets">
      <div className="widgets-grid">
        {widgets.map(
          (widget) =>
            widget.enabled && (
              <div key={widget.id} className={`widget widget-${widget.size}`}>
                <div className="widget-header">
                  <h3>{widget.title}</h3>
                  <button
                    className="widget-toggle"
                    onClick={() => toggleWidget(widget.id)}
                  >
                    Hide
                  </button>
                </div>
                <div className="widget-content">
                  {renderWidgetContent(widget)}
                </div>
              </div>
            )
        )}
      </div>
      <div className="widgets-controls">
        {widgets.map((widget) => (
          <button
            key={widget.id}
            className={`widget-control-btn ${widget.enabled ? "active" : ""}`}
            onClick={() => toggleWidget(widget.id)}
          >
            {widget.enabled ? "Hide" : "Show"} {widget.title}
          </button>
        ))}
      </div>
    </div>
  );
};

export default PortfolioWidgets;
