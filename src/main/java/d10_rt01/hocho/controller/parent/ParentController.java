package d10_rt01.hocho.controller.parent;

import d10_rt01.hocho.model.ParentChildMapping;
import d10_rt01.hocho.model.User;
import d10_rt01.hocho.repository.ParentChildMappingRepository;
import d10_rt01.hocho.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/parent")
@CrossOrigin(origins = "*")
public class ParentController {

    @Autowired
    private ParentChildMappingRepository parentChildMappingRepository;
    
    @Autowired
    private UserRepository userRepository;

    @GetMapping("/children/{parentId}")
    public ResponseEntity<List<User>> getChildren(@PathVariable Long parentId) {
        List<ParentChildMapping> mappings = parentChildMappingRepository.findByParentId(parentId);
        List<User> children = mappings.stream()
            .map(ParentChildMapping::getChild)
            .collect(Collectors.toList());
        return ResponseEntity.ok(children);
    }

    @GetMapping("/children/{childId}/info")
    public ResponseEntity<User> getChild(@PathVariable Long childId) {
        User child = userRepository.findById(childId)
            .orElse(null);
        if (child == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(child);
    }
} 