package com.example.spring.finance.service;

import com.example.spring.finance.model.Budget;
import com.example.spring.finance.repository.BudgetRepository;
import com.example.spring.finance.repository.TransactionRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;

@Service
public class BudgetService {
    private final BudgetRepository budgetRepository;
    private final TransactionRepository transactionRepository;

    public BudgetService(BudgetRepository budgetRepository, TransactionRepository transactionRepository) {
        this.budgetRepository = budgetRepository;
        this.transactionRepository = transactionRepository;
    }

    public BigDecimal calculateBudgetProgress(Long budgetId) {
        Budget budget = budgetRepository.findById(budgetId)
                .orElseThrow(() -> new IllegalArgumentException("Budget not found with id: " + budgetId));

        // Sum all transaction amounts for the specified budget time frame, category, and account
        BigDecimal totalSpending = transactionRepository.sumByCategoryAndAccountAndDateRange(
                budget.getCategory(),
                budget.getAccount(),
                budget.getStartDate(),
                budget.getEndDate()
        );

        if (totalSpending == null) {
            totalSpending = BigDecimal.ZERO;
        }

        // Calculate progress as a percentage
        BigDecimal progress = totalSpending.divide(budget.getBudgetLimit(), 2, RoundingMode.HALF_UP).multiply(BigDecimal.valueOf(100));
        return progress.min(BigDecimal.valueOf(100)); // Capping at 100%
    }

    public boolean isBudgetExceeded(Long budgetId) {
        Budget budget = budgetRepository.findById(budgetId)
                .orElseThrow(() -> new IllegalArgumentException("Budget not found with id: " + budgetId));

        BigDecimal totalSpending = transactionRepository.sumByCategoryAndAccountAndDateRange(
                budget.getCategory(),
                budget.getAccount(),
                budget.getStartDate(),
                budget.getEndDate()
        );

        return totalSpending != null && totalSpending.compareTo(budget.getBudgetLimit()) > 0;
    }
}

