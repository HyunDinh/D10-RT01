package d10_rt01.hocho.service;

import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import java.util.*;
import com.fasterxml.jackson.databind.ObjectMapper;

@Service
public class GeminiAiService {
    private final String API_KEY = "AIzaSyCuBV_K5WHz8qkDQ8H51coirtDGnO0ukvI";
    private final String GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=" + API_KEY;

    public String askGemini(String prompt) {
        RestTemplate restTemplate = new RestTemplate();

        Map<String, Object> requestBody = new HashMap<>();
        Map<String, Object> content = new HashMap<>();
        content.put("parts", List.of(Map.of("text", prompt)));
        requestBody.put("contents", List.of(content));

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

        ResponseEntity<Map> response = restTemplate.postForEntity(GEMINI_URL, entity, Map.class);

        Map result = response.getBody();
        try {
            ObjectMapper mapper = new ObjectMapper();
            return mapper.writeValueAsString(result);
        } catch (Exception e) {
            return "{\"error\": \"Cannot parse Gemini response\"}";
        }
    }
} 