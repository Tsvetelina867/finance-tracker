package com.example.spring.finance.service;

import com.example.spring.finance.dtos.AccountDTO;
import com.example.spring.finance.dtos.CategoryDTO;
import com.example.spring.finance.dtos.GoalDTO;
import com.example.spring.finance.dtos.UserDTO;
import com.example.spring.finance.model.Category;
import com.example.spring.finance.repository.CategoryRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CategoryService {
    private final CategoryRepository categoryRepository;

    public CategoryService(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    public List<CategoryDTO> getCategoriesByAccountId() {
        List<Category> categories = categoryRepository.findAll();

        if (categories.isEmpty()) {
            throw new EntityNotFoundException("No categories found for this account.");
        }

        return categories.stream().map(category -> new CategoryDTO(
                category.getId(),
                category.getName())).collect(Collectors.toList());
    }
}
