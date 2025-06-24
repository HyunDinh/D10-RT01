package d10_rt01.hocho.repository;

import d10_rt01.hocho.model.ParentChildMapping;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;


@Repository
public interface ParentChildMappingRepository extends JpaRepository<ParentChildMapping, Long> {
    //Hiển thị phụ huynh của trẻ em .
    ParentChildMapping findByChildId(Long childId);

    //Kiểm tra phụ huynh và trẻ em có khớp với nhau không
    boolean existsByParentIdAndChildId(Long parentId, Long childId);

    // Lấy danh sách các con của phụ huynh
    List<ParentChildMapping> findByParentId(Long parentId);
    void deleteByChildId(Long childId);
}