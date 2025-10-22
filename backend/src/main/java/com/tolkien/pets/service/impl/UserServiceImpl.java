package com.tolkien.pets.service.impl;

import com.tolkien.pets.model.User;
import com.tolkien.pets.repo.UserRepo;
import com.tolkien.pets.security.CustomPrincipal;
import com.tolkien.pets.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepo userRepo;


    @Override
    public void deleteUser(Long id) {
        // Primero, encuentra el usuario por ID
        User user = userRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        // Elimina el usuario
        userRepo.delete(user);
    }

    @Override
    public List<User> getAllUsers() {
        return userRepo.findAll();
    }

    @Override
    public Optional<User> findByEmail(String email) {
        return userRepo.findByEmail(email);
    }

    @Override
    public User save(User user) {
        return userRepo.save(user);
    }

    @Override
    public List<User> findAll() {
        return userRepo.findAll();
    }

    @Override
    public void deleteById(Long id) {
        userRepo.deleteById(id);
    }

    @Override
    public User getUserById(Long id) {
        return userRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
    }


    @Override
    public Optional<User> findById(Long id) {
        return userRepo.findById(id);
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userRepo.findByEmail(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + username));

        // Devolver CustomPrincipal en lugar de User de Spring Security
        return new CustomPrincipal(
                user.getId(),
                user.getEmail(),
                user.getPassword(),
                user.getRoles()
        );
    }
}