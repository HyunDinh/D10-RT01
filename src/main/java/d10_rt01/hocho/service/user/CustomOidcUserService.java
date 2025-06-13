package d10_rt01.hocho.service.user;

import d10_rt01.hocho.config.DebugModeConfig;
import d10_rt01.hocho.model.User;
import d10_rt01.hocho.utils.CustomLogger;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserRequest;
import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserService;
import org.springframework.security.oauth2.core.oidc.user.DefaultOidcUser;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.stereotype.Service;

@Service
public class CustomOidcUserService extends OidcUserService {
    public static final CustomLogger logger = new CustomLogger(LoggerFactory.getLogger(CustomOidcUserService.class), DebugModeConfig.SERVICE_LAYER);
    private final UserService userService;

    public CustomOidcUserService(UserService userService) {
        this.userService = userService;
    }

    @Override
    public OidcUser loadUser(OidcUserRequest userRequest) {
        OidcUser oidcUser = super.loadUser(userRequest);
        String email = oidcUser.getEmail();

        // Kiểm tra email trong bảng users
        User user = userService.findByEmail(email);
        if (user == null) {
            throw new UsernameNotFoundException("Email không tồn tại. Vui lòng đăng ký thủ công.");
        }
        if (!user.getIsActive() || !user.getVerified()) {
            throw new UsernameNotFoundException("Tài khoản chưa được kích hoạt hoặc xác minh.");
        }

        // Tạo UserDetails
        UserDetails userDetails = org.springframework.security.core.userdetails.User
                .withUsername(user.getUsername())
                .password(user.getPasswordHash())
                .roles(user.getRole().toUpperCase())
                .build();

        // Trả về OidcUser
        return new DefaultOidcUser(
                userDetails.getAuthorities(),
                userRequest.getIdToken(),
                userDetails.getUsername()
        );

    }
}