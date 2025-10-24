package com.tolkien.pets;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.tolkien.pets.model.Role;
import com.tolkien.pets.model.User;
import com.tolkien.pets.repo.CreatureRepo;
import com.tolkien.pets.repo.UserRepo;
import com.tolkien.pets.security.JwtUtil;
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

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_EACH_TEST_METHOD)
class AdminIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepo userRepo;

    @Autowired
    private CreatureRepo creatureRepo;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    private String adminToken;
    private String userToken;
    private Long userId;
    private Long creatureId;

    @BeforeEach
    void setup() throws Exception {
        // Crear usuario normal
        User user = new User();
        user.setEmail("pippin@shire.me");
        user.setPassword(passwordEncoder.encode("secondBreakfast"));
        user.setRoles(Set.of(Role.ROLE_USER));
        userRepo.save(user);
        userId = user.getId();

        // Crear admin
        User admin = new User();
        admin.setEmail("admin@gondor.me");
        admin.setPassword(passwordEncoder.encode("anduril"));
        admin.setRoles(Set.of(Role.ROLE_ADMIN));
        userRepo.save(admin);

        // Tokens
        userToken = "Bearer " + jwtUtil.generateToken(user.getId(), user.getEmail(), user.getRoles());
        adminToken = "Bearer " + jwtUtil.generateToken(admin.getId(), admin.getEmail(), admin.getRoles());

        // Crear criatura asociada al usuario normal
        String json = """
            {
              "name": "Treebeard",
              "race": "Ent",
              "characterClass": "CABALLERO",
              "imageUrl": "http://example.com/ent.jpg"
            }
            """;

        String response = mockMvc.perform(post("/api/creatures")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json)
                        .header("Authorization", userToken))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString();

        creatureId = objectMapper.readTree(response).get("id").asLong();
    }

    @Test
    @DisplayName("✅ Admin can list all users")
    void testAdminListAllUsers() throws Exception {
        mockMvc.perform(get("/api/admin/users")
                        .header("Authorization", adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].email").exists());
    }

    @Test
    @DisplayName("✅ Admin can view creatures of a user")
    void testAdminViewUserCreatures() throws Exception {
        mockMvc.perform(get("/api/admin/users/" + userId + "/creatures")
                        .header("Authorization", adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].name").value("Treebeard"));
    }

    @Test
    @DisplayName("✅ Admin can delete a creature directly")
    void testAdminDeleteCreature() throws Exception {
        mockMvc.perform(delete("/api/admin/creatures/" + creatureId)
                        .header("Authorization", adminToken))
                .andExpect(status().isNoContent());

        assertThat(creatureRepo.findById(creatureId)).isEmpty();
    }

    @Test
    @DisplayName("✅ Admin can delete a user and their creatures")
    void testAdminDeleteUserAndCreatures() throws Exception {
        mockMvc.perform(delete("/api/admin/users/" + userId)
                        .header("Authorization", adminToken))
                .andExpect(status().isNoContent());

        assertThat(userRepo.findById(userId)).isEmpty();
        assertThat(creatureRepo.findAll()).isEmpty();
    }

    @Test
    @DisplayName("❌ Non-admin user cannot access admin routes")
    void testForbiddenForNormalUser() throws Exception {
        mockMvc.perform(get("/api/admin/users")
                        .header("Authorization", userToken))
                .andExpect(status().isForbidden());
    }
}
