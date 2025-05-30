package com.d10rt01.hocho.tests;

import com.d10rt01.hocho.config.Notifications;
import com.d10rt01.hocho.model.User;
import com.d10rt01.hocho.repository.UserRepository;
import com.d10rt01.hocho.service.user.UserService;
import com.d10rt01.hocho.testExtension.TestTerminalUI;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.http.*;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;

import java.time.Instant;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
public class LoginTests {

    // SET UP

    @LocalServerPort
    private int port;

    @Autowired
    private TestRestTemplate restTemplate;

    @Autowired
    private UserService userService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    @BeforeEach
    public void setUp() {
        // Xóa tất cả user để tránh xung đột
        userRepository.deleteAll();

        // Thêm user mẫu
        User user = new User();
        user.setUsername("admin");
        user.setPasswordHash("123"); // Sẽ được mã hóa trong userService.addUser()
        user.setEmail("admin@example.com");
        user.setPhoneNumber("1234567890");
        user.setFullName("Admin User");
        user.setRole("admin");
        user.setIsActive(true);
        user.setCreatedAt(Instant.now());
        user.setUpdatedAt(Instant.now());
        userService.addUser(user);
    }

    private String getLoginUrl() {
        return "http://localhost:" + port + "/loginSubmit";
    }

    // ---------------------------------------------- TESTS ---------------------------------------------

    @Test
    public void testLoginSuccess() {

        TestTerminalUI.printTestTitle("Test Login Success");

        // Dữ liệu đăng nhập
        MultiValueMap<String, String> loginData = new LinkedMultiValueMap<>();
        loginData.add("username", "admin");
        loginData.add("password", "123");

        // Tạo request
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
        HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(loginData, headers);

        // Gửi yêu cầu đăng nhập
        ResponseEntity<Map> response = restTemplate.postForEntity(getLoginUrl(), request, Map.class);

        // Kiểm tra kết quả
        assertEquals(HttpStatus.OK, response.getStatusCode(), "Mã trạng thái HTTP phải là 200 OK");
        assertNotNull(response.getBody(), "Phản hồi không được null");
        assertEquals("ROLE_admin", response.getBody().get("role"), "Vai trò phải là ROLE_admin");
        assertEquals("/hocho/clients", response.getBody().get("redirect"), "Redirect phải là /hocho/clients cho admin");
    }

    @Test
    public void testLoginWrongUsername() {
        // Dữ liệu đăng nhập với username sai
        MultiValueMap<String, String> loginData = new LinkedMultiValueMap<>();
        loginData.add("username", "wronguser");
        loginData.add("password", "123");

        // Tạo request
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
        HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(loginData, headers);

        // Gửi yêu cầu đăng nhập
        ResponseEntity<Map> response = restTemplate.postForEntity(getLoginUrl(), request, Map.class);

        // Kiểm tra kết quả
        assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode(), "HTTP status must be 401 Unauthorized");
        assertNotNull(response.getBody(), "Response body must not be null");
        assertTrue(response.getBody().containsKey("error"), "Response must include field 'error'");
        assertTrue(response.getBody().get(Notifications.KEY_ERROR).toString().contains(Notifications.ERROR_LOGIN_FAILED),
                "Thông báo lỗi phải chứa '" + Notifications.ERROR_LOGIN_FAILED + "'");
    }

    @Test
    public void testLoginWrongPassword() {
        // Dữ liệu đăng nhập với password sai
        MultiValueMap<String, String> loginData = new LinkedMultiValueMap<>();
        loginData.add("username", "admin");
        loginData.add("password", "wrongpassword");

        // Tạo request
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
        HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(loginData, headers);

        // Gửi yêu cầu đăng nhập
        ResponseEntity<Map> response = restTemplate.postForEntity(getLoginUrl(), request, Map.class);

        // Kiểm tra kết quả
        assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode(), "Mã trạng thái HTTP phải là 401 Unauthorized");
        assertNotNull(response.getBody(), "Phản hồi không được null");
        assertTrue(response.getBody().get(Notifications.KEY_ERROR).toString().contains(Notifications.ERROR_LOGIN_FAILED),
                "Thông báo lỗi phải chứa '" + Notifications.ERROR_LOGIN_FAILED + "'");
    }

    @Test
    public void testLoginEmptyCredentials() {
        // Dữ liệu đăng nhập rỗng
        MultiValueMap<String, String> loginData = new LinkedMultiValueMap<>();
        loginData.add("username", "");
        loginData.add("password", "");

        // Tạo request
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
        HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(loginData, headers);

        // Gửi yêu cầu đăng nhập
        ResponseEntity<Map> response = restTemplate.postForEntity(getLoginUrl(), request, Map.class);

        // Kiểm tra kết quả
        assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode(), "Mã trạng thái HTTP phải là 401 Unauthorized");
        assertNotNull(response.getBody(), "Phản hồi không được null");
        assertTrue(response.getBody().containsKey("error"), "Phản hồi phải chứa trường 'error'");
        assertTrue(response.getBody().get(Notifications.KEY_ERROR).toString().contains(Notifications.ERROR_LOGIN_FAILED),
                "Thông báo lỗi phải chứa '" + Notifications.ERROR_LOGIN_FAILED + "'");
    }
}