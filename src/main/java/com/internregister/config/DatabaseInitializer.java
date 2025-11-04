package com.internregister.config;

import com.internregister.entity.User;
import com.internregister.repository.UserRepository;
import com.internregister.service.UserService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
public class DatabaseInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final UserService userService;

    public DatabaseInitializer(UserRepository userRepository, UserService userService) {
        this.userRepository = userRepository;
        this.userService = userService;
    }

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        System.out.println("\n=== Starting Database Initialization ===");
        System.out.println("Checking for existing users in database...");
        
        long userCount = userRepository.count();
        System.out.println("Current user count: " + userCount);
        
        // Initialize default users if they don't exist
        if (userCount == 0) {
            System.out.println("No users found. Creating default users...\n");
            // Admin user
            User admin = new User();
            admin.setUsername("admin@univen.ac.za");
            admin.setPassword("admin123");
            admin.setRole(User.Role.ADMIN);
            User savedAdmin = userService.saveUser(admin);
            System.out.println("✓ Created admin user: admin@univen.ac.za / admin123 (ID: " + savedAdmin.getId() + ")");

            // Supervisor user
            User supervisor = new User();
            supervisor.setUsername("supervisor@univen.ac.za");
            supervisor.setPassword("supervisor123");
            supervisor.setRole(User.Role.SUPERVISOR);
            User savedSupervisor = userService.saveUser(supervisor);
            System.out.println("✓ Created supervisor user: supervisor@univen.ac.za / supervisor123 (ID: " + savedSupervisor.getId() + ")");

            // Intern user
            User intern = new User();
            intern.setUsername("intern@univen.ac.za");
            intern.setPassword("intern123");
            intern.setRole(User.Role.INTERN);
            User savedIntern = userService.saveUser(intern);
            System.out.println("✓ Created intern user: intern@univen.ac.za / intern123 (ID: " + savedIntern.getId() + ")");

            // Verify users were saved
            long finalCount = userRepository.count();
            System.out.println("\n=== Default Users Created Successfully ===");
            System.out.println("Total users in database: " + finalCount);
            System.out.println("Admin:     admin@univen.ac.za / admin123");
            System.out.println("Supervisor: supervisor@univen.ac.za / supervisor123");
            System.out.println("Intern:    intern@univen.ac.za / intern123");
            System.out.println("===========================================\n");
            
            if (finalCount == 3) {
                System.out.println("✓ SUCCESS: All users saved to MySQL database!");
            } else {
                System.out.println("⚠ WARNING: Expected 3 users but found " + finalCount);
            }
        } else {
            System.out.println("Users already exist in database (" + userCount + " users found). Skipping initialization.");
            System.out.println("=== Database Initialization Complete ===\n");
        }
    }
}

