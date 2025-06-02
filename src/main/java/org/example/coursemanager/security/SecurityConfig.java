package org.example.coursemanager.security;// File: src/main/java/com/example/yourapp/config/SecurityConfig.java
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf().disable() // Disable CSRF for development or stateless APIs.
                .authorizeHttpRequests(auth -> auth
                .requestMatchers("/teachers/**").permitAll() // Adjust access as needed.
                .anyRequest().authenticated());
        return http.build();
    }
}