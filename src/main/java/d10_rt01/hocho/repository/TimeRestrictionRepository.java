package d10_rt01.hocho.repository;

import d10_rt01.hocho.model.TimeRestriction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TimeRestrictionRepository extends JpaRepository<TimeRestriction, Long> {

    @Query("SELECT ts FROM TimeRestriction ts WHERE ts.parent.id = ?1")
    List<TimeRestriction> findRestrictionsByParentId(Long parentId);

    Optional<TimeRestriction> findByParent_IdAndChild_Id(Long parentId, Long childId);
    Optional<TimeRestriction> findByChild_Id(Long childId);
}
