package com.example.spring.finance.repository;

import com.example.spring.finance.model.Budget;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BudgetRepository extends JpaRepository<Budget, Long> {
    Optional<Budget> findByAccountId(Long accountId);
    List<Budget> findAllByAccountId(Long accountId);
}
