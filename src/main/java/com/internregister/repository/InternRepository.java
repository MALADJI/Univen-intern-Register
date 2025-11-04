package com.internregister.repository;

import com.internregister.entity.Intern;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.Optional;

public interface InternRepository extends JpaRepository<Intern, Long> {
    Page<Intern> findByNameContainingIgnoreCase(String name, Pageable pageable);
    Optional<Intern> findByEmail(String email);
}
