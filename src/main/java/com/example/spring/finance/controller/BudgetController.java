package com.example.spring.finance.controller;

import com.example.spring.finance.dtos.BudgetDTO;
import com.example.spring.finance.dtos.UserDTO;
import com.example.spring.finance.model.Budget;
import com.example.spring.finance.repository.BudgetRepository;
import com.example.spring.finance.service.BudgetService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.Optional;

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

    @PostMapping
    public ResponseEntity<Budget> createBudget(@RequestBody Budget budget) {
        return ResponseEntity.status(HttpStatus.CREATED).body(budgetService.addBudget(budget));
    }

    @PutMapping("/{id}")
    public ResponseEntity<BudgetDTO> updateBudget(@PathVariable Long id, @RequestBody BudgetDTO updatedBudgetDTO) {
        Budget budget = budgetService.updateBudget(id, updatedBudgetDTO);

        BudgetDTO responseDTO = new BudgetDTO(
                budget.getDescription(),
                budget.getBudgetLimit(),
                budget.getCurrentSpending(),
                budget.getCategory() != null ? budget.getCategory().getId() : null,
                budget.getAccount().getId(),
                new UserDTO(
                        budget.getUser().getId(),
                        budget.getUser().getUsername(),
                        budget.getUser().getEmail()
                )
        );
        return ResponseEntity.ok(responseDTO);
    }
}

