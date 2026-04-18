import { useEffect, useState } from "react";
import goalsApi from "../api/goalsApi";

const useGoals = (currentAccount) => {
  const [goals, setGoals] = useState([]);
  const [loadingGoals, setLoadingGoals] = useState(true);

  const accountId = currentAccount?.id;

  const fetchGoals = async () => {
    if (!accountId) return;

    try {
      setLoadingGoals(true);
      const data = await goalsApi.fetchGoalsWithDetails(accountId);
      setGoals(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error loading goals:", err);
      setGoals([]);
    } finally {
      setLoadingGoals(false);
    }
  };

  const addGoal = async (goalData) => {
    const newGoal = await goalsApi.addGoal({
      ...goalData,
      account: { id: accountId },
    });

    setGoals((prev) => [...prev, newGoal]);
    return newGoal;
  };

  const updateGoal = async (id, data) => {
    const updated = await goalsApi.updateGoal(id, data);

    setGoals((prev) => prev.map((g) => (g.id === id ? updated : g)));

    return updated;
  };

  const deleteGoal = async (id) => {
    await goalsApi.deleteGoal(id);

    setGoals((prev) => prev.filter((g) => g.id !== id));
  };

  useEffect(() => {
    fetchGoals();
  }, [accountId]);

  return {
    goals,
    setGoals,
    loadingGoals,
    addGoal,
    updateGoal,
    deleteGoal,
    refetchGoals: fetchGoals,
  };
};

export default useGoals;
