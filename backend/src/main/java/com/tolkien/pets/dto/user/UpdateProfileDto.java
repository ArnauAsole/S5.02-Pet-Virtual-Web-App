package com.tolkien.pets.dto.user;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;
import lombok.Data;
import org.hibernate.validator.constraints.URL;

@Data
public class UpdateProfileDto {
    @Email @Size(max = 120)
    private String email;            // opcional: si cambias email, se valida y se comprueba que no exista

    @URL @Size(max = 512)
    private String profileImage;     // opcional
}
