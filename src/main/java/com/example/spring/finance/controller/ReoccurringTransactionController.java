package com.example.spring.finance.controller;

import com.example.spring.finance.dtos.TransactionDTO;
import com.example.spring.finance.service.ReoccurringTransactionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/finance/reoccurring-transactions")
public class ReoccurringTransactionController {
    private final ReoccurringTransactionService reoccurringTransactionService;

    public ReoccurringTransactionController(ReoccurringTransactionService reoccurringTransactionService) {
        this.reoccurringTransactionService = reoccurringTransactionService;
    }

    // Default behavior: process only today's transactions
    @GetMapping("/process")
    public ResponseEntity<List<TransactionDTO>> processRecurringTransactions() {
        List<TransactionDTO> transactions = reoccurringTransactionService.processRecurringTransactions();
        return ResponseEntity.ok(transactions);
    }

    // Catch-Up Mode: process missed transactions for a specific date range
    @GetMapping("/catch-up")
    public ResponseEntity<List<TransactionDTO>> catchUpRecurringTransactions(
            @RequestParam LocalDate startDate,
            @RequestParam LocalDate endDate) {
        List<TransactionDTO> transactions = reoccurringTransactionService.catchUpRecurringTransactions(startDate, endDate);
        return ResponseEntity.ok(transactions);
    }
}
