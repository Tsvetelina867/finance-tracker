package com.example.spring.finance.controller;

import com.example.spring.finance.service.BudgetService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;

@RestController
@RequestMapping("/api/finance/budgets")
public class BudgetController {
    private final BudgetService budgetService;

    public BudgetController(BudgetService budgetService) {
        this.budgetService = budgetService;
    }

    @GetMapping("/{budgetId}/progress")
    public ResponseEntity<BigDecimal> getBudgetProgress(@PathVariable Long budgetId) {
        BigDecimal progress = budgetService.calculateBudgetProgress(budgetId);
        return ResponseEntity.ok(progress);
    }

    @GetMapping("/{budgetId}/exceeded")
    public ResponseEntity<Boolean> isBudgetExceeded(@PathVariable Long budgetId) {
        boolean exceeded = budgetService.isBudgetExceeded(budgetId);
        return ResponseEntity.ok(exceeded);
    }
}

