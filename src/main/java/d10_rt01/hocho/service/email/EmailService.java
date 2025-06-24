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

    public void sendChildRegistrationConfirmationEmail(String to, String childUsername, String token) throws MessagingException {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true);
        helper.setTo(to);
        helper.setSubject("Xác nhận đăng ký tài khoản cho học sinh trên Hocho");

        String registrationTime = LocalDateTime.now().format(DateTimeFormatter.ofPattern("HH:mm:ss dd/MM/yyyy"));
        String verificationUrl = frontendUrl + "/hocho/verify-child?token=" + token;
        String emailContent = "<div style=\"font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 4px;\">"
                + "<h1 style=\"color: #2c3e50; text-align: center;\">Xác nhận tài khoản học sinh</h1>"
                + "<p style=\"font-size: 16px;\">Tài khoản học sinh với tên đăng nhập <strong>" + childUsername + "</strong> đã được đăng ký trên hệ thống Hocho vào lúc <strong>" + registrationTime + "</strong>.</p>"
                + "<p style=\"font-size: 16px;\">Vui lòng nhấn vào nút bên dưới để xác nhận rằng đây là tài khoản của con bạn:</p>"
                + "<div style=\"text-align: center; margin: 25px 0;\">"
                + "<a href=\"" + verificationUrl + "\" style=\"background-color: #4CAF50; color: white; padding: 12px 24px; text-align: center; text-decoration: none; display: inline-block; border-radius: 4px; font-weight: bold;\">Xác nhận tài khoản học sinh</a>"
                + "</div>"
                + "<p style=\"font-size: 14px; color: #7f8c8d;\">Nếu bạn không nhận ra tài khoản này, vui lòng bỏ qua email hoặc liên hệ hỗ trợ.</p>"
                + "<hr style=\"border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;\">"
                + "<p style=\"font-size: 12px; color: #7f8c8d; text-align: center;\">© 2023 Hocho. All rights reserved.</p>"
                + "</div>";

        helper.setText(emailContent, true);
        mailSender.send(message);
    }

    public void sendPasswordResetEmail(String to, String username, String token) throws MessagingException {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true);
        helper.setTo(to);
        helper.setSubject("Đặt lại mật khẩu tài khoản Hocho");

        String resetTime = LocalDateTime.now().format(DateTimeFormatter.ofPattern("HH:mm:ss dd/MM/yyyy"));
        String resetUrl = frontendUrl + "/hocho/reset-password?token=" + token;
        String emailContent = "<div style=\"font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 4px;\">"
                + "<h1 style=\"color: #2c3e50; text-align: center;\">Đặt lại mật khẩu</h1>"
                + "<p style=\"font-size: 16px;\">Yêu cầu đặt lại mật khẩu cho tài khoản <strong>" + username + "</strong> đã được thực hiện vào lúc <strong>" + resetTime + "</strong>.</p>"
                + "<p style=\"font-size: 16px;\">Vui lòng nhấn vào nút bên dưới để đặt lại mật khẩu của bạn:</p>"
                + "<div style=\"text-align: center; margin: 25px 0;\">"
                + "<a href=\"" + resetUrl + "\" style=\"background-color: #4CAF50; color: white; padding: 12px 24px; text-align: center; text-decoration: none; display: inline-block; border-radius: 4px; font-weight: bold;\">Đặt lại mật khẩu</a>"
                + "</div>"
                + "<p style=\"font-size: 14px; color: #7f8c8d;\">Liên kết này sẽ hết hạn sau 1 giờ. Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.</p>"
                + "<hr style=\"border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;\">"
                + "<p style=\"font-size: 12px; color: #7f8c8d; text-align: center;\">© 2023 Hocho. All rights reserved.</p>"
                + "</div>";

        helper.setText(emailContent, true);
        mailSender.send(message);
    }

    public void sendTeacherRegistrationConfirmationEmail(String to, String username) throws MessagingException {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true);
        helper.setTo(to);
        helper.setSubject("Đăng ký tài khoản giáo viên trên Hocho");

        String registrationTime = LocalDateTime.now().format(DateTimeFormatter.ofPattern("HH:mm:ss dd/MM/yyyy"));
        String emailContent = "<div style=\"font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 4px;\">"
                + "<h1 style=\"color: #2c3e50; text-align: center;\">Đăng ký tài khoản giáo viên</h1>"
                + "<p style=\"font-size: 16px;\">Tài khoản giáo viên với tên đăng nhập <strong>" + username + "</strong> đã được đăng ký thành công vào lúc <strong>" + registrationTime + "</strong>.</p>"
                + "<p style=\"font-size: 16px;\">Đơn đăng ký của bạn đang chờ xét duyệt. Chúng tôi sẽ thông báo kết quả qua email trong thời gian sớm nhất.</p>"
                + "<p style=\"font-size: 14px; color: #7f8c8d;\">Nếu bạn có thắc mắc, vui lòng liên hệ hỗ trợ qua email support@hocho.com.</p>"
                + "<hr style=\"border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;\">"
                + "<p style=\"font-size: 12px; color: #7f8c8d; text-align: center;\">© 2023 Hocho. All rights reserved.</p>"
                + "</div>";

        helper.setText(emailContent, true);
        mailSender.send(message);
    }

    public void sendTeacherApprovalEmail(String to, String username, boolean approved) throws MessagingException {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true);
        helper.setTo(to);
        helper.setSubject(approved ? "Tài khoản giáo viên được duyệt" : "Tài khoản giáo viên bị từ chối");

        String actionTime = LocalDateTime.now().format(DateTimeFormatter.ofPattern("HH:mm:ss dd/MM/yyyy"));
        String emailContent = "<div style=\"font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 4px;\">"
                + "<h1 style=\"color: #2c3e50; text-align: center;\">" + (approved ? "Tài khoản được duyệt" : "Tài khoản bị từ chối") + "</h1>"
                + "<p style=\"font-size: 16px;\">Tài khoản giáo viên với tên đăng nhập <strong>" + username + "</strong> đã được xử lý vào lúc <strong>" + actionTime + "</strong>.</p>"
                + "<p style=\"font-size: 16px;\">" + (approved ? "Tài khoản của bạn đã được duyệt và bạn có thể bắt đầu sử dụng các tính năng dành cho giáo viên trên Hocho." : "Đơn đăng ký của bạn đã bị từ chối. Nếu bạn có thắc mắc, vui lòng liên hệ hỗ trợ.") + "</p>"
                + "<div style=\"text-align: center; margin: 25px 0;\">" + (approved ? "<a href=\"" + frontendUrl + "/hocho/login\" style=\"background-color: #4CAF50; color: white; padding: 12px 24px; text-align: center; text-decoration: none; display: inline-block; border-radius: 4px; font-weight: bold;\">Đăng nhập ngay</a>" : "") + "</div>"
                + "<p style=\"font-size: 14px; color: #7f8c8d;\">Liên hệ hỗ trợ qua email support@hocho.com nếu cần thêm thông tin.</p>"
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