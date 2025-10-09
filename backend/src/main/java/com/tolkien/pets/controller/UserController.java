package com.tolkien.pets.controller;

import com.tolkien.pets.dto.user.ChangePasswordDto;
import com.tolkien.pets.dto.user.UpdateProfileDto;
import com.tolkien.pets.dto.user.UserDto;
import com.tolkien.pets.security.CustomPrincipal;
import com.tolkien.pets.service.UserService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Users (self-service)")
@RestController
@RequestMapping("/api/users")
@SecurityRequirement(name = "bearer-key")
public class UserController {

    private final UserService userService;
    public UserController(UserService userService) { this.userService = userService; }

    private Long userId(Authentication a) { return ((CustomPrincipal) a.getPrincipal()).id(); }

    @GetMapping("/me")
    public UserDto me(Authentication a) {
        return userService.getById(userId(a));
    }

    @PutMapping("/me")
    public UserDto updateMe(@Valid @RequestBody UpdateProfileDto dto, Authentication a) {
        return userService.updateProfile(userId(a), dto);
    }

    @PutMapping("/me/password")
    public ResponseEntity<Void> changePassword(@Valid @RequestBody ChangePasswordDto dto, Authentication a) {
        userService.changePassword(userId(a), dto);
        return ResponseEntity.noContent().build();
    }

    // (Opcional) Borrar cuenta propia:
    // @DeleteMapping("/me")
    // public ResponseEntity<Void> deleteMe(Authentication a) {
    //     userService.delete(userId(a));
    //     return ResponseEntity.noContent().build();
    // }
}
