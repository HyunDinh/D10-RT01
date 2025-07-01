package d10_rt01.hocho.service.payment;


import d10_rt01.hocho.dto.TotalRevenueDto;
import d10_rt01.hocho.dto.transaction.TransactionDto;
import d10_rt01.hocho.model.*;
import d10_rt01.hocho.model.enums.CartStatus;
import d10_rt01.hocho.model.enums.OrderStatus;
import d10_rt01.hocho.model.enums.PaymentStatus;
import d10_rt01.hocho.model.enums.TransactionStatus;
import d10_rt01.hocho.repository.*;
import d10_rt01.hocho.repository.order.OrderItemRepository;
import d10_rt01.hocho.repository.order.OrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.payos.PayOS;
import vn.payos.type.CheckoutResponseData;
import vn.payos.type.ItemData;
import vn.payos.type.PaymentData;
import d10_rt01.hocho.dto.transaction.OrderItemDto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class PaymentServiceImpl implements PaymentService {

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PayOS payOS;

    @Value("${app.base-url}")
    private String baseUrl;

    @Autowired
    private ShoppingCartRepository shoppingCartRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private OrderItemRepository orderItemRepository;

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private CourseEnrollmentRepository courseEnrollmentRepository;

    @Override
    @Transactional
    public Payment createPayment(Long userId, List<Long> cartItemIds, String description) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // 1. Tìm các mục trong giỏ hàng dựa trên cartItemIds
        List<ShoppingCart> cartItemsToCheckout = shoppingCartRepository.findAllById(cartItemIds);

        // Kiểm tra xem tất cả các ID được gửi có tồn tại không
        if (cartItemsToCheckout.size() != cartItemIds.size()) {
             throw new RuntimeException("Một hoặc nhiều mục giỏ hàng không tìm thấy.");
        }

        // Kiểm tra xem các mục này có thuộc về người dùng hiện tại không
        boolean allBelongToUser = cartItemsToCheckout.stream()
                .allMatch(item -> item.getParent().getId().equals(userId));
        if (!allBelongToUser) {
             throw new RuntimeException("Một hoặc nhiều mục giỏ hàng không thuộc về người dùng này.");
        }

        // 2. Kiểm tra trạng thái và tính tổng tiền các mục có thể thanh toán
        List<ShoppingCart> payableCartItems = cartItemsToCheckout.stream()
                .filter(item -> item.getStatusByParent() != null && (item.getStatusByParent().equals(CartStatus.ACCEPTED) || item.getStatusByParent().equals(CartStatus.ADDED_DIRECTLY)))
                .collect(Collectors.toList());

        if (payableCartItems.isEmpty()) {
             throw new RuntimeException("Không có mặt hàng nào trong giỏ hàng có thể thanh toán.");
        }

        Integer totalAmount = payableCartItems.stream()
                .mapToInt(item -> item.getCourse().getPrice().intValue())
                .sum();

        // 3. Tạo Order
        Order order = new Order();
        order.setParent(user);
        order.setTotalAmount(BigDecimal.valueOf(totalAmount));
        order.setStatus(OrderStatus.PENDING);
        order.setOrderDate(LocalDateTime.now());
        order = orderRepository.save(order);

        // 4. Tạo OrderItems từ PayableCartItems và liên kết với Order
        List<OrderItem> orderItems = new ArrayList<>();
        for (ShoppingCart cartItem : payableCartItems) {
            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(order);
            orderItem.setCourse(cartItem.getCourse());
            orderItem.setChild(cartItem.getChild());
            orderItem.setPrice(cartItem.getCourse().getPrice()); // Lưu giá tại thời điểm mua
            orderItem.setQuantity(1); // Số lượng luôn là 1 cho khóa học
            orderItems.add(orderItem);
        }
        orderItemRepository.saveAll(orderItems);

        // Cập nhật danh sách orderItems trong order (optional, JPA có thể tự quản lý)
        order.setOrderItems(orderItems);

        // 5. Tạo Payment record và liên kết với Order
        // Generate unique order code for PayOS (có thể sử dụng Order ID hoặc generate khác)
        String currentTimeString = String.valueOf(new Date().getTime());
        long payosOrderCode = Long.parseLong(currentTimeString.substring(currentTimeString.length() - 6)); // Ví dụ generate
        // Hoặc dùng Order ID: long payosOrderCode = order.getOrderId();

        Payment payment = new Payment();
        payment.setOrderCode(payosOrderCode);
        payment.setUser(user); // User ở đây là người thực hiện thanh toán (Parent)
        payment.setAmount(totalAmount);
        payment.setDescription(description); // Sử dụng description từ tham số
        payment.setStatus(PaymentStatus.PENDING);
        payment.setOrder(order); // Liên kết Payment với Order

        // 6. Tạo PayOS payment link
        try {
            List<ItemData> payosItems = payableCartItems.stream()
                    .map(item -> ItemData.builder()
                            .name(item.getCourse().getTitle())
                            .quantity(1)
                            .price(item.getCourse().getPrice().intValue())
                            .build())
                    .collect(Collectors.toList());

            PaymentData paymentData = PaymentData.builder()
                    .orderCode(payosOrderCode)
                    .amount(totalAmount)
                    .description(description != null && description.length() > 25 ? description.substring(0, 25) : description)
                    .returnUrl(baseUrl + "/hocho/handle-payos-return/" + payosOrderCode)
                    .cancelUrl(baseUrl + "/hocho/parent/cart?orderCode=" + payosOrderCode)
                    .items(payosItems)
                    .build();

            CheckoutResponseData checkoutData = payOS.createPaymentLink(paymentData);
            payment.setPaymentUrl(checkoutData.getCheckoutUrl());

            // 7. Lưu Payment
            payment = paymentRepository.save(payment);

            // Có thể cập nhật Order với Payment link nếu cần
            // order.setPayment(payment);
            // orderRepository.save(order);

            return payment; // Trả về Payment chứa PayOS URL

        } catch (Exception e) {
            // Xóa Order và OrderItems nếu tạo payment link thất bại
            orderItemRepository.deleteAll(orderItems);
            orderRepository.delete(order);
            throw new RuntimeException("Failed to create payment: " + e.getMessage());
        }
    }

    @Override
    public Payment getPaymentByOrderCode(Long orderCode) {
        return paymentRepository.findByOrderCode(orderCode);
    }

    @Override
    public Payment getPaymentByOrderCodeAndUserId(Long orderCode, Long userId) {
        return paymentRepository.findByOrderCodeAndUserId(orderCode, userId);
    }

    @Override
    @Transactional
    public Payment cancelPayment(Long orderCode) {
        Payment payment = paymentRepository.findByOrderCode(orderCode);
        if (payment == null) {
            throw new RuntimeException("Payment not found");
        }

        try {
            payOS.cancelPaymentLink(orderCode, null);
            payment.setStatus(PaymentStatus.CANCELLED);

            if (payment.getOrder() != null) {
                 payment.getOrder().setStatus(OrderStatus.CANCELLED);
                 orderRepository.save(payment.getOrder());
            }

            return paymentRepository.save(payment);
        } catch (Exception e) {
            throw new RuntimeException("Failed to cancel payment: " + e.getMessage());
        }
    }

    @Override
    @Transactional
    public List<Payment> getPaymentsByUserId(Long userId) {
        return paymentRepository.findByUserId(userId);
    }

    @Override
    @Transactional
    public void handlePaymentWebhook(String orderCode, String status) {
        Payment payment = paymentRepository.findByOrderCode(Long.parseLong(orderCode));
        if (payment == null) {
            throw new RuntimeException("Payment not found for order code: " + orderCode);
        }

        // Kiểm tra xem Payment này đã được xử lý chưa
        if (payment.getStatus() == PaymentStatus.COMPLETED || payment.getStatus() == PaymentStatus.CANCELLED || payment.getStatus() == PaymentStatus.FAILED) {
             return;
        }

        switch (status.toUpperCase()) {
            case "PAID":
                payment.setStatus(PaymentStatus.COMPLETED);

                // Cập nhật trạng thái Order liên quan
                if (payment.getOrder() != null) {
                     payment.getOrder().setStatus(OrderStatus.COMPLETED);
                     orderRepository.save(payment.getOrder());

                     // Lấy Order liên quan
                     Order completedOrder = payment.getOrder();

                     // Tạo Transaction cho toàn bộ Order
                     Transaction transaction = new Transaction();
                     transaction.setOrder(completedOrder); // Liên kết với Order
                     // Cần lấy payosTransactionId chính xác từ dữ liệu webhook
                     // Tạm thời vẫn dùng orderCode, nhưng cần kiểm tra cách PayOS trả về transaction ID thực tế
                     transaction.setPayosTransactionId(String.valueOf(payment.getOrderCode()));
                     transaction.setAmount(completedOrder.getTotalAmount()); // Tổng tiền của Order
                     transaction.setStatus(TransactionStatus.COMPLETED);
                     transaction.setTransactionDate(LocalDateTime.now());
                     transactionRepository.save(transaction);

                     // Tạo CourseEnrollment cho từng OrderItem
                     if (completedOrder.getOrderItems() != null) {
                         for (OrderItem item : completedOrder.getOrderItems()) {
                             // Kiểm tra xem học sinh đã được đăng ký khóa học này chưa
                             if (!courseEnrollmentRepository.existsByChildIdAndCourseCourseId(item.getChild().getId(), item.getCourse().getCourseId())) {
                                 CourseEnrollment enrollment = new CourseEnrollment();
                                 enrollment.setCourse(item.getCourse());
                                 enrollment.setChild(item.getChild());
                                 enrollment.setParent(completedOrder.getParent());
                                 courseEnrollmentRepository.save(enrollment);
                             }
                         }
                     }
                }

                break;
            case "CANCELLED":
                payment.setStatus(PaymentStatus.CANCELLED);
                 // Cập nhật trạng thái Order liên quan
                if (payment.getOrder() != null) {
                     payment.getOrder().setStatus(OrderStatus.CANCELLED);
                     orderRepository.save(payment.getOrder());
                }
                break;
            case "FAILED":
                payment.setStatus(PaymentStatus.FAILED);
                 // Cập nhật trạng thái Order liên quan
                if (payment.getOrder() != null) {
                     payment.getOrder().setStatus(OrderStatus.FAILED);
                     orderRepository.save(payment.getOrder());
                }
                break;
            default:
                throw new RuntimeException("Invalid payment status received from webhook: " + status);
        }

        paymentRepository.save(payment);
    }

    @Override
    @Transactional
    public Payment handlePaymentReturn(Long orderCode) {
        Payment payment = paymentRepository.findByOrderCode(orderCode);
        if (payment == null) {
            throw new RuntimeException("Payment not found for order code: " + orderCode);
        }

        if (payment.getStatus() == PaymentStatus.COMPLETED || 
            payment.getStatus() == PaymentStatus.CANCELLED || 
            payment.getStatus() == PaymentStatus.FAILED) {
            return payment;
        }

        try {
            payment.setStatus(PaymentStatus.COMPLETED);

            // Cập nhật trạng thái Order
            if (payment.getOrder() != null) {
                Order order = payment.getOrder();
                order.setStatus(OrderStatus.COMPLETED);
                order = orderRepository.save(order);

                // Tạo Transaction cho toàn bộ Order
                Transaction transaction = new Transaction();
                transaction.setOrder(order);
                transaction.setPayosTransactionId(String.valueOf(payment.getOrderCode())); 
                transaction.setAmount(order.getTotalAmount());
                transaction.setStatus(TransactionStatus.COMPLETED);
                transaction.setTransactionDate(LocalDateTime.now());
                transactionRepository.save(transaction);

                // Tạo CourseEnrollment cho từng OrderItem
                if (order.getOrderItems() != null) {
                    for (OrderItem item : order.getOrderItems()) {
                        if (!courseEnrollmentRepository.existsByChildIdAndCourseCourseId(item.getChild().getId(), item.getCourse().getCourseId())) {
                            CourseEnrollment enrollment = new CourseEnrollment();
                            enrollment.setCourse(item.getCourse());
                            enrollment.setChild(item.getChild());
                            enrollment.setParent(order.getParent());
                            courseEnrollmentRepository.save(enrollment);
                        }
                    }
                }

                // XÓA GIỎ HÀNG SAU KHI THANH TOÁN THÀNH CÔNG
                if (order.getOrderItems() != null && !order.getOrderItems().isEmpty()) {
                    List<Long> courseIds = order.getOrderItems().stream()
                            .map(item -> item.getCourse().getCourseId())
                            .collect(Collectors.toList());
                    Long parentId = order.getParent().getId();
                    
                    List<ShoppingCart> itemsToDelete = shoppingCartRepository.findByParentId(parentId).stream()
                            .filter(item -> courseIds.contains(item.getCourse().getCourseId()))
                            .collect(Collectors.toList());
                    
                    if (!itemsToDelete.isEmpty()) {
                        shoppingCartRepository.deleteAll(itemsToDelete);
                    }
                }
            }

            return paymentRepository.save(payment);

        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Failed to process payment return: " + e.getMessage());
        }
    }

    @Override
    @Transactional
    public List<TransactionDto> getTransactionsByUserId(Long userId) {
        List<Transaction> transactions = transactionRepository.findByOrder_Parent_IdWithOrderItems(userId);
        
        // Chuyển đổi danh sách Transaction entity sang TransactionDto
        return transactions.stream()
                .map(this::convertToDto) // Sử dụng phương thức helper
                .collect(Collectors.toList());
    }

    @Override // LTD
    public TotalRevenueDto getTotalRevenueForTeacher(Long teacherId) {
        double totalRevenue = orderItemRepository.calculateRevenueForTeacher(teacherId);
        return new TotalRevenueDto(totalRevenue);
    }

    private TransactionDto convertToDto(Transaction transaction) {
        List<OrderItemDto> itemDtos = new ArrayList<>();
        if (transaction.getOrder() != null && transaction.getOrder().getOrderItems() != null) {
            itemDtos = transaction.getOrder().getOrderItems().stream()
                    .map(item -> new OrderItemDto(
                            item.getCourse().getTitle(),
                            item.getPrice(),
                            item.getChild().getFullName()
                    ))
                    .collect(Collectors.toList());
        }

        return new TransactionDto(
                transaction.getTransactionId(),
                transaction.getPayosTransactionId(),
                transaction.getOrder() != null ? transaction.getOrder().getOrderId() : null,
                transaction.getAmount(),
                transaction.getStatus(),
                transaction.getTransactionDate(),
                itemDtos
        );
    }

    // Có thể thêm phương thức mới để lấy Order và OrderItems cho phụ huynh
    // public List<Order> getOrdersByParentId(Long parentId) {
    //     return orderRepository.findByParentId(parentId);
    // }

    // public Order getOrderDetails(Long orderId) {
    //     return orderRepository.findById(orderId)
    //             .orElseThrow(() -> new RuntimeException("Order not found"));
    // }

}