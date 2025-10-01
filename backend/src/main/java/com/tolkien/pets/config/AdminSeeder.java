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
    CommandLineRunner seedAdmin(UserRepo repo, PasswordEncoder enc) {
        return args -> {
            if (repo.findByEmail("admin@tolkien.local").isEmpty()) {
                var admin = new User(null, "admin@tolkien.local", enc.encode("admin123"), Set.of(Role.ROLE_ADMIN));
                repo.save(admin);
            }
        };
    }
}
