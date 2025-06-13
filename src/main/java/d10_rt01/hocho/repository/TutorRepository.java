package d10_rt01.hocho.repository;

import d10_rt01.hocho.model.Tutor;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TutorRepository extends JpaRepository<Tutor, Long> {
    //Tim kiem gia su dua tren user Id
    Tutor findByUser_Id(Long userId);
}