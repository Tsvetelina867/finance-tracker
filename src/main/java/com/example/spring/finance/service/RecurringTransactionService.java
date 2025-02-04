package com.example.spring.finance.service;

import com.example.spring.finance.dtos.*;
import com.example.spring.finance.model.Account;
import com.example.spring.finance.model.Category;
import com.example.spring.finance.model.RecurringTransaction;
import com.example.spring.finance.model.Transaction;
import com.example.spring.finance.model.enums.FlowType;
import com.example.spring.finance.model.enums.FrequencyType;
import com.example.spring.finance.repository.*;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class RecurringTransactionService {
    private final TransactionRepository transactionRepository;
    private final RecurringTransactionRepository recurringTransactionRepository; // Fixed spelling
    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final AccountRepository accountRepository;
    private final ExchangeRateService exchangeRateService;

    public RecurringTransactionService(TransactionRepository transactionRepository,
                                       RecurringTransactionRepository recurringTransactionRepository,
                                       UserRepository userRepository,
                                       CategoryRepository categoryRepository,
                                       AccountRepository accountRepository,
                                       ExchangeRateService exchangeRateService) {
        this.transactionRepository = transactionRepository;
        this.recurringTransactionRepository = recurringTransactionRepository;
        this.userRepository = userRepository;
        this.categoryRepository = categoryRepository;
        this.accountRepository = accountRepository;
        this.exchangeRateService = exchangeRateService;
    }

    public List<RecurringTransactionDTO> processRecurringTransactions(Long accountId) {
        return processRecurringTransactions(accountId, LocalDate.now(), LocalDate.now());
    }

    public List<RecurringTransactionDTO> catchUpRecurringTransactions(Long accountId, LocalDate startDate, LocalDate endDate, String frequency, String category) {
        return processRecurringTransactions(accountId, startDate, endDate, frequency, category);
    }

    private List<RecurringTransactionDTO> processRecurringTransactions(Long accountId, LocalDate startDate, LocalDate endDate) {
        return processRecurringTransactions(accountId, startDate, endDate, null, null);
    }

    public List<RecurringTransactionDTO> processRecurringTransactions(Long accountId, LocalDate startDate, LocalDate endDate, String frequencyFilter, String categoryFilter) {

        List<RecurringTransaction> recurringTransactions = recurringTransactionRepository.findByAccountId(accountId);
        System.out.println("Found " + recurringTransactions.size() + " recurring transactions.");

        List<RecurringTransactionDTO> generatedRecurringTransactions = new ArrayList<>(recurringTransactions.stream()
                .map(recurringTransaction -> getRecurringTransactionDTO(recurringTransaction, LocalDate.now()))
                .toList());

        for (RecurringTransaction recurringTransaction : recurringTransactions) {
            System.out.println("Processing recurring transaction: " + recurringTransaction.getDescription());

            // Apply frequency filter
            if (frequencyFilter != null && !recurringTransaction.getFrequency().toString().equals(frequencyFilter)) {
                System.out.println("Skipping transaction due to frequency filter.");
                continue;
            }

            // Apply category filter
            if (categoryFilter != null && recurringTransaction.getCategory() != null &&
                    !recurringTransaction.getCategory().getName().equals(categoryFilter)) {
                System.out.println("Skipping transaction due to category filter.");
                continue;
            }

            LocalDate currentDate = recurringTransaction.getStartDate();
            if (recurringTransaction.getEndDate() != null && recurringTransaction.getEndDate().isBefore(endDate)) {
                endDate = recurringTransaction.getEndDate();
            }
            System.out.println("Final End Date for this transaction: " + endDate);

            while (!currentDate.isAfter(endDate)) {
                System.out.println("Processing for currentDate: " + currentDate);

                boolean transactionExists = recurringTransactionRepository.existsByDescriptionAndAmountAndUser(
                        recurringTransaction.getDescription(),
                        recurringTransaction.getAmount(),
                        recurringTransaction.getUser()
                );

                if (!transactionExists) {
                    RecurringTransactionDTO transaction = getRecurringTransactionDTO(recurringTransaction, currentDate);
                    generatedRecurringTransactions.add(transaction);
                }

                System.out.println("Transaction Frequency: " + recurringTransaction.getFrequency());

                currentDate = switch (recurringTransaction.getFrequency()) {
                    case DAILY -> currentDate.plusDays(1);
                    case WEEKLY -> currentDate.plusWeeks(1);
                    case MONTHLY -> currentDate.plusMonths(1);
                    case ANNUALLY -> currentDate.plusYears(1);
                };

                System.out.println("Next date: " + currentDate);
            }
        }

        System.out.println("Generated " + generatedRecurringTransactions.size() + " recurring transactions.");
        return generatedRecurringTransactions;
    }


    // Helper method to map RecurringTransaction to DTO
    private RecurringTransactionDTO getRecurringTransactionDTO(RecurringTransaction recurringTransaction, LocalDate date) {
        Category category = recurringTransaction.getCategory();
        String categoryName = (category != null) ? category.getName() : "Unknown";
        String categoryType = (category != null && category.getType() != null)
                ? category.getType().toString()
                : "UNKNOWN";
        return new RecurringTransactionDTO(
                recurringTransaction.getDescription(),
                recurringTransaction.getAmount(),
                recurringTransaction.getStartDate(),
                recurringTransaction.getEndDate(),
                recurringTransaction.getFrequency().toString(),
                new CategoryDTO(categoryName, categoryType),
                new AccountDTO(
                        recurringTransaction.getAccount().getName(),
                        recurringTransaction.getAccount().getBalance(),
                        recurringTransaction.getAccount().getCurrency(),
                        recurringTransaction.getAccount().getType().toString()
                ),
                new UserDTO(
                        recurringTransaction.getUser().getUsername(),
                        recurringTransaction.getUser().getEmail()
                ),
                recurringTransaction.getAccount().getCurrency()
        );
    }




    public RecurringTransaction addRecurringTransaction(RecurringTransaction recurringTransaction) { // Fixed spelling
        String username = SecurityContextHolder.getContext().getAuthentication().getName();

        recurringTransaction.setUser(userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found")));

        if (recurringTransaction.getCategory() != null) {
            Category category = categoryRepository.findById(recurringTransaction.getCategory().getId())
                    .orElseThrow(() -> new RuntimeException("Category not found"));
            recurringTransaction.setCategory(category);
        }

        Account account = accountRepository.findById(recurringTransaction.getAccount().getId())
                .orElseThrow(() -> new RuntimeException("Account not found"));
        recurringTransaction.setAccount(account);

        if (recurringTransaction.getCurrency() == null) {
            throw new IllegalArgumentException("Currency must be provided for the recurring transaction.");
        }

        BigDecimal convertedAmount = convertToAccountCurrency(recurringTransaction);
        recurringTransaction.setAmount(convertedAmount);

        return recurringTransactionRepository.save(recurringTransaction);
    }

    public RecurringTransaction updateRecurringTransaction(Long id, RecurringTransactionDTO updatedRecurringTransactionDTO) { // Fixed spelling
        RecurringTransaction recurringTransaction = recurringTransactionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Recurring transaction not found")); // Fixed spelling

        recurringTransaction.setDescription(updatedRecurringTransactionDTO.getDescription());
        recurringTransaction.setAmount(updatedRecurringTransactionDTO.getAmount());
        recurringTransaction.setStartDate(updatedRecurringTransactionDTO.getStartDate());
        recurringTransaction.setEndDate(updatedRecurringTransactionDTO.getEndDate());
        recurringTransaction.setFrequency(FrequencyType.valueOf(updatedRecurringTransactionDTO.getFrequency()));
        recurringTransaction.setCurrency(updatedRecurringTransactionDTO.getCurrency());

        if (updatedRecurringTransactionDTO.getCategory().getName() != null) {
            Category category = categoryRepository.findByName(updatedRecurringTransactionDTO.getCategory().getName())
                    .orElseThrow(() -> new RuntimeException("Category not found"));
            category.setType(FlowType.valueOf(updatedRecurringTransactionDTO.getCategory().getType()));
            recurringTransaction.setCategory(category);
        } else {
            recurringTransaction.setCategory(null);
        }

        Account account = accountRepository.findByName(updatedRecurringTransactionDTO.getAccount().getName())
                .orElseThrow(() -> new RuntimeException("Account not found"));
        recurringTransaction.setAccount(account);

        return recurringTransactionRepository.save(recurringTransaction);
    }

    public void deleteRecurringTransaction(Long id) { // Fixed spelling
        this.recurringTransactionRepository.deleteById(id); // Fixed spelling
    }

    public BigDecimal convertToAccountCurrency(RecurringTransaction recurringTransaction) { // Fixed spelling
        String accountCurrency = recurringTransaction.getAccount().getCurrency();
        String transactionCurrency = recurringTransaction.getCurrency();  // You can optionally store the transaction currency if needed

        if (!transactionCurrency.equals(accountCurrency)) {
            BigDecimal exchangeRate = exchangeRateService.getExchangeRate(transactionCurrency, accountCurrency);
            return recurringTransaction.getAmount().multiply(exchangeRate);
        } else {
            return recurringTransaction.getAmount();
        }
    }
}

