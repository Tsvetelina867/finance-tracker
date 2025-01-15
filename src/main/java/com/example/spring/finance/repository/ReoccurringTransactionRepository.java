package com.example.spring.finance.repository;

import com.example.spring.finance.model.ReoccurringTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ReoccurringTransactionRepository extends JpaRepository<ReoccurringTransaction, Long> {
}
