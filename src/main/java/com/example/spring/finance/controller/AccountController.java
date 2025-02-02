package com.example.spring.finance.controller;

import com.example.spring.finance.dtos.AccountDTO;
import com.example.spring.finance.model.Account;
import com.example.spring.finance.service.AccountService;
import jakarta.transaction.Transactional;
import org.hibernate.Hibernate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/accounts")
@CrossOrigin(origins = "http://localhost:3000")
public class AccountController {

    @Autowired
    private AccountService accountService;

    @Transactional
    @GetMapping("/current")
    public ResponseEntity<AccountDTO> getCurrentAccount(@AuthenticationPrincipal UserDetails userDetails) {
        String username = userDetails.getUsername();  // Get the logged-in user's username
        AccountDTO account = accountService.getAccountByUsername(username);  // Fetch account DTO
        return ResponseEntity.ok(account);  // Return account DTO
    }

    @GetMapping
    @Transactional
    public ResponseEntity<List<Account>> getAllAccounts(@AuthenticationPrincipal UserDetails userDetails) {
        String username = userDetails.getUsername();  // Get the logged-in user's username
        List<Account> accounts = accountService.getAllAccountsForUser(username);  // Get all accounts for this user
        accounts.forEach(account -> Hibernate.initialize(account.getUser()));
        return ResponseEntity.ok(accounts);  // Return the accounts in the response
    }
    // Create a new account
    @PostMapping
    public ResponseEntity<Account> createAccount(@AuthenticationPrincipal UserDetails userDetails, @RequestBody AccountDTO accountDTO) {
        String username = userDetails.getUsername();
        Account createdAccount = accountService.createAccount(username, accountDTO);
        return ResponseEntity.ok(createdAccount);
    }

    // Update an existing account
    @PutMapping("/{id}")
    public ResponseEntity<Account> updateAccount(@PathVariable Long id, @RequestBody AccountDTO accountDTO) {
        Account updatedAccount = accountService.updateAccount(id, accountDTO);
        return ResponseEntity.ok(updatedAccount);
    }

    // Delete an account
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAccount(@PathVariable Long id) {
        accountService.deleteAccount(id);
        return ResponseEntity.noContent().build();
    }
}

