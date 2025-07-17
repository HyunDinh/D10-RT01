package d10_rt01.hocho.service.monitoring;

import d10_rt01.hocho.model.TimeRestriction;
import d10_rt01.hocho.model.User;
import d10_rt01.hocho.repository.TimeRestrictionRepository;
import d10_rt01.hocho.repository.UserRepository;
import d10_rt01.hocho.repository.ParentChildMappingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class TimeRestrictionService {

    private final TimeRestrictionRepository timeRestrictionRepository;
    private final UserRepository userRepository;
    private final ParentChildMappingRepository parentChildMappingRepository;

    @Autowired
    public TimeRestrictionService(TimeRestrictionRepository timeRestrictionRepository, UserRepository userRepository, ParentChildMappingRepository parentChildMappingRepository) {
        this.timeRestrictionRepository = timeRestrictionRepository;
        this.userRepository = userRepository;
        this.parentChildMappingRepository = parentChildMappingRepository;
    }

    // Set or Update Time Restrictions
    public TimeRestriction addTimeRestriction(Long childId, Integer maxPlayTime, Integer maxVideoTime) {
        User child = userRepository.findById(childId).orElseThrow(() -> new RuntimeException("Child not found"));
        // Find parent from mapping
        var mapping = parentChildMappingRepository.findByChildId(childId);
        if (mapping == null) throw new RuntimeException("Parent mapping not found for child");
        User parent = mapping.getParent();

        // Check if restriction exists for this child
        TimeRestriction restriction = timeRestrictionRepository.findByChild_Id(childId).orElse(new TimeRestriction());
        restriction.setChild(child);
        restriction.setParent(parent);
        restriction.setMaxPlayTime(maxPlayTime);
        restriction.setMaxVideoTime(maxVideoTime);

        return timeRestrictionRepository.save(restriction);
    }

    public void resetTimeRestriction(Long childId) {
        Optional<TimeRestriction> restrictionOptional = timeRestrictionRepository.findByChild_Id(childId);
        if (restrictionOptional.isPresent()) {
            TimeRestriction restriction = restrictionOptional.get();
            restriction.setMaxPlayTime(null);
            restriction.setMaxVideoTime(null);
            timeRestrictionRepository.save(restriction);
        }
    }

    public List<TimeRestriction> getTimeRestriction(Long parentId) {
        return timeRestrictionRepository.findRestrictionsByParentId(parentId);
    }

    public Optional<TimeRestriction> getTimeRestrictionByChildId(Long childId) {
        return timeRestrictionRepository.findByChild_Id(childId);
    }

    public Optional<TimeRestriction> subtractVideoTime(Long childId, Integer timeSpent) {
        Optional<TimeRestriction> restrictionOptional = timeRestrictionRepository.findByChild_Id(childId);
        if (restrictionOptional.isEmpty()) {
            return Optional.empty(); // No restriction set for this child
        }

        TimeRestriction restriction = restrictionOptional.get();
        int newVideoTime = restriction.getMaxVideoTime() - timeSpent;
        if (newVideoTime < 0) {
            newVideoTime = 0; // Prevent negative time
        }
        restriction.setMaxVideoTime(newVideoTime);

        return Optional.of(timeRestrictionRepository.save(restriction));
    }

    public void setRewardPerQuiz(Long childId, Integer rewardPerQuiz) {
        Optional<TimeRestriction> restrictionOpt = timeRestrictionRepository.findByChild_Id(childId);
        if (restrictionOpt.isPresent()) {
            TimeRestriction restriction = restrictionOpt.get();
            restriction.setRewardPerQuiz(rewardPerQuiz);
            timeRestrictionRepository.save(restriction);
        }
    }

    public void addVideoTimeReward(Long childId, int rewardMinutes) {
        Optional<TimeRestriction> restrictionOpt = timeRestrictionRepository.findByChild_Id(childId);
        if (restrictionOpt.isPresent()) {
            TimeRestriction restriction = restrictionOpt.get();
            Integer current = restriction.getMaxVideoTime() != null ? restriction.getMaxVideoTime() : 0;
            restriction.setMaxVideoTime(current + rewardMinutes);
            timeRestrictionRepository.save(restriction);
        }
    }
}

