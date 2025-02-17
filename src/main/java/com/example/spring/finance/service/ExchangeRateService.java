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

        ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                url,
                HttpMethod.GET,
                null,
                new ParameterizedTypeReference<Map<String, Object>>() {}
        );

        if (response.getStatusCode().is2xxSuccessful()) {
            Map<String, Object> body = response.getBody();
            Map<String, Object> rates = (Map<String, Object>) body.get("data");
            if (rates.containsKey(toCurrency) && rates.containsKey(fromCurrency)) {
                BigDecimal targetRate = new BigDecimal(rates.get(toCurrency).toString());
                BigDecimal baseRate = new BigDecimal(rates.get(fromCurrency).toString());

                return targetRate.divide(baseRate, 4, RoundingMode.HALF_UP);
            }

        }

        throw new RuntimeException("Failed to fetch exchange rate");
    }

}
