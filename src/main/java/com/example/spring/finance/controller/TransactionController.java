package com.example.spring.finance.controller;

import com.example.spring.finance.dtos.TransactionDTO;
import com.example.spring.finance.dtos.UserDTO;
import com.example.spring.finance.model.Transaction;
import com.example.spring.finance.service.TransactionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/finance/transactions")
public class TransactionController {
    @Autowired
    private TransactionService transactionService;

    public TransactionController(TransactionService transactionService) {
        this.transactionService = transactionService;
    }

    @GetMapping
    public ResponseEntity<List<TransactionDTO>> getAllTransactions() {
        return ResponseEntity.ok(transactionService.getTransactionsForCurrentUser());
    }

    @GetMapping("/{id}")
    public ResponseEntity<TransactionDTO> getTransaction(@PathVariable Long id) {
        return ResponseEntity.ok(transactionService.getTransactionById(id));
    }
    @GetMapping("/search")
    public List<Transaction> searchTransactions(@RequestParam String keyword) {
        return transactionService.searchTransactions(keyword);
    }
    @PostMapping
    public ResponseEntity<Transaction> createTransaction(@RequestBody Transaction transaction) {
        return ResponseEntity.status(HttpStatus.CREATED).body(transactionService.addTransaction(transaction));
    }

    @PutMapping("/{id}")
    public ResponseEntity<TransactionDTO> updateTransaction(@PathVariable Long id, @RequestBody TransactionDTO updatedTransactionDTO) {
        Transaction updatedTransaction = transactionService.updateTransaction(id, updatedTransactionDTO);
        TransactionDTO responseDTO = new TransactionDTO(
                updatedTransaction.getId(),
                updatedTransaction.getDescription(),
                updatedTransaction.getAmount(),
                updatedTransaction.getDate(),
                updatedTransaction.getType().toString(),
                updatedTransaction.getCategory() != null ? updatedTransaction.getCategory().getId() : null,
                updatedTransaction.getAccount().getId(),
                new UserDTO(
                        updatedTransaction.getUser().getId(),
                        updatedTransaction.getUser().getUsername(),
                        updatedTransaction.getUser().getEmail())
        );
        return ResponseEntity.ok(responseDTO);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTransaction(@PathVariable Long id) {
        transactionService.deleteTransaction(id);
        return ResponseEntity.noContent().build();
    }
}
