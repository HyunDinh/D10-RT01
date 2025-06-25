package d10_rt01.hocho.repository;

import d10_rt01.hocho.model.ParentChildMapping;
import d10_rt01.hocho.model.User;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;


@Repository
public interface ParentChildMappingRepository extends JpaRepository<ParentChildMapping, Long> {
    //Hiển thị phụ huynh của trẻ em .
    ParentChildMapping findByChildId(Long childId);

    //Kiểm tra phụ huynh và trẻ em có khớp với nhau không
    boolean existsByParentIdAndChildId(Long parentId, Long childId);

    // Lấy danh sách các con của phụ huynh
    List<ParentChildMapping> findByParentId(Long parentId);
    void deleteByChildId(Long childId);

    @Query("SELECT COUNT(pcm) FROM ParentChildMapping pcm WHERE pcm.parent = :parent")
    int getNumberOfChild(@Param("parent") User parent);

    // Lấy danh sách con cái theo email phụ huynh
    @Query("SELECT pcm FROM ParentChildMapping pcm WHERE pcm.parent.email = :parentEmail")
    List<ParentChildMapping> findByParentEmail(@Param("parentEmail") String parentEmail);
}