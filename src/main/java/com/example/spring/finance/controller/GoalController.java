package com.example.spring.finance.controller;

import com.example.spring.finance.dtos.AccountDTO;
import com.example.spring.finance.dtos.CategoryDTO;
import com.example.spring.finance.dtos.GoalDTO;
import com.example.spring.finance.dtos.UserDTO;
import com.example.spring.finance.model.Goal;
import com.example.spring.finance.service.GoalService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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

    @PostMapping
    public ResponseEntity<Goal> createGoal(@RequestBody @Valid Goal goal) {
        Goal createdGoal = goalService.addGoal(goal);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdGoal);
    }

    @PutMapping("/{id}")
    public ResponseEntity<GoalDTO> updateGoal(@PathVariable Long id, @RequestBody GoalDTO goalDTO) {
        Goal goal = goalService.updateGoal(id, goalDTO);

        GoalDTO responseDTO = new GoalDTO(
                goal.getName(),
                goal.getTargetAmount(),
                goal.getCurrentAmount(),
                goal.getDeadline(),
                new UserDTO(
                        goal.getUser().getUsername(),
                        goal.getUser().getEmail()
                ),
                new AccountDTO(
                        goal.getAccount().getName(),
                        goal.getAccount().getType().toString()
                ),
                new CategoryDTO(
                        goal.getCategory().getName(),
                        goal.getCategory().getType().toString()
                )

        );

        return ResponseEntity.ok(responseDTO);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteGoal(@PathVariable Long id) {
        this.goalService.deleteGoal(id);
        return ResponseEntity.noContent().build();
    }
}

