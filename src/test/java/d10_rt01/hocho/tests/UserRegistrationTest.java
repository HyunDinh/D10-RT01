package d10_rt01.hocho.tests;

import com.fasterxml.jackson.databind.ObjectMapper;
import d10_rt01.hocho.dto.RegisterRequest;
import d10_rt01.hocho.model.ParentChildMapping;
import d10_rt01.hocho.model.User;
import d10_rt01.hocho.repository.ParentChildMappingRepository;
import d10_rt01.hocho.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
public class UserRegistrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ParentChildMappingRepository parentChildMappingRepository;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void testRegisterParent_Success() throws Exception {
        // Prepare request data
        RegisterRequest request = new RegisterRequest();
        request.setUsername("eser");
        request.setPassword("123");
        request.setRetypePassword("123");
        request.setEmail("chontem12@gmail.com");
        request.setRole("admin");
        // Perform POST request
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(content().string("Đăng ký thành công. Vui lòng kiểm tra email để xác nhận tài khoản."));

        // Verify user in database
        User user = userRepository.findByUsername("admin").orElse(null);
        assertNotNull(user, "Parent user should be created");
        assertEquals("admin", user.getUsername());
        assertEquals("parent", user.getRole());
        assertEquals("dinhhung1112005@gmail.com", user.getEmail());
        assertFalse(user.getIsActive(), "Parent should not be active until verified");
        assertFalse(user.getVerified(), "Parent should not be verified until email confirmation");
        assertNotNull(user.getVerificationToken(), "Verification token should be generated");

        // Note: Check email inbox (dinhhung1112005@gmail.com) manually to verify email was sent
    }

    @Test
    void testRegisterChild_Success() throws Exception {
        // Ensure parent exists
        User parent = userRepository.findByEmail("chonphuoc123@gmail.com");
        if (parent == null || !parent.getRole().equals("parent")) {
            // Create parent if not exists (mimic real-world scenario)
            RegisterRequest parentRequest = new RegisterRequest();
            parentRequest.setUsername("admin");
            parentRequest.setPassword("123");
            parentRequest.setRetypePassword("123");
            parentRequest.setEmail("chonphuoc123@gmail.com");
            parentRequest.setRole("parent");

            mockMvc.perform(post("/api/auth/register")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(parentRequest)))
                    .andExpect(status().isOk())
                    .andExpect(content().string("Đăng ký thành công. Vui lòng kiểm tra email để xác nhận tài khoản."));
        }

        // Prepare request data for child
        RegisterRequest request = new RegisterRequest();
        request.setUsername("child");
        request.setPassword("123");
        request.setRetypePassword("123");
        request.setEmail("chonphuoc123@gmail.com"); // Same as parent email
        request.setParentEmail("chonphuoc123@gmail.com");
        request.setRole("child");

        // Perform POST request
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(content().string("Đăng ký tài khoản học sinh thành công. Vui lòng chờ phụ huynh xác nhận qua email."));

        // Verify child user in database
        User child = userRepository.findByUsername("child").orElse(null);
        assertNotNull(child, "Child user should be created");
        assertEquals("child", child.getUsername());
        assertEquals("child", child.getRole());
        assertNull(child.getEmail(), "Child email should be null");
        assertFalse(child.getIsActive(), "Child should not be active until parent verifies");
        assertFalse(child.getVerified(), "Child should not be verified until parent confirms");
        assertNotNull(child.getVerificationToken(), "Verification token should be generated");

        // Verify parent-child mapping
        ParentChildMapping mapping = parentChildMappingRepository.findByChildId(child.getId());
        assertNotNull(mapping, "Parent-child mapping should exist");
        assertEquals("chonphuoc123@gmail.com", mapping.getParent().getEmail());
        assertEquals(child.getId(), mapping.getChild().getId());

        // Note: Check email inbox (dinhhung1112005@gmail.com) manually to verify child confirmation email was sent
    }
}