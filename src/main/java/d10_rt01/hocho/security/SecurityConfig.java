package d10_rt01.hocho.security;

import d10_rt01.hocho.model.User;
import d10_rt01.hocho.service.user.UserService;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.annotation.web.configurers.SessionManagementConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.session.SessionRegistry;
import org.springframework.security.core.session.SessionRegistryImpl;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.session.HttpSessionEventPublisher;

import java.nio.charset.StandardCharsets;

@Configuration
@EnableWebSecurity
public class SecurityConfig {


    // authenticationManager: manage the authentication process with username and password (called in the user controller)
    @Bean
    public AuthenticationManager authenticationManager(HttpSecurity http, UserDetailsService userDetailsService, PasswordConfig passwordConfig) throws Exception {
        AuthenticationManagerBuilder auth = http.getSharedObject(AuthenticationManagerBuilder.class);
        auth.userDetailsService(userDetailsService).passwordEncoder(passwordConfig.passwordEncoder());
        return auth.build();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http,
                                                   SessionRegistry sessionRegistry,
                                                   CorsConfig corsConfig,
                                                   GoogleAuthConfig googleAuthConfig) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfig.corsConfigurationSource()))
                .csrf(AbstractHttpConfigurer::disable)
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/auth/register",
                                "/api/auth/verify",
                                "/api/auth/verify-child",
                                "/api/auth/login",
                                "/api/auth/logout").permitAll()
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll() // Cho phép tất cả yêu cầu OPTIONS
                        .requestMatchers("/api/auth/user").authenticated()
                        .requestMatchers("/error").permitAll()
                        .anyRequest().authenticated()
                )
                .oauth2Login(oauth2 -> oauth2
                        .loginPage("/hocho/login")
                        .userInfoEndpoint(userInfo -> userInfo.oidcUserService(googleAuthConfig.oidcUserService()))
                        .successHandler((request, response, authentication) -> {
                            response.sendRedirect("http://localhost:8080/api/auth/oauth2/success");
                        })
                        .failureHandler((request, response, exception) -> {
                            String errorMessage = "Lỗi đăng nhập Google: " + exception.getMessage();
                            response.sendRedirect("http://localhost:3000/hocho/login?oauthError=" +
                                    java.net.URLEncoder.encode(errorMessage, StandardCharsets.UTF_8));
                        })
                )
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED)
                        .sessionFixation(SessionManagementConfigurer.SessionFixationConfigurer::migrateSession)
                        .maximumSessions(1)
                        .sessionRegistry(sessionRegistry)
                        .expiredUrl("/hocho/login?expired")
                )
                .exceptionHandling(exception -> exception
                        .authenticationEntryPoint((request, response, authException) -> {
                            response.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");
                            response.setHeader("Access-Control-Allow-Credentials", "true");
                            response.sendError(HttpStatus.UNAUTHORIZED.value(), "Chưa đăng nhập.");
                        })
                );

        return http.build();
    }

    // others
    @Bean
    public HttpSessionEventPublisher httpSessionEventPublisher() {
        return new HttpSessionEventPublisher();
    }

    @Bean
    public SessionRegistry sessionRegistry() {
        return new SessionRegistryImpl();
    }
}