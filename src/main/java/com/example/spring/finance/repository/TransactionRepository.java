package com.example.spring.finance.repository;

import com.example.spring.finance.model.Account;
import com.example.spring.finance.model.Category;
import com.example.spring.finance.model.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    @Query("SELECT COALESCE(SUM(t.amount), 0) " +
                  "FROM Transaction t " +
                  "WHERE t.category = :category " +
                  "AND t.account = :account " +
                  "AND t.date BETWEEN :startDate AND :endDate")
    BigDecimal sumByCategoryAndAccountAndDateRange(Category category, Account account, LocalDate startDate, LocalDate endDate);

    @Query("SELECT t FROM Transaction t WHERE t.description LIKE %?1% OR t.account.name LIKE %?1% OR t.category.name LIKE %?1%")
    List<Transaction> searchTransactions(String keyword);

    List<Transaction> findByAccountIdAndDateBetween(Long accountId, LocalDate startDate, LocalDate endDate);
}
