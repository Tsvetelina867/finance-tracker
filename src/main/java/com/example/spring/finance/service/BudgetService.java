package com.example.spring.finance.service;

import com.example.spring.finance.dtos.BudgetDTO;
import com.example.spring.finance.dtos.UserDTO;
import com.example.spring.finance.model.Account;
import com.example.spring.finance.model.Budget;
import com.example.spring.finance.model.Category;
import com.example.spring.finance.model.User;
import com.example.spring.finance.repository.AccountRepository;
import com.example.spring.finance.repository.BudgetRepository;
import com.example.spring.finance.repository.CategoryRepository;
import com.example.spring.finance.repository.TransactionRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Optional;

@Service
public class BudgetService {
    private final BudgetRepository budgetRepository;
    private final TransactionRepository transactionRepository;
    private final CategoryRepository categoryRepository;
    private final AccountRepository accountRepository;

    public BudgetService(BudgetRepository budgetRepository, TransactionRepository transactionRepository, CategoryRepository categoryRepository, AccountRepository accountRepository) {
        this.budgetRepository = budgetRepository;
        this.transactionRepository = transactionRepository;
        this.categoryRepository = categoryRepository;
        this.accountRepository = accountRepository;
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

    public Budget updateBudget(Long id, BudgetDTO updatedBudgetDTO) {
        // Fetch the existing budget or throw a custom exception
        Budget budget = budgetRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Budget not found with ID: " + id));

        // Update fields from DTO
        budget.setDescription(updatedBudgetDTO.getDescription());
        budget.setBudgetLimit(updatedBudgetDTO.getBudgetLimit());


        // Ensure `currentSpending` is not manually updatable if it's calculated elsewhere
        if (updatedBudgetDTO.getCurrentSpending() != null) {
            throw new IllegalArgumentException("Current spending cannot be updated manually.");
        }

        // Update the category, if provided
        if (updatedBudgetDTO.getCategoryId() != null) {
            Category category = categoryRepository.findById(updatedBudgetDTO.getCategoryId())
                    .orElseThrow(() -> new RuntimeException("Category not found with ID: " + updatedBudgetDTO.getCategoryId()));
            budget.setCategory(category);
        } else {
            budget.setCategory(null); // Allow clearing the category
        }

        // Update the account, ensuring it exists
        Account account = accountRepository.findById(updatedBudgetDTO.getAccountId())
                .orElseThrow(() -> new RuntimeException("Account not found with ID: " + updatedBudgetDTO.getAccountId()));
        budget.setAccount(account);

        // Save and return the updated budget
        return budgetRepository.save(budget);
    }


    public Budget addBudget(Budget budget) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();

        return budget;
    }
}


