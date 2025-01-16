package com.example.spring.finance.service;

import com.example.spring.finance.dtos.BudgetDTO;
import com.example.spring.finance.dtos.UserDTO;
import com.example.spring.finance.model.Account;
import com.example.spring.finance.model.Budget;
import com.example.spring.finance.model.Category;
import com.example.spring.finance.model.User;
import com.example.spring.finance.repository.*;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
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
    private final UserRepository userRepository;

    public BudgetService(BudgetRepository budgetRepository, TransactionRepository transactionRepository, CategoryRepository categoryRepository, AccountRepository accountRepository, UserRepository userRepository) {
        this.budgetRepository = budgetRepository;
        this.transactionRepository = transactionRepository;
        this.categoryRepository = categoryRepository;
        this.accountRepository = accountRepository;
        this.userRepository = userRepository;
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
        budget.setStartDate(updatedBudgetDTO.getStartDate());
        budget.setEndDate(updatedBudgetDTO.getEndDate());


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

        budget.setUser(userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found")));

        if (budget.getCategory() != null && budget.getCategory().getId() != null) {
            Category category = categoryRepository.findById(budget.getCategory().getId())
                    .orElseThrow(() -> new RuntimeException("Category not found"));
            budget.setCategory(category);
        }

        Account account = accountRepository.findById(budget.getAccount().getId())
                .orElseThrow(() -> new RuntimeException("Account not found"));
        budget.setAccount(account);


        return budgetRepository.save(budget);
    }

    public void deleteBudget(Long id) {
        this.budgetRepository.deleteById(id);
    }
}


