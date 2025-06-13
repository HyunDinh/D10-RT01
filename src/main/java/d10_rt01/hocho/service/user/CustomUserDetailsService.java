package d10_rt01.hocho.service.user;

import d10_rt01.hocho.config.DebugModeConfig;
import d10_rt01.hocho.model.User;
import d10_rt01.hocho.utils.CustomLogger;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    public static final CustomLogger logger = new CustomLogger(LoggerFactory.getLogger(CustomUserDetailsService.class), DebugModeConfig.SERVICE_LAYER);
    private final UserService userService;

    public CustomUserDetailsService(UserService userService) {
        this.userService = userService;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userService.findByUsername(username);
        if (user == null) {
            logger.error("User not found: username={}", username);
            throw new UsernameNotFoundException("User not found");
        } else if (!user.getIsActive() || !user.getVerified()) {
            logger.error("User not active or not verified: username={}", username);
            throw new UsernameNotFoundException("User not active or not verified");
        } else {
            logger.info("User founded : username={}, role={}", user.getUsername(), user.getRole());
        }
        return org.springframework.security.core.userdetails.User
                .withUsername(user.getUsername())
                .password(user.getPasswordHash())
                .roles(user.getRole().toUpperCase())
                .build();
    }
}