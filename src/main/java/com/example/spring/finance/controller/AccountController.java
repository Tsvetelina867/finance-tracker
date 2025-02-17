package com.example.spring.finance.controller;

import com.example.spring.finance.dtos.AccountDTO;
import com.example.spring.finance.model.Account;
import com.example.spring.finance.model.User;
import com.example.spring.finance.repository.AccountRepository;
import com.example.spring.finance.repository.UserRepository;
import com.example.spring.finance.service.AccountService;
import com.example.spring.finance.service.UserService;
import jakarta.transaction.Transactional;
import org.hibernate.Hibernate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/accounts")
@CrossOrigin(origins = "http://localhost:3000")
public class AccountController {

    @Autowired
    private AccountService accountService;
    @Autowired
    private UserService userService;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private AccountRepository accountRepository;


    @Transactional
    @GetMapping("/current")
    public ResponseEntity<AccountDTO> getCurrentAccount(@AuthenticationPrincipal UserDetails userDetails) {
        String username = userDetails.getUsername();
        AccountDTO account = accountService.getAccountByUsername(username);
        return ResponseEntity.ok(account);
    }

    @GetMapping
    @Transactional
    public ResponseEntity<List<Account>> getAllAccounts(@AuthenticationPrincipal UserDetails userDetails) {
        String username = userDetails.getUsername();
        List<Account> accounts = accountService.getAllAccountsForUser(username);
        accounts.forEach(account -> Hibernate.initialize(account.getUser()));
        return ResponseEntity.ok(accounts);
    }
    @GetMapping("/user")
    public ResponseEntity<List<Account>> getUserAccounts(@AuthenticationPrincipal UserDetails userDetails) {
        List<Account> accounts = accountService.getAccountsByUser();
        return ResponseEntity.ok(accounts);
    }


    @PostMapping
    public ResponseEntity<Account> createAccount(@AuthenticationPrincipal UserDetails userDetails, @RequestBody AccountDTO accountDTO) {
        String username = userDetails.getUsername();
        Account createdAccount = accountService.createAccount(username, accountDTO);
        return ResponseEntity.ok(createdAccount);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Account> updateAccount(@PathVariable Long id, @RequestBody AccountDTO accountDTO) {
        Account updatedAccount = accountService.updateAccount(id, accountDTO);
        return ResponseEntity.ok(updatedAccount);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAccount(@PathVariable Long id) {
        accountService.deleteAccount(id);
        return ResponseEntity.noContent().build();
    }
}

