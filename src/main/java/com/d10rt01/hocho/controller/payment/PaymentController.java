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

@RestController
@RequestMapping("/api/payments")
@CrossOrigin(origins = "*")
public class PaymentController {

    @Autowired
    private PaymentService paymentService;

    @PostMapping("/create")
    public ResponseEntity<PaymentResponse> createPayment(@RequestBody PaymentRequest paymentRequest) {
        try {
            Long userId = paymentRequest.getUserId();
            List<Long> cartItemIds = paymentRequest.getCartItemIds();

            if (cartItemIds == null || cartItemIds.isEmpty()) {
                return ResponseEntity.badRequest().build();
            }

            Payment payment = paymentService.createPayment(userId, cartItemIds);
            
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
} 