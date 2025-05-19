package com.example.spring.finance.repository;

import com.example.spring.finance.model.Goal;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface GoalRepository extends JpaRepository<Goal, Long> {
    List<Goal> findByAccountId(Long accountId);
    List<Goal> findByDeadlineBefore(LocalDate date);
}
