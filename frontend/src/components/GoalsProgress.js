import React, { useState, useEffect } from "react";
import GoalCard from "./GoalCard";
import AddGoalModal from "./AddGoalModal";

const GoalsProgress = ({ goals, currentAccount, onGoalAdded }) => {
  const [showAddGoalModal, setShowAddGoalModal] = useState(false);

  const updateGoalProgress = (goal) => {
    const progressPercent = (goal.currentAmount / goal.targetAmount) * 100;

    const cappedProgress = Math.min(progressPercent, 100);

    if (cappedProgress === 100) {
      goal.status = 'Completed';
    }

    goal.progress = cappedProgress;

    return goal;
  };

  const getUpdatedGoals = () => {
    return goals.map((goal) => {
      if (goal.status !== 'Completed') {
        return updateGoalProgress(goal);
      }
      return goal;
    });
  };

  const updatedGoals = getUpdatedGoals();

  return (
    <div className="goals-container">
      <button className="add-goal-button" onClick={() => setShowAddGoalModal(true)}>
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
        onGoalAdded={onGoalAdded}
        currentAccount={currentAccount}
      />
    </div>
  );
};

export default GoalsProgress;
