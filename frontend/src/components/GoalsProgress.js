import React from 'react';
import GoalCard from './GoalCard';


const GoalsProgress = ({ goals }) => {
  if (!goals || goals.length === 0) {
    return <p>No goals available for this account.</p>;
  }

  return (
    <div className="goals-container">
      <div className="goal-cards-wrapper">
        {goals.map((goal) => (
          <GoalCard key={goal.id} goal={goal} />
        ))}
      </div>
    </div>
  );
};

export default GoalsProgress;
