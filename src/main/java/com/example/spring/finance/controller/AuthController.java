package com.example.spring.finance.controller;

import com.example.spring.finance.dtos.RegistrationRequest;
import com.example.spring.finance.service.AuthService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }
    @PostMapping("/register")
    public ResponseEntity<String> register(@RequestBody RegistrationRequest registrationRequest) {
        String result = authService.registerUser(registrationRequest);

        if (result.contains("successfully")) {
            return ResponseEntity.status(HttpStatus.CREATED).body(result); // 201 status for successful registration
        } else {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(result); // 400 status for errors
        }
    }
}
