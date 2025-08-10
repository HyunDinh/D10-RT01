package d10_rt01.hocho.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.Customizer;
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
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http,
            SessionRegistry sessionRegistry,
            CorsConfig corsConfig,
            GoogleAuthConfig googleAuthConfig,
            UserDetailsService userDetailsService
    ) throws Exception {
        http
                // Use ONLY your custom CORS configuration
                .cors(cors -> cors.configurationSource(corsConfig.corsConfigurationSource()))
                .csrf(AbstractHttpConfigurer::disable)

                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        // Make ALL auth endpoints public (register, login, verify, reset, logout, etc.)
                        .requestMatchers("/api/auth/**").authenticated()
                        .requestMatchers(
                                "/api/auth/register",
                                "/api/auth/login",
                                "/api/auth/verify",
                                "/api/auth/verify-child",
                                "/api/auth/forgot-password",
                                "/api/auth/reset-password",
                                "/api/auth/logout" // usually OK public
                        ).permitAll()
                        // Public resources if needed
                        .requestMatchers("/", "/api/courses/**", "/ws/**", "/error").permitAll()
                        // Fix missing leading slashes
                        .requestMatchers("/api/time-restriction/**",
                                "/api/teacher/course",
                                "/api/parent-child",
                                "/api/messages/**").authenticated()
                        .anyRequest().authenticated()
                )

                .oauth2Login(oauth2 -> oauth2
                        .userInfoEndpoint(userInfo -> userInfo.oidcUserService(googleAuthConfig.oidcUserService()))
                        .successHandler((req, res, authn) ->
                                res.sendRedirect("https://hocho-c7ekfwhrehavd6fr.southeastasia-01.azurewebsites.net/api/auth/oauth2/success"))
                        .failureHandler((req, res, ex) -> {
                            String msg = "Lỗi đăng nhập Google: " + ex.getMessage();
                            res.sendRedirect("https://hocho-c7ekfwhrehavd6fr.southeastasia-01.azurewebsites.net/hocho/login?oauthError="
                                    + java.net.URLEncoder.encode(msg, java.nio.charset.StandardCharsets.UTF_8));
                        })
                )

                .rememberMe(remember -> remember
                        .key("uniqueAndSecretKey")
                        .tokenValiditySeconds(604800)
                        .rememberMeParameter("rememberMe")
                        .rememberMeCookieName("remember-me")
                        .tokenRepository(persistentTokenRepository())
                        .userDetailsService(userDetailsService)
                        .useSecureCookie(true)
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
                        .deleteCookies("JSESSIONID", "remember-me")
                        .logoutSuccessHandler((req, res, authn) -> {
                            res.setStatus(HttpStatus.OK.value());
                            res.getWriter().write("Đăng xuất thành công.");
                        })
                )

                .exceptionHandling(ex -> ex
                        .authenticationEntryPoint((req, res, e) -> {
                            // Keep CORS headers on 401
                            res.setHeader("Access-Control-Allow-Origin", "https://www.hocho.me");
                            res.setHeader("Access-Control-Allow-Credentials", "true");
                            res.sendError(HttpStatus.UNAUTHORIZED.value(), "Chưa đăng nhập.");
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
