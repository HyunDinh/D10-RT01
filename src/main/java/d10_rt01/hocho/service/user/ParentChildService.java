package d10_rt01.hocho.service.user;

import d10_rt01.hocho.model.ParentChildMapping;
import d10_rt01.hocho.model.User;
import d10_rt01.hocho.repository.ParentChildMappingRepository;
import d10_rt01.hocho.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ParentChildService {
    @Autowired
    private ParentChildMappingRepository parentChildRepository;

    @Autowired
    private UserRepository userRepository;

    public List<User> getMappedChildren(Long parentId) {
        return parentChildRepository.findByParentId(parentId)
                .stream()
                .map(ParentChildMapping::getChild)
                .toList();
    }

    public Long getParentIdByUsername(String username) {
        // Find the user by username
        User parent = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found with username: " + username));

        // Verify the user is a parent
        if (!parent.getRole().equals("parent")) {
            throw new RuntimeException("User is not a parent");
        }

        return parent.getId();
    }

    public Long getChildIdByUsername(String username) {
        // Find the user by username
        User child = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found with username: " + username));

        // Verify the user is a child
        if (!child.getRole().equals("child")) {
            throw new RuntimeException("User is not a child");
        }

        return child.getId();
    }
}
