package com.example.spring.finance.controller;

import com.example.spring.finance.dtos.LoginRequest;
import com.example.spring.finance.dtos.RegistrationRequest;
import com.example.spring.finance.service.AuthService;
import com.example.spring.finance.util.AuthResponse;
import com.example.spring.finance.util.JwtUtil;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:3000")
public class AuthController {
    private final AuthService authService;
    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;

    public AuthController(AuthService authService, AuthenticationManager authenticationManager, JwtUtil jwtUtil) {
        this.authService = authService;
        this.authenticationManager = authenticationManager;
        this.jwtUtil = jwtUtil;
    }

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@RequestBody LoginRequest loginRequest) {
        String token = authService.loginUser(loginRequest.getUsername(), loginRequest.getPassword());

        if (token != null) {
            return ResponseEntity.ok(new AuthResponse(token));
        } else {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid credentials");
        }
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
