package com.internregister.repository;

import com.internregister.entity.Intern;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.repository.query.Param;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.List;
import java.util.Optional;

public interface InternRepository extends JpaRepository<Intern, Long> {
    Page<Intern> findByNameContainingIgnoreCase(String name, Pageable pageable);
    Optional<Intern> findByEmail(String email);
    
    // ✅ Find by email with department and location loaded (using LEFT JOIN FETCH)
    @Query("SELECT DISTINCT i FROM Intern i LEFT JOIN FETCH i.department LEFT JOIN FETCH i.location WHERE i.email = :email")
    Optional<Intern> findByEmailWithDepartment(@Param("email") String email);
    
    // ✅ Eagerly load department and location when fetching all interns
    @EntityGraph(attributePaths = {"department", "location"})
    @Override
    List<Intern> findAll();
}
