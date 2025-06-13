package d10_rt01.hocho.tests;


import d10_rt01.hocho.service.email.EmailService;
import jakarta.mail.MessagingException;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import javax.sql.DataSource;
import java.sql.SQLException;

@SpringBootTest
public class EmailTest {

    @Autowired
    private EmailService emailService;

    @Test
    void testSendEmail() {
        // Kiểm tra gửi email
        try {
            emailService.sendTestEmail("dinhhung1112005@gmail.com"); // Thay bằng email test thực tế
            System.out.println("Email kiểm tra đã được gửi thành công!");
        } catch (MessagingException e) {
            System.err.println("Lỗi khi gửi email: " + e.getMessage());
            throw new RuntimeException("Gửi email thất bại", e);
        }
    }

}