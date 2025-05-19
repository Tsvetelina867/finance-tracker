package com.example.spring.finance.repository;

import com.example.spring.finance.model.Account;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AccountRepository extends JpaRepository<Account, Long> {
    Optional<Account> findByName(String name);


    List<Account> findByUser_Username(String username);

    List<Account> findByUserId(Long id);
}
