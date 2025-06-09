package com.d10rt01.hocho.controller.payment;

import com.d10rt01.hocho.model.Payment;
import com.d10rt01.hocho.service.PaymentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

import com.d10rt01.hocho.dto.payment.request.PaymentRequest;
import com.d10rt01.hocho.dto.payment.response.PaymentResponse;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import com.d10rt01.hocho.service.user.UserService;
import com.d10rt01.hocho.model.User;
import com.d10rt01.hocho.dto.transaction.TransactionDto;

@RestController
@RequestMapping("/api/payments")
@CrossOrigin(origins = "*")
public class PaymentController {

    @Autowired
    private PaymentService paymentService;

    @Autowired
    private UserService userService;

    @PostMapping("/create")
    public ResponseEntity<PaymentResponse> createPayment(@RequestBody PaymentRequest paymentRequest) {
        try {
            Long userId = paymentRequest.getUserId();
            List<Long> cartItemIds = paymentRequest.getCartItemIds();
            String description = paymentRequest.getDescription();

            if (cartItemIds == null || cartItemIds.isEmpty()) {
                return ResponseEntity.badRequest().build();
            }

            Payment payment = paymentService.createPayment(userId, cartItemIds, description);
            
            return ResponseEntity.ok(new PaymentResponse(payment.getPaymentUrl()));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/{orderCode}")
    public ResponseEntity<?> getPayment(@PathVariable Long orderCode) {
        try {
            Payment payment = paymentService.getPaymentByOrderCode(orderCode);
            if (payment == null) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.ok(payment);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Lỗi khi lấy thông tin thanh toán: " + e.getMessage());
        }
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getUserPayments(@PathVariable Long userId) {
        try {
            List<Payment> payments = paymentService.getPaymentsByUserId(userId);
            return ResponseEntity.ok(payments);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Lỗi khi lấy danh sách thanh toán: " + e.getMessage());
        }
    }

    @PutMapping("/{orderCode}/cancel")
    public ResponseEntity<?> cancelPayment(@PathVariable Long orderCode) {
        try {
            Payment payment = paymentService.cancelPayment(orderCode);
            return ResponseEntity.ok(payment);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Lỗi khi hủy thanh toán: " + e.getMessage());
        }
    }

    @PostMapping("/webhook")
    public ResponseEntity<?> handleWebhook(@RequestBody Map<String, String> webhookData) {
        try {
            String orderCode = webhookData.get("orderCode");
            String status = webhookData.get("status");

            if (orderCode == null || status == null) {
                return ResponseEntity.badRequest().body("Thiếu thông tin orderCode hoặc status");
            }

            paymentService.handlePaymentWebhook(orderCode, status);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Lỗi khi xử lý webhook: " + e.getMessage());
        }
    }

    @GetMapping("/return/{orderCode}")
    public ResponseEntity<?> handlePaymentReturn(@PathVariable Long orderCode) {
        try {
            Payment payment = paymentService.handlePaymentReturn(orderCode);
            return ResponseEntity.ok(payment);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Lỗi khi xử lý thanh toán: " + e.getMessage());
        }
    }

    @GetMapping("/transactions")
    public ResponseEntity<?> getUserTransactions() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseEntity.status(401).body("Người dùng chưa xác thực");
            }

            String username = authentication.getName();

            User user = userService.findByUsername(username)
                         .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng với username: " + username));
            
            Long userId = user.getId();

            List<TransactionDto> transactions = paymentService.getTransactionsByUserId(userId);
            System.out.println("Returning transactions: " + transactions);
            return ResponseEntity.ok(transactions);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Lỗi khi lấy lịch sử giao dịch: " + e.getMessage());
        }
    }
} 