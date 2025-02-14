import React, { useState, useEffect } from "react";
import GoalCard from "./GoalCard";
import AddGoalModal from "./AddGoalModal";

const GoalsProgress = ({ goals, currentAccount, onGoalAdded }) => {
  const [showAddGoalModal, setShowAddGoalModal] = useState(false);

  // Function to calculate and update progress and status
  const updateGoalProgress = (goal) => {
    // Calculate the progress percentage
    const progressPercent = (goal.currentAmount / goal.targetAmount) * 100;

    // Ensure the progress is capped at 100%
    const cappedProgress = Math.min(progressPercent, 100);

    // Automatically mark as completed if progress is 100%
    if (cappedProgress === 100) {
      goal.status = 'Completed';  // Update goal status to completed
    }

    // Update the goal with the new progress
    goal.progress = cappedProgress;

    return goal;
  };

  // Function to get updated goals with the progress and status
  const getUpdatedGoals = () => {
    return goals.map((goal) => {
      // Only update progress and status for goals that need it
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
        onGoalAdded={onGoalAdded} // Pass function to update state in Dashboard.js
        currentAccount={currentAccount} // Ensure account is passed
      />
    </div>
  );
};

export default GoalsProgress;
