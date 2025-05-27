package com.d10rt01.hocho.security;

import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AuthorizeHttpRequestsConfigurer;

@Configuration
public class SecurityRulesConfig {

    public void configureSecurityRules(AuthorizeHttpRequestsConfigurer<HttpSecurity>.AuthorizationManagerRequestMatcherRegistry auth) {
        // Các đường dẫn public
        auth.requestMatchers("/hocho", "/hocho/home", "/hocho/dashboard", "/login", "/css/**").permitAll()
                .requestMatchers("/hocho/access-denied").permitAll()
                // Đường dẫn yêu cầu ROLE_admin
                .requestMatchers("/hocho/clients","/api/Users/**").hasRole("admin")
                // đường dẫn yêu cầu xác thực
                // Các đường dẫn khác yêu cầu xác thực
                .anyRequest().authenticated();
    }
}