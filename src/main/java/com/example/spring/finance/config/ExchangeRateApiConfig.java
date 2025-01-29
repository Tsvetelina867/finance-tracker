package com.example.spring.finance.config;

import lombok.Getter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

@Getter
@Configuration
public class ExchangeRateApiConfig {
    @Value("${exchange.api.base-url}")
    private String baseUrl;

    @Value("${exchange.api.key}")
    private String apiKey;

}
