package com.example.spring.finance.service;

import com.example.spring.finance.model.Goal;
import com.example.spring.finance.repository.GoalRepository;
import com.example.spring.finance.repository.TransactionRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;

@Service
public class GoalService {
    private final GoalRepository goalRepository;
    private final TransactionRepository transactionRepository;

    public GoalService(GoalRepository goalRepository, TransactionRepository transactionRepository) {
        this.goalRepository = goalRepository;
        this.transactionRepository = transactionRepository;
    }

    public BigDecimal calculateGoalProgress(Long goalId) {
        Goal goal = goalRepository.findById(goalId)
                .orElseThrow(() -> new IllegalArgumentException("Goal not found with id: " + goalId));

        // Calculate progress as a percentage
        return goal.getCurrentAmount()
                .divide(goal.getTargetAmount(), 2, RoundingMode.HALF_UP)
                .multiply(BigDecimal.valueOf(100));
    }

    public boolean isGoalAchieved(Long goalId) {
        Goal goal = goalRepository.findById(goalId)
                .orElseThrow(() -> new IllegalArgumentException("Goal not found with id: " + goalId));

        return goal.getCurrentAmount().compareTo(goal.getTargetAmount()) >= 0;
    }
}

