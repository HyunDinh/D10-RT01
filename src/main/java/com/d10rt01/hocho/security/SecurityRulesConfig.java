package com.d10rt01.hocho.security;

import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AuthorizeHttpRequestsConfigurer;

@Configuration
public class SecurityRulesConfig {

    public void configureSecurityRules(AuthorizeHttpRequestsConfigurer<HttpSecurity>.AuthorizationManagerRequestMatcherRegistry auth) {
        auth.requestMatchers("/hocho",
                        "/hocho/home",
                        "/hocho/dashboard",
                        "/hocho/login",
                        "/hocho/access-denied",  // Thêm endpoint access-denied vào danh sách permitAll
                        "/api/hocho/home",
                        "/api/hocho/dashboard",
                        "/api/hocho/access-denied",
                        "/css/**",
                        "/js/**",
                        "/index.html",
                        "/",
                        "/api/payments/return/**").permitAll()
                .requestMatchers("/api/payments/transactions").authenticated() // Yêu cầu xác thực cho endpoint lịch sử giao dịch
                .requestMatchers("/hocho/clients").hasRole("admin")  // Đảm bảo chỉ ROLE_admin mới truy cập được trang client
                .requestMatchers("/api/clients/**").hasRole("admin") // Đảm bảo chỉ ROLE_admin mới truy cập được API clients
                .requestMatchers("/api/hocho/welcome", "/api/hocho/role").authenticated()
                .anyRequest().authenticated();
    }
}