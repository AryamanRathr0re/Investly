import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./PortfolioOverview.css";

const PortfolioOverview = () => {
  const navigate = useNavigate();
  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [newInvestment, setNewInvestment] = useState({
    symbol: "",
    name: "",
    type: "Stock",
    quantity: "",
    purchasePrice: "",
    purchaseDate: "",
    currentPrice: "",
  });

  useEffect(() => {
    fetchPortfolio();
  }, []);

  const fetchPortfolio = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      const response = await fetch("http://localhost:5000/api/portfolio", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch portfolio");
      }

      const data = await response.json();
      setPortfolio(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddInvestment = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        "http://localhost:5000/api/portfolio/investments",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(newInvestment),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to add investment");
      }

      const updatedPortfolio = await response.json();
      setPortfolio(updatedPortfolio);
      setShowAddForm(false);
      setNewInvestment({
        symbol: "",
        name: "",
        type: "Stock",
        quantity: "",
        purchasePrice: "",
        purchaseDate: "",
        currentPrice: "",
      });
    } catch (err) {
      setError(err.message);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewInvestment((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const updatePrices = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        "http://localhost:5000/api/portfolio/update-prices",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update prices");
      }

      const updatedPortfolio = await response.json();
      setPortfolio(updatedPortfolio);
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return <div className="portfolio-loading">Loading portfolio data...</div>;
  }

  if (error) {
    return <div className="portfolio-error">{error}</div>;
  }

  return (
    <div className="portfolio-overview">
      <div className="portfolio-header">
        <h2>Portfolio Overview</h2>
        <div className="portfolio-actions">
          <button
            onClick={() => setShowAddForm(true)}
            className="add-investment-btn"
          >
            Add Investment
          </button>
          <button onClick={updatePrices} className="update-prices-btn">
            Update Prices
          </button>
        </div>
      </div>

      <div className="portfolio-summary">
        <div className="summary-card">
          <h3>Total Value</h3>
          <p className="value">${portfolio?.totalValue.toFixed(2)}</p>
        </div>
        <div className="summary-card">
          <h3>Total Investment</h3>
          <p className="value">${portfolio?.totalInvestment.toFixed(2)}</p>
        </div>
        <div className="summary-card">
          <h3>Total Gain/Loss</h3>
          <p
            className={`value ${
              portfolio?.totalGainLoss >= 0 ? "positive" : "negative"
            }`}
          >
            ${portfolio?.totalGainLoss.toFixed(2)}
          </p>
          <p
            className={`percentage ${
              portfolio?.gainLossPercentage >= 0 ? "positive" : "negative"
            }`}
          >
            {portfolio?.gainLossPercentage.toFixed(2)}%
          </p>
        </div>
      </div>

      {showAddForm && (
        <div className="add-investment-form">
          <h3>Add New Investment</h3>
          <form onSubmit={handleAddInvestment}>
            <div className="form-group">
              <label>Symbol</label>
              <input
                type="text"
                name="symbol"
                value={newInvestment.symbol}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Name</label>
              <input
                type="text"
                name="name"
                value={newInvestment.name}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Type</label>
              <select
                name="type"
                value={newInvestment.type}
                onChange={handleInputChange}
                required
              >
                <option value="Stock">Stock</option>
                <option value="Crypto">Crypto</option>
                <option value="ETF">ETF</option>
                <option value="Mutual Fund">Mutual Fund</option>
                <option value="Bond">Bond</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="form-group">
              <label>Quantity</label>
              <input
                type="number"
                name="quantity"
                value={newInvestment.quantity}
                onChange={handleInputChange}
                min="0"
                step="0.000001"
                required
              />
            </div>
            <div className="form-group">
              <label>Purchase Price</label>
              <input
                type="number"
                name="purchasePrice"
                value={newInvestment.purchasePrice}
                onChange={handleInputChange}
                min="0"
                step="0.000001"
                required
              />
            </div>
            <div className="form-group">
              <label>Purchase Date</label>
              <input
                type="date"
                name="purchaseDate"
                value={newInvestment.purchaseDate}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Current Price</label>
              <input
                type="number"
                name="currentPrice"
                value={newInvestment.currentPrice}
                onChange={handleInputChange}
                min="0"
                step="0.000001"
                required
              />
            </div>
            <div className="form-actions">
              <button type="submit" className="submit-btn">
                Add Investment
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="cancel-btn"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="investments-list">
        <h3>Your Investments</h3>
        <div className="investments-table">
          <table>
            <thead>
              <tr>
                <th>Symbol</th>
                <th>Name</th>
                <th>Type</th>
                <th>Quantity</th>
                <th>Purchase Price</th>
                <th>Current Price</th>
                <th>Value</th>
                <th>Gain/Loss</th>
                <th>% Change</th>
              </tr>
            </thead>
            <tbody>
              {portfolio?.investments.map((investment) => {
                const value = investment.quantity * investment.currentPrice;
                const gainLoss =
                  value - investment.quantity * investment.purchasePrice;
                const percentageChange =
                  ((investment.currentPrice - investment.purchasePrice) /
                    investment.purchasePrice) *
                  100;

                return (
                  <tr key={investment._id}>
                    <td>{investment.symbol}</td>
                    <td>{investment.name}</td>
                    <td>{investment.type}</td>
                    <td>{investment.quantity.toFixed(6)}</td>
                    <td>${investment.purchasePrice.toFixed(2)}</td>
                    <td>${investment.currentPrice.toFixed(2)}</td>
                    <td>${value.toFixed(2)}</td>
                    <td className={gainLoss >= 0 ? "positive" : "negative"}>
                      ${gainLoss.toFixed(2)}
                    </td>
                    <td
                      className={
                        percentageChange >= 0 ? "positive" : "negative"
                      }
                    >
                      {percentageChange.toFixed(2)}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PortfolioOverview;
