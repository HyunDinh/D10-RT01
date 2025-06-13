package d10_rt01.hocho.security;

import d10_rt01.hocho.config.DebugModeConfig;
import d10_rt01.hocho.model.User;
import d10_rt01.hocho.service.user.UserService;
import d10_rt01.hocho.utils.CustomLogger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserRequest;
import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserService;
import org.springframework.security.oauth2.core.oidc.OidcIdToken;
import org.springframework.security.oauth2.core.oidc.OidcUserInfo;
import org.springframework.security.oauth2.core.oidc.user.DefaultOidcUser;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;

import java.util.Collection;

@Configuration
public class GoogleAuthConfig {

    public static final CustomLogger logger = new CustomLogger(LoggerFactory.getLogger(GoogleAuthConfig.class), DebugModeConfig.SECURITY_LAYER);
    private final UserService userService;

    public GoogleAuthConfig(UserService userService) {
        this.userService = userService;
    }

    @Bean
    public OAuth2UserService<OidcUserRequest, OidcUser> oidcUserService() {
        OidcUserService oidcUserService = new OidcUserService();
        return userRequest -> {
            logger.info("Processing Google login");
            OidcUser oidcUser = oidcUserService.loadUser(userRequest);
            String email = oidcUser.getEmail();
            logger.info("Retrieved email from Google: {}", email);
            User user = userService.findByEmail(email);
            if (user == null) {
                logger.error("Email not found in database: {}", email);
                throw new org.springframework.security.core.userdetails.UsernameNotFoundException(
                        "Chưa liên kết tài khoản");
            }
            if (!user.getIsActive() || !user.getVerified()) {
                logger.error("User not active or not verified for email: {}", email);
                throw new org.springframework.security.core.userdetails.UsernameNotFoundException(
                        "Tài khoản chưa được kích hoạt hoặc xác minh.");
            }
            String username = user.getUsername();
            logger.info("Retrieved username from user: {}", username);
            if (username == null) {
                logger.error("Username is null for email: {}", email);
                throw new IllegalStateException("Username cannot be null");
            }
            UserDetails userDetails = org.springframework.security.core.userdetails.User
                    .withUsername(username)
                    .password(user.getPasswordHash())
                    .roles(user.getRole().toUpperCase())
                    .build();
            logger.info("Successfully created UserDetails for user: {}", username);
            OidcUserInfo userInfo = OidcUserInfo.builder()
                    .subject(oidcUser.getSubject())
                    .email(email)
                    .name(oidcUser.getFullName())
                    .givenName(oidcUser.getGivenName())
                    .familyName(oidcUser.getFamilyName())
                    .picture(oidcUser.getPicture())
                    .build();
            return new CustomOidcUser(
                    userDetails.getAuthorities(),
                    userRequest.getIdToken(),
                    userInfo,
                    username
            );
        };
    }

    private static class CustomOidcUser extends DefaultOidcUser {
        private final String username;

        public CustomOidcUser(Collection<? extends org.springframework.security.core.GrantedAuthority> authorities,
                              OidcIdToken idToken, OidcUserInfo userInfo, String username) {
            super(authorities, idToken, userInfo, "email");
            this.username = username;
        }

        @Override
        public String getName() {
            return username;
        }
    }
}