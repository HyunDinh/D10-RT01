package d10_rt01.hocho.controller.shoppingCart;


import d10_rt01.hocho.model.ChildRequestsCart;
import d10_rt01.hocho.service.shoppingCart.ChildRequestsCartService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/child-cart")
public class ChildRequestsCartController {

    @Autowired
    private ChildRequestsCartService childRequestsCartService;

    //Trẻ em thêm khóa học vào giỏ hàng
    @PostMapping("/{childId}/add/{courseId}")
    public ResponseEntity<ChildRequestsCart> addToCart(
            @PathVariable Long childId,
            @PathVariable Long courseId) {
        try {
            ChildRequestsCart cart = childRequestsCartService.addToCart(childId, courseId);
            return ResponseEntity.ok(cart);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(null);
        }
    }

    //Trẻ em xem giỏ hàng của minh
    @GetMapping("/{childId}")
    public ResponseEntity<List<ChildRequestsCart>> getChildCart(@PathVariable Long childId) {
        List<ChildRequestsCart> cart = childRequestsCartService.getChildCart(childId);
        return ResponseEntity.ok(cart);
    }

    //Trẻ em xóa khóa học khỏi giỏ hàng
    @DeleteMapping("/{childId}/remove/{courseId}")
    public ResponseEntity<Void> removeFromCart(
            @PathVariable Long childId,
            @PathVariable Long courseId) {
        try {
            childRequestsCartService.removeFromCart(childId, courseId);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    //Trẻ em gửi những khóa học có trong giỏ hàng yêu cầu cho phụ huynh mua
    @PostMapping("/{childId}/send-to-parent")
    public ResponseEntity<Void> sendRequestsToParent(@PathVariable Long childId) {
        try {
            childRequestsCartService.sendRequestsToParent(childId);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
} 