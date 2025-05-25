package com.d10rt01.hocho.repository;

import com.d10rt01.hocho.entity.ParentChildMapping;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ParentChildMappingRepository extends JpaRepository<ParentChildMapping, Long> {
    List<ParentChildMapping> findByChildUserId(Long childId);
    boolean existsByParentUserIdAndChildUserId(Long parentId, Long childId);
} 