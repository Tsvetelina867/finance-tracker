import React, { useState, useEffect } from "react";
import GoalCard from "./GoalCard";
import AddGoalModal from "./AddGoalModal";

const GoalsProgress = ({ goals = [], loading, onAddGoal, currentAccount }) => {
  const [showAddGoalModal, setShowAddGoalModal] = useState(false);

  const updateGoalProgress = (goal) => {
    const progressPercent = (goal.currentAmount / goal.targetAmount) * 100;
    const cappedProgress = Math.min(progressPercent, 100);

    return {
      ...goal,
      progress: cappedProgress,
      status: cappedProgress === 100 ? "Completed" : goal.status,
    };
  };

  const updatedGoals = Array.isArray(goals)
    ? goals.map((goal) =>
        goal.status !== "Completed" ? updateGoalProgress(goal) : goal,
      )
    : [];

  return (
    <div className="goals-container">
      <button
        className="add-goal-button"
        onClick={() => setShowAddGoalModal(true)}
      >
        ➕ Add New Goal
      </button>

      {updatedGoals.length === 0 ? (
        <p>No goals available for this account.</p>
      ) : (
        <div className="goal-cards-wrapper">
          {updatedGoals.map((goal) => (
            <GoalCard key={goal.id} goal={goal} />
          ))}
        </div>
      )}

      <AddGoalModal
        isOpen={showAddGoalModal}
        onClose={() => setShowAddGoalModal(false)}
        onGoalAdded={onAddGoal}
        currentAccount={currentAccount}
      />
    </div>
  );
};

export default GoalsProgress;
