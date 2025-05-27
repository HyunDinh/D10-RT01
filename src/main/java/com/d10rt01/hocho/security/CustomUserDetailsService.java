package com.d10rt01.hocho.security;


import com.d10rt01.hocho.service.user.UserService;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

import java.util.Optional;

public class CustomUserDetailsService implements UserDetailsService {

    private final UserService clientService;

    public CustomUserDetailsService(UserService clientService) {
        this.clientService = clientService;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        Optional<com.d10rt01.hocho.model.User> clientOpt = clientService.findByUsername(username);
        com.d10rt01.hocho.model.User user = clientOpt.orElseThrow(() -> new UsernameNotFoundException("Không tìm thấy người dùng: " + username));

        String password = user.getPasswordHash();
        if (password.startsWith("{bcrypt}")) {
            // Mật khẩu đã có tiền tố bcrypt, giữ nguyên
        } else if (password.startsWith("$2a$") || password.startsWith("$2b$") || password.startsWith("$2y$")) {
            // Mật khẩu là BCrypt nhưng chưa có tiền tố
            password = "{bcrypt}" + password;
        } else {
            // Mật khẩu là plaintext, thêm tiền tố {noop}
            password = "{noop}" + password;
        }

        return User.builder()
                .username(user.getUsername())
                .password(password)
                .roles(user.getRole())
                .build();
    }
}