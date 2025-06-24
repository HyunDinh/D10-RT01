package d10_rt01.hocho.tests;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import d10_rt01.hocho.dto.RegisterRequest;
import d10_rt01.hocho.model.User;
import d10_rt01.hocho.model.enums.UserRole;
import d10_rt01.hocho.repository.UserRepository;
import d10_rt01.hocho.service.user.UserService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;

import java.nio.charset.StandardCharsets;

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

    @Autowired
    private UserService userService;

    @Test
    void testRegisterAdmin() throws Exception {
        MockMultipartFile admin = createRequest("admin1", "admin1", UserRole.ADMIN);
        MockMultipartFile teacher = createRequest("teacher1", "teacher1", UserRole.TEACHER);
        MockMultipartFile teacherImage = new MockMultipartFile(
                "teacherImage",
                "teacher.jpg",
                MediaType.IMAGE_JPEG_VALUE,
                "mock image content".getBytes(StandardCharsets.UTF_8)
        );
        MockMultipartFile parent = createRequest("parent1", "parent1", UserRole.PARENT);
        MockMultipartFile child1 = createRequest("child1", "parent1", UserRole.CHILD);
        MockMultipartFile child2 = createRequest("child2", "parent1", UserRole.CHILD);

        // Perform POST request
        mockMvc.perform(multipart("/api/auth/register")
                        .file(admin)
                        .contentType(MediaType.MULTIPART_FORM_DATA))
                .andExpect(status().isOk());

        mockMvc.perform(multipart("/api/auth/register")
                        .file(teacher)
                        .file(teacherImage)
                        .contentType(MediaType.MULTIPART_FORM_DATA))
                .andExpect(status().isOk());

        mockMvc.perform(multipart("/api/auth/register")
                        .file(parent)
                        .contentType(MediaType.MULTIPART_FORM_DATA))
                .andExpect(status().isOk());

        mockMvc.perform(multipart("/api/auth/register")
                        .file(child1)
                        .contentType(MediaType.MULTIPART_FORM_DATA))
                .andExpect(status().isOk());

        mockMvc.perform(multipart("/api/auth/register")
                        .file(child2)
                        .contentType(MediaType.MULTIPART_FORM_DATA))
                .andExpect(status().isOk());

        System.out.println("Number of children : " + userService.getNumberOfChild("parent1"));
    }

    private MockMultipartFile createRequest(String username, String emailPrefix, UserRole role) throws JsonProcessingException {
        RegisterRequest r = new RegisterRequest();
        r.setUsername(username);
        r.setPassword("123");
        r.setRetypePassword("123");
        if (role != UserRole.CHILD) {
            r.setEmail(emailPrefix + "@example.com");
        } else {
            r.setParentEmail(emailPrefix + "@example.com");
        }
        r.setRole(role.name().toLowerCase());
        r.setPhoneNumber("0123456789");
        return new MockMultipartFile(
                "request",
                "",
                MediaType.APPLICATION_JSON_VALUE,
                objectMapper.writeValueAsBytes(r)
        );
    }
}