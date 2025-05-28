package com.d10rt01.hocho.controller.api;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/hocho")
public class UserApiController {

    @GetMapping("/welcome")
    public Map<String, Object> welcome(Authentication authentication) {
        Map<String, Object> response = new HashMap<>();
        String username = authentication.getName();
        response.put("username", username);
        return response;
    }

    @GetMapping("/role")
    public Map<String, String> getRole(Authentication authentication) {
        Map<String, String> response = new HashMap<>();
        String role = authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .findFirst()
                .orElse("");
        response.put("role", role);
        return response;
    }
}