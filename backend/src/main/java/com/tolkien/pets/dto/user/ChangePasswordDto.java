package com.tolkien.pets.dto.user;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ChangePasswordDto {
    @NotBlank
    private String currentPassword;

    @NotBlank @Size(min = 6, max = 100)
    private String newPassword;
}
