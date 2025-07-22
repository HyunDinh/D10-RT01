package d10_rt01.hocho.security;

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
import org.springframework.security.web.authentication.rememberme.JdbcTokenRepositoryImpl;
import org.springframework.security.web.authentication.rememberme.PersistentTokenRepository;

import javax.sql.DataSource;
import java.nio.charset.StandardCharsets;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final DataSource dataSource; // Inject DataSource để kết nối SQL Server

    public SecurityConfig(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    // AuthenticationManager: manage the authentication process with username and password
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
                                                   GoogleAuthConfig googleAuthConfig,
                                                   UserDetailsService userDetailsService) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfig.corsConfigurationSource()))
                .csrf(AbstractHttpConfigurer::disable)
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(
                                "/",
                                "/api/courses/**",
                                "/api/auth/register",
                                "/api/auth/verify",
                                "/api/auth/verify-child",
                                "/api/auth/login",
                                "/api/auth/logout",
                                "/api/auth/forgot-password",
                                "/api/auth/reset-password",
                                "/ws/**")
                        .permitAll()
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        .requestMatchers(
                                "/api/auth/user",
                                "/api/time-restriction/**",
                                "api/teacher/course",
                                "api/parent-child",
                                "/api/messages/**").authenticated()
                        .requestMatchers("/error").permitAll()
                        .anyRequest().authenticated()
                )
                .oauth2Login(oauth2 -> oauth2
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
                .rememberMe(remember -> remember
                        .key("uniqueAndSecretKey") // Khóa bí mật để mã hóa token
                        .tokenValiditySeconds(604800) // 7 ngày
                        .rememberMeParameter("rememberMe") // Tham số trong request
                        .rememberMeCookieName("remember-me") // Tên cookie
                        .tokenRepository(persistentTokenRepository()) // Repository cho bảng persistent_logins
                        .userDetailsService(userDetailsService)
                        .useSecureCookie(true) // Chỉ gửi cookie qua HTTPS trong production
                )
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED)
                        .sessionFixation(SessionManagementConfigurer.SessionFixationConfigurer::migrateSession)
                        .maximumSessions(1)
                        .sessionRegistry(sessionRegistry)
                        .expiredUrl("/hocho/login?expired")
                )
                .logout(logout -> logout
                        .logoutUrl("/api/auth/logout")
                        .deleteCookies("JSESSIONID", "remember-me") // Xóa cookie khi logout
                        .logoutSuccessHandler((request, response, authentication) -> {
                            response.setStatus(HttpStatus.OK.value());
                            response.getWriter().write("Đăng xuất thành công.");
                        })
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

    // Bean cho PersistentTokenRepository
    @Bean
    public PersistentTokenRepository persistentTokenRepository() {
        JdbcTokenRepositoryImpl tokenRepository = new JdbcTokenRepositoryImpl();
        tokenRepository.setDataSource(dataSource);
        return tokenRepository;
    }

    // Others
    @Bean
    public HttpSessionEventPublisher httpSessionEventPublisher() {
        return new HttpSessionEventPublisher();
    }

    @Bean
    public SessionRegistry sessionRegistry() {
        return new SessionRegistryImpl();
    }

    @Bean
    public ExecutorService executorService() {
        return Executors.newFixedThreadPool(10);
    }
}
