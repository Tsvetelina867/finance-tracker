import React, { useEffect, useState } from "react";
import { fetchBudgetDetails } from "../api/budgetApi";
import "../styles/BudgetProgress.css";

const BudgetProgress = ({ currentAccount, transactions }) => {
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);

  const showOnDashboard = JSON.parse(
    localStorage.getItem("showOnDashboard") || "{}",
  );

  useEffect(() => {
    if (!currentAccount?.id) return;

    const load = async () => {
      setLoading(true);
      try {
        const res = await fetchBudgetDetails(currentAccount.id);
        setBudgets(res || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [currentAccount?.id]);

  if (!currentAccount) return null;
  if (loading) return <div>Loading...</div>;

  const filtered = budgets.filter((b) => showOnDashboard[b.id]);

  return (
    <div className="budget-progress-container">
      {filtered.length === 0 ? (
        <div>No budgets</div>
      ) : (
        filtered.map((budget) => {
          const spent = (transactions || [])
            .filter((t) => {
              const tDate = Array.isArray(t.date)
                ? new Date(t.date[0], t.date[1] - 1, t.date[2])
                : new Date(t.date);

              const start = new Date(budget.startDate);
              const end = new Date(budget.endDate);
              return (
                t.type === "EXPENSE" &&
                t.category?.id?.toString() ===
                  budget.category?.id?.toString() &&
                tDate >= start &&
                tDate <= end
              );
            })
            .reduce((sum, t) => sum + Number(t.amount || 0), 0);
          const progress = (spent / budget.budgetLimit) * 100;
          const remaining = budget.budgetLimit - spent;
          const exceeded = progress > 100;

          return (
            <div key={budget.id}>
              <h3>{budget.description}</h3>

              <p>
                Limit: {budget.budgetLimit} {currentAccount.currency}
              </p>

              <p>
                Spent: {spent.toFixed(2)} {currentAccount.currency}
              </p>

              <p style={{ color: exceeded ? "red" : "green" }}>
                {exceeded
                  ? `Over by ${Math.abs(remaining).toFixed(2)}`
                  : `Remaining ${remaining.toFixed(2)}`}
              </p>

              <div style={{ width: "100%", background: "#ddd" }}>
                <div
                  style={{
                    width: `${Math.min(progress, 100)}%`,
                    height: "10px",
                    background: exceeded ? "red" : "green",
                  }}
                />
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};

export default BudgetProgress;
