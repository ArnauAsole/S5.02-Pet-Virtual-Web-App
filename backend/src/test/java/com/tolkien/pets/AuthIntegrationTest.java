package com.tolkien.pets;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.tolkien.pets.model.Role;
import com.tolkien.pets.model.User;
import com.tolkien.pets.repo.UserRepo;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.util.Set;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_EACH_TEST_METHOD)
class AuthIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepo userRepo;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private final String LOGIN_URL = "/api/auth/login";

    @BeforeEach
    void setup() {
        // Creamos un usuario de prueba directamente en la BD
        User user = new User();
        user.setEmail("frodo@shire.me");
        user.setPassword(passwordEncoder.encode("ringbearer"));
        user.setRoles(Set.of(Role.ROLE_USER));
        userRepo.save(user);
    }

    @Test
    @DisplayName("✅ Login successful returns JWT token")
    void testLoginSuccess() throws Exception {
        String json = """
                {
                  "email": "frodo@shire.me",
                  "password": "ringbearer"
                }
                """;

        mockMvc.perform(post(LOGIN_URL)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").exists())
                .andExpect(jsonPath("$.email").value("frodo@shire.me"));
    }

    @Test
    @DisplayName("❌ Login with invalid credentials returns 401")
    void testLoginInvalidCredentials() throws Exception {
        String json = """
                {
                  "email": "frodo@shire.me",
                  "password": "wrongpassword"
                }
                """;

        mockMvc.perform(post(LOGIN_URL)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isForbidden());

    }

    @Test
    @DisplayName("❌ Login with non-existent user returns 401")
    void testLoginNonExistentUser() throws Exception {
        String json = """
                {
                  "email": "gandalf@valinor.me",
                  "password": "youShallNotPass"
                }
                """;

        mockMvc.perform(post(LOGIN_URL)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isForbidden());

    }
}
