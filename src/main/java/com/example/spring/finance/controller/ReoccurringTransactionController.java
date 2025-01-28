package com.example.spring.finance.controller;

import com.example.spring.finance.dtos.ReoccurringTransactionDTO;
import com.example.spring.finance.dtos.TransactionDTO;
import com.example.spring.finance.dtos.UserDTO;
import com.example.spring.finance.model.ReoccurringTransaction;
import com.example.spring.finance.service.ReoccurringTransactionService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
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

    @GetMapping("/process")
    public ResponseEntity<List<TransactionDTO>> processRecurringTransactions() {
        List<TransactionDTO> transactions = reoccurringTransactionService.processRecurringTransactions();
        return ResponseEntity.ok(transactions);
    }

    @GetMapping("/catch-up")
    public ResponseEntity<List<TransactionDTO>> catchUpRecurringTransactions(
            @RequestParam LocalDate startDate,
            @RequestParam LocalDate endDate) {
        List<TransactionDTO> transactions = reoccurringTransactionService.catchUpRecurringTransactions(startDate, endDate);
        return ResponseEntity.ok(transactions);
    }

    @PostMapping
    public ResponseEntity<ReoccurringTransaction> createReoccurringTransaction(@RequestBody @Valid ReoccurringTransaction reoccurringTransaction) {
        ReoccurringTransaction createdTransaction = reoccurringTransactionService.addReoccurringTransaction(reoccurringTransaction);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdTransaction);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ReoccurringTransactionDTO> updateReoccurringTransaction(@PathVariable Long id, @RequestBody ReoccurringTransactionDTO updatedReoccurringTransactionDTO) {
        ReoccurringTransaction updatedReoccurringTransaction = reoccurringTransactionService.updateReoccurringTransaction(id, updatedReoccurringTransactionDTO);

        ReoccurringTransactionDTO responseDTO = new ReoccurringTransactionDTO(
                updatedReoccurringTransaction.getDescription(),
                updatedReoccurringTransaction.getAmount(),
                updatedReoccurringTransaction.getStartDate(),
                updatedReoccurringTransaction.getEndDate(),
                updatedReoccurringTransaction.getFrequency().toString(),
                updatedReoccurringTransaction.getCategory() != null ? updatedReoccurringTransaction.getCategory().getId() : null,
                updatedReoccurringTransaction.getAccount().getId(),
                new UserDTO(
                        updatedReoccurringTransaction.getUser().getId(),
                        updatedReoccurringTransaction.getUser().getUsername(),
                        updatedReoccurringTransaction.getUser().getEmail()),
                updatedReoccurringTransaction.getCurrency()
        );
        return ResponseEntity.ok(responseDTO);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteReoccurringTransaction(@PathVariable Long id) {
        reoccurringTransactionService.deleteReoccurringTransaction(id);
        return ResponseEntity.noContent().build();
    }

}
