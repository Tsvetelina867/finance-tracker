package com.example.spring.finance.service;

import com.example.spring.finance.dtos.RegistrationRequest;
import com.example.spring.finance.model.User;
import com.example.spring.finance.repository.UserRepository;
import com.example.spring.finance.util.JwtUtil;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class AuthService {
    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthService(JwtUtil jwtUtil, UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.jwtUtil = jwtUtil;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public String loginUser(String username, String password) {
        Optional<User> userOptional = userRepository.findByUsername(username);

        if (userOptional.isEmpty()) {
            return "Invalid username or password"; // Username doesn't exist
        }

        User user = userOptional.get();

        // Check if the plain password matches the encoded password in the database
        if (!passwordEncoder.matches(password, user.getPassword())) {
            return "Invalid username or password"; // Invalid password
        }

        // Generate JWT token
        String token = jwtUtil.generateToken(user.getUsername());
        return "Bearer " + token; // Return token with Bearer prefix
    }



    public String registerUser(RegistrationRequest registrationRequest) {
        if (userRepository.findByUsername(registrationRequest.getUsername()).isPresent()) {
            return "User with that username already exists.";
        }

        if (userRepository.findByEmail(registrationRequest.getEmail()).isPresent()) {
            return "User with that email already exists.";
        }

        User user = new User();
        user.setUsername(registrationRequest.getUsername());
        user.setEmail(registrationRequest.getEmail());
        user.setPassword(passwordEncoder.encode(registrationRequest.getPassword()));
        userRepository.save(user);

        return "User registered successfully!";
    }
}
