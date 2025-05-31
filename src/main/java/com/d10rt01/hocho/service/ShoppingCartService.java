package com.d10rt01.hocho.service;

import com.d10rt01.hocho.model.CartStatus;
import com.d10rt01.hocho.model.Course;
import com.d10rt01.hocho.model.ShoppingCart;
import com.d10rt01.hocho.model.User;
import com.d10rt01.hocho.repository.CourseRepository;
import com.d10rt01.hocho.repository.ParentChildMappingRepository;
import com.d10rt01.hocho.repository.ShoppingCartRepository;
import com.d10rt01.hocho.repository.UserRepository;
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

    //Hiển thị danh sách các khóa học có trong giỏ hàng của phụ huynh
    public List<ShoppingCart> getParentCart(Long parentId) {
        return shoppingCartRepository.findByParentId(parentId);
    }

    //Chấp nhận khóa học được yêu cầu từ trẻ em
    @Transactional
    public ShoppingCart approveRequest(Long parentId, Long cartItemId) {

        //Tìm xem có mục trong giỏ hàng không .
        ShoppingCart cartItem = shoppingCartRepository.findById(cartItemId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy mục trong giỏ hàng"));

        //Kiểm tra xem mục đó có khớp với phụ huynh để phụ huynh approve không
        if (!cartItem.getParent().getId().equals(parentId)) {
            throw new RuntimeException("Mục giỏ hàng không thuộc về phụ huynh này");
        }

        //Nếu trạng thái của mục không phải là trạng thái Pending_Approval thì sẽ không được phê duyệt , nói cách khác chỉ có trạng thái Pending_Approval thì mới được APPROVE hoặc REJECT
        if (cartItem.getStatusByParent() != CartStatus.PENDING_APPROVAL) {
            throw new RuntimeException("Chỉ có thể phê duyệt yêu cầu đang chờ xử lý");
        }

        //Đổi trạng thái của mục sang ACCEPTED .
        cartItem.setStatusByParent(CartStatus.ACCEPTED);

        //Update lại trạng thái
        return shoppingCartRepository.save(cartItem);
    }

    //Từ chối khóa học được yêu cầu từ trẻ em
    @Transactional
    public ShoppingCart rejectRequest(Long parentId, Long cartItemId) {

        //Tìm xem có mục trong giỏ hàng không .
        ShoppingCart cartItem = shoppingCartRepository.findById(cartItemId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy mục trong giỏ hàng"));

        //Kiểm tra xem mục đó có khớp với phụ huynh để phụ huynh approve không
        if (!cartItem.getParent().getId().equals(parentId)) {
            throw new RuntimeException("Mục giỏ hàng không thuộc về phụ huynh này");
        }

        //Nếu trạng thái của mục không phải là trạng thái Pending_Approval thì sẽ không được phê duyệt , nói cách khác chỉ có trạng thái Pending_Approval thì mới được APPROVE hoặc REJECT
        if (cartItem.getStatusByParent() != CartStatus.PENDING_APPROVAL) {
            throw new RuntimeException("Chỉ có thể từ chối yêu cầu đang chờ xử lý");
        }

        //Đổi trạng thái của mục sang ACCEPTED .
        cartItem.setStatusByParent(CartStatus.REJECTED);

        //Update lại trạng thái
        return shoppingCartRepository.save(cartItem);
    }

    //Phụ huynh add khóa học trực tiếp vào giỏ hàng mà không cần trẻ em gửi yêu cầu
    @Transactional
    public ShoppingCart addCourseDirectlyByParent(Long parentId, Long childId, Long courseId) {
        // Kiểm tra parent có tồn tại không
        User parent = userRepository.findById(parentId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy phụ huynh"));

        // Kiểm tra trẻ em có tồn tại không
        User child = userRepository.findById(childId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy trẻ em"));

        // Kiểm tra mối quan hệ parent-child , có khớp nhau hay không .
        if (!parentChildMappingRepository.existsByParentIdAndChildId(parentId, childId)) {
            throw new RuntimeException("Phụ huynh không có quyền quản lý trẻ em này");
        }

        // Kiểm tra khóa học có tồn tại không
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy khóa học"));

        // Kiểm tra xem khóa học đã có trong giỏ hàng chưa
        if (shoppingCartRepository.existsByParentIdAndChildIdAndCourseCourseId(parentId, childId, courseId)) {
            throw new RuntimeException("Khóa học đã có trong giỏ hàng");
        }

        // Tạo mới item trong giỏ hàng
        ShoppingCart cartItem = new ShoppingCart();
        cartItem.setParent(parent); //SET ID parent
        cartItem.setChild(child); //SET ID trẻ em
        cartItem.setCourse(course); //SET ID khóa học
        cartItem.setStatusByParent(CartStatus.ADDED_DIRECTLY); //SET trạng thái của mục là ADDED_DIRECTLY

        //Lưu vào giỏ hàng của parent
        return shoppingCartRepository.save(cartItem);
    }

    //Xóa khóa học khỏi giỏ hàng của phụ huynh
    @Transactional
    public void removeFromCart(Long parentId, Long cartItemId) {

        //Tìm xem có mục trong giỏ hàng không .
        ShoppingCart cartItem = shoppingCartRepository.findById(cartItemId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy mục trong giỏ hàng"));

        //Kiểm tra xem mục đó có khớp với phụ huynh không
        if (!cartItem.getParent().getId().equals(parentId)) {
            throw new RuntimeException("Mục giỏ hàng không thuộc về phụ huynh này");
        }

        // Xóa item khỏi giỏ hàng
        shoppingCartRepository.delete(cartItem);
    }
} 