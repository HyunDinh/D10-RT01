package d10_rt01.hocho.tests;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import d10_rt01.hocho.dto.RegisterRequest;
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

        // ADD ADMINS
        MockMultipartFile dinhhung = createRequest("hyundinh", "dinhhung1112005@gmail.com", UserRole.ADMIN);
        mockMvc.perform(multipart("/api/auth/register")
                        .file(dinhhung)
                        .contentType(MediaType.MULTIPART_FORM_DATA))
                .andExpect(status().isOk());
        MockMultipartFile chontem = createRequest("chontem", "chontem123@gmail.com", UserRole.ADMIN);
        mockMvc.perform(multipart("/api/auth/register")
                        .file(chontem)
                        .contentType(MediaType.MULTIPART_FORM_DATA))
                .andExpect(status().isOk());
        MockMultipartFile hungthinh = createRequest("hungthinh", "hungthinh16072005@gmail.com", UserRole.ADMIN);
        mockMvc.perform(multipart("/api/auth/register")
                        .file(hungthinh)
                        .contentType(MediaType.MULTIPART_FORM_DATA))
                .andExpect(status().isOk());
        MockMultipartFile thanhdat = createRequest("thanhdat", "lethanhdat20072005@gmail.com", UserRole.ADMIN);
        mockMvc.perform(multipart("/api/auth/register")
                        .file(thanhdat)
                        .contentType(MediaType.MULTIPART_FORM_DATA))
                .andExpect(status().isOk());
        MockMultipartFile minhvb = createRequest("minhvb", "minhvbde180352@fpt.edu.vn", UserRole.ADMIN);
        mockMvc.perform(multipart("/api/auth/register")
                        .file(minhvb)
                        .contentType(MediaType.MULTIPART_FORM_DATA))
                .andExpect(status().isOk());

        // ADD OTHER USERS
//        MockMultipartFile teacher = createRequest("teacher1", "teacher1", UserRole.TEACHER);
//        MockMultipartFile teacherImage = new MockMultipartFile(
//                "teacherImage",
//                "teacher.jpg",
//                MediaType.IMAGE_JPEG_VALUE,
//                "mock image content".getBytes(StandardCharsets.UTF_8)
//        );
//        MockMultipartFile parent = createRequest("parent1", "parent1", UserRole.PARENT);
//        MockMultipartFile child1 = createRequest("child1", "parent1", UserRole.CHILD);
//        MockMultipartFile child2 = createRequest("child2", "parent1", UserRole.CHILD);
//
//        // Perform POST request
//        mockMvc.perform(multipart("/api/auth/register")
//                        .file(teacher)
//                        .file(teacherImage)
//                        .contentType(MediaType.MULTIPART_FORM_DATA))
//                .andExpect(status().isOk());
//
//        mockMvc.perform(multipart("/api/auth/register")
//                        .file(parent)
//                        .contentType(MediaType.MULTIPART_FORM_DATA))
//                .andExpect(status().isOk());
//
//        mockMvc.perform(multipart("/api/auth/register")
//                        .file(child1)
//                        .contentType(MediaType.MULTIPART_FORM_DATA))
//                .andExpect(status().isOk());
//
//        mockMvc.perform(multipart("/api/auth/register")
//                        .file(child2)
//                        .contentType(MediaType.MULTIPART_FORM_DATA))
//                .andExpect(status().isOk());

//        System.out.println("Number of children : " + userService.getNumberOfChild("parent1"));
    }

    private MockMultipartFile createRequest(String username, String email, UserRole role) throws JsonProcessingException {
        RegisterRequest r = new RegisterRequest();
        r.setUsername(username);
        r.setPassword("123");
        r.setRetypePassword("123");
        if (role != UserRole.CHILD) {
            r.setEmail(email);
        } else {
            r.setParentEmail(email);
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