package d10_rt01.hocho.service.email;

import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Value;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Service
public class EmailService {

    private final JavaMailSender mailSender;
    private final String frontendUrl;

    public EmailService(JavaMailSender mailSender, @Value("${frontend.url}") String frontendUrl) {
        this.mailSender = mailSender;
        this.frontendUrl = frontendUrl;
    }

    public void sendVerificationEmail(String to, String token) throws MessagingException {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true);
        helper.setTo(to);
        helper.setSubject("Xác nhận đăng ký tài khoản Hocho");

        // Định dạng ngày giờ hiện tại
        String registrationTime = LocalDateTime.now().format(DateTimeFormatter.ofPattern("HH:mm:ss dd/MM/yyyy"));

        String verificationUrl = frontendUrl + "/hocho/verify?token=" + token;
        String emailContent = "<div style=\"font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;\">"
                + "<h1 style=\"color: #2c3e50; text-align: center;\">Xác nhận email</h1>"
                + "<p style=\"font-size: 16px;\">Bạn đã đăng ký tài khoản ở hệ thống Hocho của chúng tôi vào lúc <strong>" + registrationTime + "</strong>.</p>"
                + "<p style=\"font-size: 16px;\">Vui lòng nhấn vào nút bên dưới để xác nhận tài khoản của bạn:</p>"
                + "<div style=\"text-align: center; margin: 25px 0;\">"
                + "<a href=\"" + verificationUrl + "\" style=\"background-color: #4CAF50; color: white; padding: 12px 24px; text-align: center; text-decoration: none; display: inline-block; border-radius: 4px; font-weight: bold;\">Xác nhận tài khoản</a>"
                + "</div>"
                + "<p style=\"font-size: 14px; color: #7f8c8d;\">Nếu bạn không thực hiện đăng ký này, vui lòng bỏ qua email.</p>"
                + "<hr style=\"border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;\">"
                + "<p style=\"font-size: 12px; color: #7f8c8d; text-align: center;\">© 2023 Hocho. All rights reserved.</p>"
                + "</div>";

        helper.setText(emailContent, true);
        mailSender.send(message);
    }

    public void sendTestEmail(String to) throws MessagingException {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true);
        helper.setTo(to);
        helper.setSubject("Test Email");
        helper.setText("This is a test email.", true);
        mailSender.send(message);
    }
}