package com.internregister.repository;

import com.internregister.entity.Supervisor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SupervisorRepository extends JpaRepository<Supervisor, Long> {
    java.util.Optional<Supervisor> findByEmail(String email);
}
