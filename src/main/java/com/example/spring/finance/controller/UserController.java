package com.example.spring.finance.controller;

import com.example.spring.finance.dtos.UserUpdateDTO;
import com.example.spring.finance.model.User;
import com.example.spring.finance.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/user")
@CrossOrigin(origins = "http://localhost:3000")
public class UserController {

    @Autowired
    private UserService userService;

    @GetMapping("/profile")
    public User getUserProfile(@AuthenticationPrincipal UserDetails userDetails) {
        // Fetch user information from database using username from the authenticated user
        String username = userDetails.getUsername();
        return userService.getUserByUsername(username);
    }
    @PutMapping("/update")
    public User updateUserProfile(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody UserUpdateDTO userUpdateDTO
    ) {
        String username = userDetails.getUsername();
        return userService.updateUser(username, userUpdateDTO);
    }
}
