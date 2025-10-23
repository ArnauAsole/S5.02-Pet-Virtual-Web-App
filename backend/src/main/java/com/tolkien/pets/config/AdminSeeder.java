package com.tolkien.pets.config;

import com.tolkien.pets.model.Role;
import com.tolkien.pets.model.User;
import com.tolkien.pets.repo.UserRepo;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Set;

@Configuration
public class AdminSeeder {

    @Bean
    public CommandLineRunner seedAdmin(UserRepo userRepo, PasswordEncoder pe) {
        return args -> userRepo.findByEmail("admin@shire.me").orElseGet(() -> {
            User u = new User();
            u.setEmail("admin@shire.me");
            u.setPassword(pe.encode("Admin123"));
            u.setRoles(Set.of(Role.ROLE_ADMIN, Role.ROLE_USER));
            System.out.println("✓ Admin user created: admin@shire.me / password: Admin123");
            return userRepo.save(u);
        });
    }
}
