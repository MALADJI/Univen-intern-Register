package com.internregister.repository;

import com.internregister.entity.Admin;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AdminRepository extends JpaRepository<Admin, Long> {
    java.util.Optional<Admin> findByEmail(String email);
}
