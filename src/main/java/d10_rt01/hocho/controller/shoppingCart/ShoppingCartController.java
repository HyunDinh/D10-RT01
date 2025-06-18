package d10_rt01.hocho.controller.shoppingCart;

import d10_rt01.hocho.model.ShoppingCart;
import d10_rt01.hocho.service.shoppingCart.ShoppingCartService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/parent-cart")
public class ShoppingCartController {

    @Autowired
    private ShoppingCartService shoppingCartService;

    //Phụ huynh xem những khóa học có trong giỏ hàng
    @GetMapping("/{parentId}")
    public ResponseEntity<List<ShoppingCart>> getParentCart(@PathVariable Long parentId) {
        List<ShoppingCart> cart = shoppingCartService.getParentCart(parentId);
        return ResponseEntity.ok(cart);
    }

    //Phụ huynh chấp nhận yêu cầu mua khóa học từ trẻ em
    @PostMapping("/{parentId}/approve/{cartItemId}")
    public ResponseEntity<ShoppingCart> approveRequest(
            @PathVariable Long parentId,
            @PathVariable Long cartItemId) {
        try {
            ShoppingCart updatedCartItem = shoppingCartService.approveRequest(parentId, cartItemId);
            return ResponseEntity.ok(updatedCartItem);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(null);
        }
    }

    //Phụ huynh từ chối yêu cầu mua khóa học từ trẻ em
    @PostMapping("/{parentId}/reject/{cartItemId}")
    public ResponseEntity<ShoppingCart> rejectRequest(
            @PathVariable Long parentId,
            @PathVariable Long cartItemId) {
        try {
            ShoppingCart updatedCartItem = shoppingCartService.rejectRequest(parentId, cartItemId);
            return ResponseEntity.ok(updatedCartItem);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(null);
        }
    }

    //Phụ huynh tự trực tiếp add khóa học vào giỏ hàng của chính mình
    @PostMapping("/{parentId}/add-course/{childId}/{courseId}")
    public ResponseEntity<ShoppingCart> addCourseDirectlyByParent(
            @PathVariable Long parentId,
            @PathVariable Long childId,
            @PathVariable Long courseId) {
        try {
            ShoppingCart cartItem = shoppingCartService.addCourseDirectlyByParent(parentId, childId, courseId);
            return ResponseEntity.ok(cartItem);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(null);
        }
    }

    //Phụ huynh xóa khóa học khỏi giỏ hàng
    @DeleteMapping("/{parentId}/remove/{cartItemId}")
    public ResponseEntity<Void> removeFromCart(
            @PathVariable Long parentId,
            @PathVariable Long cartItemId) {
        try {
            shoppingCartService.removeFromCart(parentId, cartItemId);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
}