package com.example.spring.finance.repository;

import com.example.spring.finance.model.RecurringTransaction;
import com.example.spring.finance.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface RecurringTransactionRepository extends JpaRepository<RecurringTransaction, Long> {
    List<RecurringTransaction> findByAccountId(Long accountId);

    boolean existsByDescriptionAndAmountAndUser(String description, BigDecimal amount, User user);
}
