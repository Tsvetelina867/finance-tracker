package com.example.spring.finance.service;

import com.example.spring.finance.dtos.AccountDTO;
import com.example.spring.finance.dtos.CategoryDTO;
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
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class TransactionService {
    private final TransactionRepository transactionRepository;
    private final UserRepository userRepository;
    private final AccountRepository accountRepository;
    private final CategoryRepository categoryRepository;
    private final ExchangeRateService exchangeRateService;

    public TransactionService(TransactionRepository transactionRepository, UserRepository userRepository, AccountRepository accountRepository, CategoryRepository categoryRepository, ExchangeRateService exchangeRateService) {
        this.transactionRepository = transactionRepository;
        this.userRepository = userRepository;
        this.accountRepository = accountRepository;
        this.categoryRepository = categoryRepository;
        this.exchangeRateService = exchangeRateService;
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
        BigDecimal convertedAmount = convertToAccountCurrency(transaction);
        transaction.setAmount(convertedAmount);
        if (transaction.getAmount() == null || transaction.getAmount().compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("Amount cannot be negative or null");
        }
        transaction.setCurrency(transaction.getAccount().getCurrency());

        return transactionRepository.save(transaction);
    }

    public Transaction updateTransaction(Long id, TransactionDTO updatedTransactionDTO) {
        Transaction transaction = transactionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Transaction not found"));

        transaction.setDescription(updatedTransactionDTO.getDescription());
        transaction.setAmount(updatedTransactionDTO.getAmount());
        transaction.setDate(updatedTransactionDTO.getDate());
        transaction.setType(FlowType.valueOf(updatedTransactionDTO.getType()));
        transaction.setCurrency(updatedTransactionDTO.getCurrency());

        if (updatedTransactionDTO.getCategory() != null && updatedTransactionDTO.getCategory().getName() != null) {
            Category category = categoryRepository.findByName(updatedTransactionDTO.getCategory().getName())
                    .orElseThrow(() -> new RuntimeException("Category not found"));
            transaction.setCategory(category);
        } else {
            transaction.setCategory(null);
        }

        if (updatedTransactionDTO.getAccount() != null && updatedTransactionDTO.getAccount().getName() != null) {
            Account account = accountRepository.findByName(updatedTransactionDTO.getAccount().getName())
                    .orElseThrow(() -> new RuntimeException("Account not found"));
            transaction.setAccount(account);
        } else {
            throw new RuntimeException("Account cannot be null.");
        }

        return transactionRepository.save(transaction);
    }

    public TransactionDTO getTransactionById(Long id) {
        Optional<Transaction> transaction = transactionRepository.findById(id);
            return transaction.map(t -> new TransactionDTO(
                            t.getId(),
                            t.getDescription(),
                            t.getAmount(),
                            t.getDate(),
                            t.getType().toString(),
                            new CategoryDTO(
                                    t.getCategory().getId(),
                                    t.getCategory().getName())
                            ,
                            new AccountDTO(
                                    t.getAccount().getId(),
                                    t.getAccount().getName(),
                                    t.getAccount().getBalance(),
                                    t.getAccount().getCurrency(),
                                    t.getAccount().getType().toString()
                            ),
                            new UserDTO(
                                    t.getUser().getId(),
                                    t.getUser().getUsername(),
                                    t.getUser().getEmail()),
                            t.getCurrency()))
                    .orElseThrow(() -> new RuntimeException("Transaction with ID " + id + " not found"));

    }

    public void deleteTransaction(Long id) {
        this.transactionRepository.deleteById(id);
    }

    public List<Transaction> searchTransactions(String keyword) {
        return transactionRepository.searchTransactions(keyword);
    }

    private BigDecimal convertToAccountCurrency(Transaction transaction) {
        String accountCurrency = transaction.getAccount().getCurrency();
        String transactionCurrency = transaction.getCurrency();

        if (accountCurrency.equalsIgnoreCase(transactionCurrency)) {
            return transaction.getAmount();
        }

        BigDecimal exchangeRate = exchangeRateService.getExchangeRate(transactionCurrency, accountCurrency);
        return transaction.getAmount().multiply(exchangeRate);
    }

    private TransactionDTO convertToDTO(Transaction transaction) {
        Category category = transaction.getCategory();
        String categoryName = (category != null) ? category.getName() : "Unknown";

        return new TransactionDTO(
                transaction.getId(),
                transaction.getDescription(),
                transaction.getAmount(),
                transaction.getDate(),
                transaction.getType().toString(),
                new CategoryDTO(category.getId(), categoryName),
                new AccountDTO(
                        transaction.getAccount().getId(),
                        transaction.getAccount().getName(),
                        transaction.getAccount().getBalance(),
                        transaction.getAccount().getCurrency(),
                        transaction.getAccount().getType().toString()
                ),
                new UserDTO(
                        transaction.getUser().getId(),
                        transaction.getUser().getUsername(),
                        transaction.getUser().getEmail()
                ),
                transaction.getCurrency()
        );
    }

    public List<TransactionDTO> getTransactionsForAccount(Long accountId, String startDate, String endDate) {
        LocalDate start = (startDate != null) ? LocalDate.parse(startDate) : LocalDate.now().minusDays(30);
        LocalDate end = (endDate != null) ? LocalDate.parse(endDate) : LocalDate.now();

        return transactionRepository.findByAccountIdAndDateBetween(accountId, start, end)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public Map<String, Double> getTransactionSummary(Long accountId) {
        List<TransactionDTO> transactionDTOs = getTransactionsForAccount(accountId, null, null);

        return transactionDTOs.stream().collect(
                Collectors.groupingBy(
                        t -> t.getDate().getMonth().toString(),
                        Collectors.summingDouble(t -> t.getAmount().doubleValue())
                )
        );
    }

}
