package com.d10rt01.hocho.service;

import com.d10rt01.hocho.entity.CartStatus;
import com.d10rt01.hocho.entity.Course;
import com.d10rt01.hocho.entity.User;
import com.d10rt01.hocho.entity.ShoppingCart;
import com.d10rt01.hocho.repository.ShoppingCartRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class ShoppingCartServiceTest {

    @Mock
    private ShoppingCartRepository shoppingCartRepository;

    // Có thể cần mock các repository khác nếu service sử dụng chúng
    // @Mock
    // private UserRepository userRepository;
    // @Mock
    // private CourseRepository courseRepository;

    @InjectMocks
    private ShoppingCartService shoppingCartService;

    private User parentUser;
    private User childUser;
    private Course testCourse;
    private ShoppingCart pendingCartItem;
    private ShoppingCart acceptedCartItem;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);

        // Tạo dữ liệu mẫu (giả lập)
        parentUser = new User();
        parentUser.setUserId(1L);
        parentUser.setUsername("parent1");

        childUser = new User();
        childUser.setUserId(2L);
        childUser.setUsername("child1");

        testCourse = new Course();
        testCourse.setCourseId(101L);
        testCourse.setTitle("Test Course");

        pendingCartItem = new ShoppingCart();
        pendingCartItem.setCartId(1000L);
        pendingCartItem.setParent(parentUser);
        pendingCartItem.setChild(childUser);
        pendingCartItem.setCourse(testCourse);
        pendingCartItem.setStatusByParent(CartStatus.PENDING_APPROVAL);

        acceptedCartItem = new ShoppingCart();
        acceptedCartItem.setCartId(1001L);
        acceptedCartItem.setParent(parentUser);
        acceptedCartItem.setChild(childUser);
        acceptedCartItem.setCourse(testCourse);
        acceptedCartItem.setStatusByParent(CartStatus.ACCEPTED);
    }

    @Test
    void getParentCart_Success() {
        // Arrange
        List<ShoppingCart> expectedCart = Arrays.asList(pendingCartItem, acceptedCartItem);
        when(shoppingCartRepository.findByParentUserId(1L)).thenReturn(expectedCart);

        // Act
        List<ShoppingCart> result = shoppingCartService.getParentCart(1L);

        // Assert
        assertNotNull(result);
        assertEquals(2, result.size());
        assertEquals(expectedCart, result);
        verify(shoppingCartRepository, times(1)).findByParentUserId(1L);
    }

    @Test
    void approveRequest_Success() {
        // Arrange
        when(shoppingCartRepository.findById(1000L)).thenReturn(Optional.of(pendingCartItem));
        when(shoppingCartRepository.save(any(ShoppingCart.class))).thenReturn(pendingCartItem); // Return the updated item

        // Act
        ShoppingCart result = shoppingCartService.approveRequest(1L, 1000L);

        // Assert
        assertNotNull(result);
        assertEquals(CartStatus.ACCEPTED, result.getStatusByParent());
        verify(shoppingCartRepository, times(1)).findById(1000L);
        verify(shoppingCartRepository, times(1)).save(pendingCartItem);
    }

    @Test
    void approveRequest_CartItemNotFound_ThrowsException() {
        // Arrange
        when(shoppingCartRepository.findById(1000L)).thenReturn(Optional.empty());

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class,
                () -> shoppingCartService.approveRequest(1L, 1000L));
        assertEquals("Không tìm thấy mục trong giỏ hàng", exception.getMessage());
        verify(shoppingCartRepository, times(1)).findById(1000L);
        verify(shoppingCartRepository, never()).save(any(ShoppingCart.class));
    }

    @Test
    void approveRequest_WrongParent_ThrowsException() {
        // Arrange
        User wrongParent = new User();
        wrongParent.setUserId(99L);
        ShoppingCart itemForWrongParent = new ShoppingCart();
        itemForWrongParent.setCartId(1002L);
        itemForWrongParent.setParent(wrongParent); // This item belongs to a different parent
        itemForWrongParent.setStatusByParent(CartStatus.PENDING_APPROVAL);

        when(shoppingCartRepository.findById(1002L)).thenReturn(Optional.of(itemForWrongParent));

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class,
                () -> shoppingCartService.approveRequest(1L, 1002L)); // Trying to approve with parentId 1L
        assertEquals("Mục giỏ hàng không thuộc về phụ huynh này", exception.getMessage());
        verify(shoppingCartRepository, times(1)).findById(1002L);
        verify(shoppingCartRepository, never()).save(any(ShoppingCart.class));
    }

     @Test
    void approveRequest_WrongStatus_ThrowsException() {
        // Arrange
         // Using the acceptedCartItem which has status ACCEPTED
        when(shoppingCartRepository.findById(1001L)).thenReturn(Optional.of(acceptedCartItem));

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class,
                () -> shoppingCartService.approveRequest(1L, 1001L)); // Trying to approve an accepted item
        assertEquals("Chỉ có thể phê duyệt yêu cầu đang chờ xử lý", exception.getMessage());
        verify(shoppingCartRepository, times(1)).findById(1001L);
        verify(shoppingCartRepository, never()).save(any(ShoppingCart.class));
    }

     @Test
    void rejectRequest_Success() {
        // Arrange
        when(shoppingCartRepository.findById(1000L)).thenReturn(Optional.of(pendingCartItem));
        when(shoppingCartRepository.save(any(ShoppingCart.class))).thenReturn(pendingCartItem); // Return the updated item

        // Act
        ShoppingCart result = shoppingCartService.rejectRequest(1L, 1000L);

        // Assert
        assertNotNull(result);
        assertEquals(CartStatus.REJECTED, result.getStatusByParent());
        verify(shoppingCartRepository, times(1)).findById(1000L);
        verify(shoppingCartRepository, times(1)).save(pendingCartItem);
    }

     @Test
    void rejectRequest_CartItemNotFound_ThrowsException() {
        // Arrange
        when(shoppingCartRepository.findById(1000L)).thenReturn(Optional.empty());

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class,
                () -> shoppingCartService.rejectRequest(1L, 1000L));
        assertEquals("Không tìm thấy mục trong giỏ hàng", exception.getMessage());
        verify(shoppingCartRepository, times(1)).findById(1000L);
        verify(shoppingCartRepository, never()).save(any(ShoppingCart.class));
    }

    @Test
    void rejectRequest_WrongParent_ThrowsException() {
        // Arrange
        User wrongParent = new User();
        wrongParent.setUserId(99L);
        ShoppingCart itemForWrongParent = new ShoppingCart();
        itemForWrongParent.setCartId(1002L);
        itemForWrongParent.setParent(wrongParent); // This item belongs to a different parent
        itemForWrongParent.setStatusByParent(CartStatus.PENDING_APPROVAL);

        when(shoppingCartRepository.findById(1002L)).thenReturn(Optional.of(itemForWrongParent));

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class,
                () -> shoppingCartService.rejectRequest(1L, 1002L)); // Trying to reject with parentId 1L
        assertEquals("Mục giỏ hàng không thuộc về phụ huynh này", exception.getMessage());
        verify(shoppingCartRepository, times(1)).findById(1002L);
        verify(shoppingCartRepository, never()).save(any(ShoppingCart.class));
    }

     @Test
    void rejectRequest_WrongStatus_ThrowsException() {
        // Arrange
         // Using the acceptedCartItem which has status ACCEPTED
        when(shoppingCartRepository.findById(1001L)).thenReturn(Optional.of(acceptedCartItem));

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class,
                () -> shoppingCartService.rejectRequest(1L, 1001L)); // Trying to reject an accepted item
        assertEquals("Chỉ có thể từ chối yêu cầu đang chờ xử lý", exception.getMessage());
        verify(shoppingCartRepository, times(1)).findById(1001L);
        verify(shoppingCartRepository, never()).save(any(ShoppingCart.class));
    }
} 