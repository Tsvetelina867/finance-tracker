package com.example.spring.finance.service;

import com.example.spring.finance.dtos.TransactionDTO;
import com.example.spring.finance.dtos.UserDTO;
import com.example.spring.finance.model.Account;
import com.example.spring.finance.model.Category;
import com.example.spring.finance.model.Transaction;
import com.example.spring.finance.model.enums.FlowType;
import com.example.spring.finance.repository.AccountRepository;
import com.example.spring.finance.repository.CategoryRepository;
import com.example.spring.finance.repository.TransactionRepository;
import com.example.spring.finance.repository.UserRepository;
import jakarta.transaction.Transactional;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class TransactionService {
    private final TransactionRepository transactionRepository;
    private final UserRepository userRepository;
    private final AccountRepository accountRepository;
    private final CategoryRepository categoryRepository;

    public TransactionService(TransactionRepository transactionRepository, UserRepository userRepository, AccountRepository accountRepository, CategoryRepository categoryRepository) {
        this.transactionRepository = transactionRepository;
        this.userRepository = userRepository;
        this.accountRepository = accountRepository;
        this.categoryRepository = categoryRepository;
    }
    private void validateAndSetAccountAndCategory(Transaction transaction, Transaction inputTransaction) {
        Account account = accountRepository.findById(inputTransaction.getAccount().getId())
                .orElseThrow(() -> new RuntimeException("Account not found"));
        transaction.setAccount(account);

        if (inputTransaction.getCategory() != null && inputTransaction.getCategory().getId() != null) {
            Category category = categoryRepository.findById(inputTransaction.getCategory().getId())
                    .orElseThrow(() -> new RuntimeException("Category not found"));
            transaction.setCategory(category);
        } else {
            transaction.setCategory(null);
        }
    }
    public Transaction addTransaction(Transaction transaction) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();

        transaction.setUser(userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found")));

        validateAndSetAccountAndCategory(transaction, transaction);

        return transactionRepository.save(transaction);
    }

    public Transaction updateTransaction(Long id, TransactionDTO updatedTransactionDTO) {
        Transaction transaction = transactionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Transaction not found"));

        transaction.setDescription(updatedTransactionDTO.getDescription());
        transaction.setAmount(updatedTransactionDTO.getAmount());
        transaction.setDate(updatedTransactionDTO.getDate());
        transaction.setType(FlowType.valueOf(updatedTransactionDTO.getType()));

        if (updatedTransactionDTO.getCategoryId() != null) {
            Category category = categoryRepository.findById(updatedTransactionDTO.getCategoryId())
                    .orElseThrow(() -> new RuntimeException("Category not found"));
            transaction.setCategory(category);
        } else {
            transaction.setCategory(null);
        }

        Account account = accountRepository.findById(updatedTransactionDTO.getAccountId())
                .orElseThrow(() -> new RuntimeException("Account not found"));
        transaction.setAccount(account);

        return transactionRepository.save(transaction);
    }


    @Transactional
    public List<TransactionDTO> getTransactionsForCurrentUser() {

        String username = SecurityContextHolder.getContext().getAuthentication().getName();

        List<Transaction> transactions = transactionRepository.findByUserUsername(username);

        return transactions.stream()
                .map(t -> new TransactionDTO(
                        t.getId(),
                        t.getDescription(),
                        t.getAmount(),
                        t.getDate(),
                        t.getType().toString(),     
                        t.getCategory().getId(),
                        t.getAccount().getId(),
                                new UserDTO(
                                    t.getUser().getId(),
                                    t.getUser().getUsername(),
                                    t.getUser().getEmail())))
                .toList();
    }

    public TransactionDTO getTransactionById(Long id) {
        Optional<Transaction> transaction = transactionRepository.findById(id);
            return transaction.map(t -> new TransactionDTO(
                            t.getId(),
                            t.getDescription(),
                            t.getAmount(),
                            t.getDate(),
                            t.getType().toString(),
                            t.getCategory().getId(),
                            t.getAccount().getId(),
                            new UserDTO(
                                    t.getUser().getId(),
                                    t.getUser().getUsername(),
                                    t.getUser().getEmail())))
                    .orElseThrow(() -> new RuntimeException("Transaction with ID " + id + " not found"));

    }


    public void deleteTransaction(Long id) {
        this.transactionRepository.deleteById(id);
    }
}
