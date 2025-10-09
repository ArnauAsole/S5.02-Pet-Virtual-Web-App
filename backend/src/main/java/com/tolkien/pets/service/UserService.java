package com.tolkien.pets.service;

import com.tolkien.pets.dto.user.UserDto;
import com.tolkien.pets.dto.user.UpdateProfileDto;
import com.tolkien.pets.dto.user.ChangePasswordDto;

import java.util.List;

public interface UserService {
    // ya existentes
    List<UserDto> listAll();
    UserDto grantAdmin(Long userId);
    UserDto revokeAdmin(Long userId);
    void delete(Long userId);

    // nuevos (autoservicio)
    UserDto getById(Long userId);
    UserDto updateProfile(Long userId, UpdateProfileDto dto);
    void changePassword(Long userId, ChangePasswordDto dto);
}
