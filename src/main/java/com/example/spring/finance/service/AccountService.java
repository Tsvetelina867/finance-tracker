package com.example.spring.finance.service;

import com.example.spring.finance.dtos.AccountDTO;
import com.example.spring.finance.model.Account;
import com.example.spring.finance.model.User;
import com.example.spring.finance.model.enums.AccountType;
import com.example.spring.finance.repository.AccountRepository;
import com.example.spring.finance.repository.UserRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class AccountService {
    private final AccountRepository accountRepository;
    private final UserRepository userRepository;

    public AccountService(AccountRepository accountRepository, UserRepository userRepository) {
        this.accountRepository = accountRepository;
        this.userRepository = userRepository;
    }

    public AccountDTO getAccountByUsername(String username) {
        Optional<Account> accountOpt = accountRepository.findByUser_Username(username).stream().findFirst();

        return accountOpt.map(acc -> new AccountDTO(
                acc.getId(),
                        acc.getName(),
                        acc.getBalance(),
                        acc.getCurrency(),
                        acc.getType().toString()))
                .orElseThrow(() -> new RuntimeException("No account found for user: " + username));
    }

    public List<Account> getAllAccountsForUser(String username) {
        return accountRepository.findByUser_Username(username);
    }

    public Account createAccount(String username, AccountDTO accountDTO) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));

        Account account = new Account();
        account.setName(accountDTO.getName());
        account.setBalance(accountDTO.getBalance());
        account.setCurrency(accountDTO.getCurrency());
        account.setUser(user);
        account.setType(AccountType.valueOf(accountDTO.getType().toUpperCase()));

        return accountRepository.save(account);
    }

    public Account updateAccount(Long id, AccountDTO accountDTO) {
        Account account = accountRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Account not found with ID: " + id));

        account.setName(accountDTO.getName());
        account.setBalance(accountDTO.getBalance());
        account.setCurrency(accountDTO.getCurrency());
        account.setType(AccountType.valueOf(accountDTO.getType().toUpperCase()));

        return accountRepository.save(account);
    }

    public void deleteAccount(Long id) {
        if (!accountRepository.existsById(id)) {
            throw new RuntimeException("Account not found with ID: " + id);
        }
        accountRepository.deleteById(id);
    }

    public List<Account> getAccountsByUser() {
        String username = getAuthenticatedUsername();

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return accountRepository.findByUserId(user.getId());
    }

    private String getAuthenticatedUsername() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal instanceof UserDetails) {
            return ((UserDetails) principal).getUsername();
        } else {
            return principal.toString();
        }
    }
}
