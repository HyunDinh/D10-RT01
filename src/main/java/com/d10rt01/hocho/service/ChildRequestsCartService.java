package com.d10rt01.hocho.service;

import com.d10rt01.hocho.entity.CartStatus;
import com.d10rt01.hocho.entity.ChildRequestsCart;
import com.d10rt01.hocho.entity.Course;
import com.d10rt01.hocho.entity.User;
import com.d10rt01.hocho.entity.ParentChildMapping;
import com.d10rt01.hocho.entity.ShoppingCart;

import com.d10rt01.hocho.repository.ChildRequestsCartRepository;
import com.d10rt01.hocho.repository.CourseRepository;
import com.d10rt01.hocho.repository.UserRepository;
import com.d10rt01.hocho.repository.ParentChildMappingRepository;
import com.d10rt01.hocho.repository.ShoppingCartRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class ChildRequestsCartService {

    @Autowired
    private ChildRequestsCartRepository childRequestsCartRepository;

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ParentChildMappingRepository parentChildMappingRepository;

    @Autowired
    private ShoppingCartRepository shoppingCartRepository;

    @Transactional
    public ChildRequestsCart addToCart(Long childId, Long courseId) {
        // Kiểm tra xem khóa học đã có trong giỏ hàng yêu cầu của trẻ chưa
        if (childRequestsCartRepository.existsByChildUserIdAndCourseCourseId(childId, courseId)) {
            throw new RuntimeException("Khóa học đã có trong giỏ yêu cầu.");
        }

        // Lấy thông tin trẻ em và khóa học
        User child = userRepository.findById(childId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy trẻ em."));
        
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy khóa học."));

        // Tạo mới giỏ hàng yêu cầu của trẻ
        ChildRequestsCart cart = new ChildRequestsCart();
        cart.setChild(child);
        cart.setCourse(course);

        return childRequestsCartRepository.save(cart);
    }

    public List<ChildRequestsCart> getChildCart(Long childId) {
        return childRequestsCartRepository.findByChildUserId(childId);
    }

    @Transactional
    public void removeFromCart(Long childId, Long courseId) {
        childRequestsCartRepository.deleteByChildUserIdAndCourseCourseId(childId, courseId);
    }

    @Transactional
    public void sendRequestsToParent(Long childId) {
        // 1. Lấy tất cả các yêu cầu hiện có của trẻ
        List<ChildRequestsCart> childRequests = childRequestsCartRepository.findByChildUserId(childId);

        if (childRequests.isEmpty()) {
            throw new RuntimeException("Không có yêu cầu nào để gửi.");
        }

        // 2. Tìm tất cả phụ huynh của trẻ
        List<ParentChildMapping> parentMappings = parentChildMappingRepository.findByChildUserId(childId);

        if (parentMappings.isEmpty()) {
             throw new RuntimeException("Không tìm thấy phụ huynh cho trẻ này.");
        }

        // 3. Đối với mỗi yêu cầu và mỗi phụ huynh, thêm vào Shopping Cart của phụ huynh
        for (ChildRequestsCart request : childRequests) {
            Course course = request.getCourse(); // Lấy thông tin khóa học từ yêu cầu của trẻ

            for (ParentChildMapping mapping : parentMappings) {
                User parent = mapping.getParent();

                // Kiểm tra xem mục này đã tồn tại trong giỏ hàng của phụ huynh chưa để tránh thêm trùng lặp
                 boolean existsInParentCart = shoppingCartRepository.existsByParentUserIdAndChildUserIdAndCourseCourseId(parent.getUserId(), childId, course.getCourseId());

                if (!existsInParentCart) {
                    ShoppingCart parentCartItem = new ShoppingCart();
                    parentCartItem.setParent(parent);
                    parentCartItem.setChild(request.getChild()); // Sử dụng User child từ request
                    parentCartItem.setCourse(course);
                    parentCartItem.setStatusByParent(CartStatus.PENDING_APPROVAL); // Đặt trạng thái là chờ phê duyệt

                    shoppingCartRepository.save(parentCartItem);
                }
            }
        }

        // 4. Xóa tất cả các yêu cầu đã gửi khỏi ChildRequestsCart
        childRequestsCartRepository.deleteAll(childRequests);
    }
} 