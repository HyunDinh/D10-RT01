package d10_rt01.hocho.tests;

import com.fasterxml.jackson.databind.ObjectMapper;
import d10_rt01.hocho.dto.RegisterRequest;
import d10_rt01.hocho.model.User;
import d10_rt01.hocho.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
public class UserRegistrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void testRegisterAdmin_Success() throws Exception {
        // Prepare request data
        RegisterRequest request = new RegisterRequest();
        request.setUsername("admin");
        request.setPassword("123");
        request.setRetypePassword("123");
        request.setEmail("admin@example.com");
        request.setRole("admin");
        request.setPhoneNumber("0123456789");

        // Create multipart request
        MockMultipartFile requestPart = new MockMultipartFile(
                "request",
                "",
                MediaType.APPLICATION_JSON_VALUE,
                objectMapper.writeValueAsBytes(request)
        );

        // Perform POST request
        mockMvc.perform(multipart("/api/auth/register")
                        .file(requestPart)
                        .contentType(MediaType.MULTIPART_FORM_DATA))
                .andExpect(status().isOk())
                .andExpect(content().string("Đăng ký thành công. Vui lòng kiểm tra email để xác nhận tài khoản."));

        // Verify user in database
        User user = userRepository.findByUsername("admin").orElse(null);
        assertNotNull(user, "Admin user should be created");
        assertEquals("admin", user.getUsername());
        assertEquals("admin", user.getRole());
        assertEquals("admin@example.com", user.getEmail());
        assertFalse(user.getIsActive(), "Admin should not be active until verified");
        assertFalse(user.getVerified(), "Admin should not be verified until email confirmation");
        assertNotNull(user.getVerificationToken(), "Verification token should be generated");

        // Note: Check email inbox (admin@example.com) manually to verify email was sent
    }
}