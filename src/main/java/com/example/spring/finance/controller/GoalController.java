package com.example.spring.finance.controller;

import com.example.spring.finance.service.GoalService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;

@RestController
@RequestMapping("/api/finance/goals")
public class GoalController {
    private final GoalService goalService;

    public GoalController(GoalService goalService) {
        this.goalService = goalService;
    }

    @GetMapping("/{goalId}/progress")
    public ResponseEntity<BigDecimal> getGoalProgress(@PathVariable Long goalId) {
        BigDecimal progress = goalService.calculateGoalProgress(goalId);
        return ResponseEntity.ok(progress);
    }

    @GetMapping("/{goalId}/achieved")
    public ResponseEntity<Boolean> isGoalAchieved(@PathVariable Long goalId) {
        boolean achieved = goalService.isGoalAchieved(goalId);
        return ResponseEntity.ok(achieved);
    }
}

