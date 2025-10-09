package com.tolkien.pets.service.impl;

import com.tolkien.pets.dto.user.ChangePasswordDto;
import com.tolkien.pets.dto.user.UpdateProfileDto;
import com.tolkien.pets.dto.user.UserDto;
import com.tolkien.pets.exception.EmailAlreadyUsedException;
import com.tolkien.pets.exception.ForbiddenOperationException;
import com.tolkien.pets.exception.ResourceNotFoundException;
import com.tolkien.pets.model.Role;
import com.tolkien.pets.model.User;
import com.tolkien.pets.repo.UserRepo;
import com.tolkien.pets.service.UserService;
import jakarta.transaction.Transactional;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Set;

@Service
public class UserServiceImpl implements UserService {

    private final UserRepo userRepo;
    private final PasswordEncoder passwordEncoder;

    public UserServiceImpl(UserRepo userRepo, PasswordEncoder passwordEncoder) {
        this.userRepo = userRepo;
        this.passwordEncoder = passwordEncoder;
    }

    private User getOr404(Long id) {
        return userRepo.findById(id).orElseThrow(() -> new ResourceNotFoundException("User " + id + " not found"));
    }

    private UserDto toDto(User u) {
        UserDto dto = new UserDto();
        dto.setId(u.getId());
        dto.setEmail(u.getEmail());
        dto.setProfileImage(u.getProfileImage());
        dto.setRoles(u.getRoles());
        return dto;
    }

    // existentes
    @Override public List<UserDto> listAll() { return userRepo.findAll().stream().map(this::toDto).toList(); }

    @Override @Transactional
    public UserDto grantAdmin(Long userId) {
        User u = getOr404(userId);
        Set<Role> roles = u.getRoles();
        roles.add(Role.ROLE_ADMIN);
        roles.add(Role.ROLE_USER);
        u.setRoles(roles);
        return toDto(userRepo.save(u));
    }

    @Override @Transactional
    public UserDto revokeAdmin(Long userId) {
        User u = getOr404(userId);
        Set<Role> roles = u.getRoles();
        roles.remove(Role.ROLE_ADMIN);
        if (!roles.contains(Role.ROLE_USER)) roles.add(Role.ROLE_USER);
        u.setRoles(roles);
        return toDto(userRepo.save(u));
    }

    @Override @Transactional
    public void delete(Long userId) {
        User u = getOr404(userId);
        userRepo.delete(u);
    }

    // nuevos
    @Override
    public UserDto getById(Long userId) {
        return toDto(getOr404(userId));
    }

    @Override @Transactional
    public UserDto updateProfile(Long userId, UpdateProfileDto dto) {
        User u = getOr404(userId);
        if (dto.getEmail() != null && !dto.getEmail().equalsIgnoreCase(u.getEmail())) {
            if (userRepo.existsByEmail(dto.getEmail())) throw new EmailAlreadyUsedException("Email already in use");
            u.setEmail(dto.getEmail());
        }
        if (dto.getProfileImage() != null) u.setProfileImage(dto.getProfileImage());
        return toDto(userRepo.save(u));
    }

    @Override @Transactional
    public void changePassword(Long userId, ChangePasswordDto dto) {
        User u = getOr404(userId);
        if (!passwordEncoder.matches(dto.getCurrentPassword(), u.getPassword())) {
            throw new ForbiddenOperationException("Invalid current password");
        }
        u.setPassword(passwordEncoder.encode(dto.getNewPassword()));
        userRepo.save(u);
    }
}
