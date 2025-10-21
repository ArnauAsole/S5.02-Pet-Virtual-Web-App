package com.tolkien.pets.service;

import com.tolkien.pets.model.User;
import org.springframework.security.core.userdetails.UserDetails;
import java.util.List;
import java.util.Optional;

public interface UserService {

    Optional<User> findByEmail(String email);

    User save(User user);

    List<User> findAll();

    void deleteById(Long id);

    Optional<User> findById(Long id);

    // 🔥 Añadido para integrarse con JwtFilter
    UserDetails loadUserByUsername(String username);
}
