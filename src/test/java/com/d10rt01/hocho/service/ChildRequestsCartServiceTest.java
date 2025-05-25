package com.d10rt01.hocho.service;

import com.d10rt01.hocho.entity.ChildRequestsCart;
import com.d10rt01.hocho.entity.Course;
import com.d10rt01.hocho.entity.User;
import com.d10rt01.hocho.entity.UserRole;
import com.d10rt01.hocho.repository.ChildRequestsCartRepository;
import com.d10rt01.hocho.repository.CourseRepository;
import com.d10rt01.hocho.repository.UserRepository;
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

class ChildRequestsCartServiceTest {

    @Mock
    private ChildRequestsCartRepository childRequestsCartRepository;

    @Mock
    private CourseRepository courseRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private ChildRequestsCartService childRequestsCartService;

    private User child;
    private Course course;
    private ChildRequestsCart cart;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);

        // Tạo dữ liệu mẫu
        child = new User();
        child.setUserId(1L);
        child.setUsername("child1");
        child.setRole(UserRole.CHILD);

        course = new Course();
        course.setCourseId(1L);
        course.setTitle("Test Course");

        cart = new ChildRequestsCart();
        cart.setRequestCartId(1L);
        cart.setChild(child);
        cart.setCourse(course);
    }

    @Test
    void addToCart_Success() {
        // Arrange
        when(userRepository.findById(1L)).thenReturn(Optional.of(child));
        when(courseRepository.findById(1L)).thenReturn(Optional.of(course));
        when(childRequestsCartRepository.existsByChildUserIdAndCourseCourseId(1L, 1L)).thenReturn(false);
        when(childRequestsCartRepository.save(any(ChildRequestsCart.class))).thenReturn(cart);

        // Act
        ChildRequestsCart result = childRequestsCartService.addToCart(1L, 1L);

        // Assert
        assertNotNull(result);
        assertEquals(1L, result.getRequestCartId());
        assertEquals(child, result.getChild());
        assertEquals(course, result.getCourse());
        verify(childRequestsCartRepository).save(any(ChildRequestsCart.class));
    }

    @Test
    void addToCart_CourseAlreadyExists() {
        // Arrange
        when(childRequestsCartRepository.existsByChildUserIdAndCourseCourseId(1L, 1L)).thenReturn(true);

        // Act & Assert
        assertThrows(RuntimeException.class, () -> childRequestsCartService.addToCart(1L, 1L));
    }

    @Test
    void getChildCart_Success() {
        // Arrange
        List<ChildRequestsCart> expectedCart = Arrays.asList(cart);
        when(childRequestsCartRepository.findByChildUserId(1L)).thenReturn(expectedCart);

        // Act
        List<ChildRequestsCart> result = childRequestsCartService.getChildCart(1L);

        // Assert
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals(cart, result.get(0));
    }

    @Test
    void removeFromCart_Success() {
        // Act
        childRequestsCartService.removeFromCart(1L, 1L);

        // Assert
        verify(childRequestsCartRepository).deleteByChildUserIdAndCourseCourseId(1L, 1L);
    }
} 