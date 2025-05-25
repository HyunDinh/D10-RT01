package com.d10rt01.hocho.service;

import com.d10rt01.hocho.entity.CartStatus;
import com.d10rt01.hocho.entity.ShoppingCart;
import com.d10rt01.hocho.entity.User;
import com.d10rt01.hocho.entity.Course;
import com.d10rt01.hocho.repository.ShoppingCartRepository;
import com.d10rt01.hocho.repository.UserRepository;
import com.d10rt01.hocho.repository.CourseRepository;
import com.d10rt01.hocho.repository.ParentChildMappingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ShoppingCartService {

    @Autowired
    private ShoppingCartRepository shoppingCartRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private ParentChildMappingRepository parentChildMappingRepository;

    public List<ShoppingCart> getParentCart(Long parentId) {
        return shoppingCartRepository.findByParentUserId(parentId);
    }

    @Transactional
    public ShoppingCart approveRequest(Long parentId, Long cartItemId) {
        ShoppingCart cartItem = shoppingCartRepository.findById(cartItemId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy mục trong giỏ hàng"));

        if (!cartItem.getParent().getUserId().equals(parentId)) {
            throw new RuntimeException("Mục giỏ hàng không thuộc về phụ huynh này");
        }

        if (cartItem.getStatusByParent() != CartStatus.PENDING_APPROVAL) {
            throw new RuntimeException("Chỉ có thể phê duyệt yêu cầu đang chờ xử lý");
        }

        cartItem.setStatusByParent(CartStatus.ACCEPTED);
        return shoppingCartRepository.save(cartItem);
    }

    @Transactional
    public ShoppingCart rejectRequest(Long parentId, Long cartItemId) {
        ShoppingCart cartItem = shoppingCartRepository.findById(cartItemId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy mục trong giỏ hàng"));

        if (!cartItem.getParent().getUserId().equals(parentId)) {
            throw new RuntimeException("Mục giỏ hàng không thuộc về phụ huynh này");
        }

        if (cartItem.getStatusByParent() != CartStatus.PENDING_APPROVAL) {
            throw new RuntimeException("Chỉ có thể từ chối yêu cầu đang chờ xử lý");
        }

        cartItem.setStatusByParent(CartStatus.REJECTED);
        return shoppingCartRepository.save(cartItem);
    }

    @Transactional
    public ShoppingCart addCourseDirectlyByParent(Long parentId, Long childId, Long courseId) {
        // Kiểm tra parent có tồn tại và có quyền quản lý child không
        User parent = userRepository.findById(parentId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy phụ huynh"));
        
        User child = userRepository.findById(childId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy trẻ em"));

        // Kiểm tra mối quan hệ parent-child
        if (!parentChildMappingRepository.existsByParentUserIdAndChildUserId(parentId, childId)) {
            throw new RuntimeException("Phụ huynh không có quyền quản lý trẻ em này");
        }

        // Kiểm tra khóa học có tồn tại không
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy khóa học"));

        // Kiểm tra xem khóa học đã có trong giỏ hàng chưa
        if (shoppingCartRepository.existsByParentUserIdAndChildUserIdAndCourseCourseId(parentId, childId, courseId)) {
            throw new RuntimeException("Khóa học đã có trong giỏ hàng");
        }

        // Tạo mới item trong giỏ hàng
        ShoppingCart cartItem = new ShoppingCart();
        cartItem.setParent(parent);
        cartItem.setChild(child);
        cartItem.setCourse(course);
        cartItem.setStatusByParent(CartStatus.ADDED_DIRECTLY);

        return shoppingCartRepository.save(cartItem);
    }

    @Transactional
    public void removeFromCart(Long parentId, Long cartItemId) {
        ShoppingCart cartItem = shoppingCartRepository.findById(cartItemId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy mục trong giỏ hàng"));

        // Kiểm tra quyền sở hữu
        if (!cartItem.getParent().getUserId().equals(parentId)) {
            throw new RuntimeException("Mục giỏ hàng không thuộc về phụ huynh này");
        }

        // Xóa item khỏi giỏ hàng
        shoppingCartRepository.delete(cartItem);
    }
} 