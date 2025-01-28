package com.example.spring.finance.service;

import com.example.spring.finance.config.ExchangeRateApiConfig;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Map;

@Service
public class ExchangeRateService {
    private final RestTemplate restTemplate;
    private final ExchangeRateApiConfig config;

    public ExchangeRateService(RestTemplate restTemplate, ExchangeRateApiConfig config) {
        this.restTemplate = restTemplate;
        this.config = config;
    }

    public BigDecimal getExchangeRate(String fromCurrency, String toCurrency) {
        String url = String.format("%s?apikey=%s", config.getBaseUrl(), config.getApiKey());

        // Correctly use ParameterizedTypeReference
        ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                url,
                HttpMethod.GET,
                null,
                new ParameterizedTypeReference<Map<String, Object>>() {}
        );

        if (response.getStatusCode().is2xxSuccessful()) {
            Map<String, Object> body = response.getBody();
            if (body != null && body.containsKey("data")) {
                @SuppressWarnings("unchecked")
                Map<String, Double> rates = (Map<String, Double>) body.get("data");
                if (rates.containsKey(toCurrency) && rates.containsKey(fromCurrency)) {
                    BigDecimal targetRate = BigDecimal.valueOf(rates.get(toCurrency));
                    BigDecimal baseRate = BigDecimal.valueOf(rates.get(fromCurrency));

                    return targetRate.divide(baseRate, 4, RoundingMode.HALF_UP); // Use RoundingMode instead of ROUND_HALF_UP
                }
            }
        }

        throw new RuntimeException("Failed to fetch exchange rate");
    }

}
