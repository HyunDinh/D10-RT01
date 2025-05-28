package com.d10rt01.hocho.security;

import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AuthorizeHttpRequestsConfigurer;

@Configuration
public class SecurityRulesConfig {

    public void configureSecurityRules(AuthorizeHttpRequestsConfigurer<HttpSecurity>.AuthorizationManagerRequestMatcherRegistry auth) {
        auth.requestMatchers("/hocho", "/hocho/home", "/hocho/dashboard", "/hocho/login", "/api/hocho/home", "/api/hocho/dashboard", "/api/hocho/access-denied", "/css/**", "/js/**", "/index.html", "/").permitAll()
                .requestMatchers("/hocho/clients", "/api/clients/**").hasRole("admin")
                .requestMatchers("/api/hocho/welcome", "/api/hocho/role").authenticated()
                .anyRequest().authenticated();
    }
}