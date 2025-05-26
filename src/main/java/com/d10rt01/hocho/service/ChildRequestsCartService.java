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

    //Thêm khóa học vào giỏ hàng
    @Transactional
    public ChildRequestsCart addToCart(Long childId, Long courseId) {

        // Kiểm tra xem khóa học đã có trong giỏ hàng yêu cầu của trẻ chưa
        if (childRequestsCartRepository.existsByChildUserIdAndCourseCourseId(childId, courseId)) {
            throw new RuntimeException("Khóa học đã có trong giỏ yêu cầu.");
        }

        // Lấy thông tin trẻ em
        User child = userRepository.findById(childId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy trẻ em."));

        // Lấy thông tin khóa học
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy khóa học."));

        //SET Id của trẻ em và Id khóa học trẻ em chọn
        ChildRequestsCart cart = new ChildRequestsCart();
        cart.setChild(child);
        cart.setCourse(course);

        //Lưu xuống giỏ hàng của trẻ em
        return childRequestsCartRepository.save(cart);
    }

    //Hiển thị danh sách khóa học có trong giỏ hàng của trẻ em vàthông tin liên quan
    public List<ChildRequestsCart> getChildCart(Long childId) {
        return childRequestsCartRepository.findByChildUserId(childId);
    }

    //Xóa khóa học khỏi giỏ hàng của trẻ em
    @Transactional
    public void removeFromCart(Long childId, Long courseId) {
        childRequestsCartRepository.deleteByChildUserIdAndCourseCourseId(childId, courseId);
    }

    //Gửi yêu cầu mua khóa học tới cho phụ huynh
    @Transactional
    public void sendRequestsToParent(Long childId) {
        // 1. Lấy tất cả các yêu cầu hiện có của trẻ
        List<ChildRequestsCart> childRequests = childRequestsCartRepository.findByChildUserId(childId);

        if (childRequests.isEmpty()) {
            throw new RuntimeException("Không có yêu cầu nào để gửi.");
        }

        // 2. Tìm phụ huynh của trẻ
        ParentChildMapping parentMappings = parentChildMappingRepository.findByChildUserId(childId);

        if (parentMappings == null) {
             throw new RuntimeException("Không tìm thấy phụ huynh cho trẻ này.");
        }

        // 3. Đối với mỗi yêu cầu và phụ huynh, thêm vào Shopping Cart của phụ huynh
        for (ChildRequestsCart request : childRequests) {

            Course course = request.getCourse(); // Lấy thông tin khóa học từ yêu cầu của trẻ

            User parent = parentMappings.getParent(); //Lấy parent của trẻ em

                // Kiểm tra xem mục này đã tồn tại trong giỏ hàng của phụ huynh chưa để tránh thêm trùng lặp
                 boolean existsInParentCart = shoppingCartRepository.existsByParentUserIdAndChildUserIdAndCourseCourseId(parent.getUserId(), childId, course.getCourseId());

                 //Nếu chưa có thì thêm vào giỏ hàng của phụ huynh
                if (!existsInParentCart) {
                    ShoppingCart parentCartItem = new ShoppingCart();
                    parentCartItem.setParent(parent); //SET Id của phụ huynh
                    parentCartItem.setChild(request.getChild()); // Sử dụng User child từ request
                    parentCartItem.setCourse(course); //SET Id của khóa học
                    parentCartItem.setStatusByParent(CartStatus.PENDING_APPROVAL); // Đặt trạng thái là chờ phê duyệt

                    //Lưu xuống giỏ hàng của parent
                    shoppingCartRepository.save(parentCartItem);
                }

        }

        // 4. Xóa tất cả các yêu cầu đã gửi khỏi ChildRequestsCart
        childRequestsCartRepository.deleteAll(childRequests);
    }
} 