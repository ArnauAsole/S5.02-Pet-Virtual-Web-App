package com.tolkien.pets;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.tolkien.pets.model.CharacterClass;
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
class CreatureIntegrationTest {

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

    private String jwtToken;
    private Long userId;

    @BeforeEach
    void setup() {
        // Creamos un usuario de prueba
        User user = new User();
        user.setEmail("sam@shire.me");
        user.setPassword(passwordEncoder.encode("secondBreakfast"));
        user.setRoles(Set.of(Role.ROLE_USER));
        userRepo.save(user);
        userId = user.getId();

        // Generamos token JWT válido
        jwtToken = "Bearer " + jwtUtil.generateToken(user.getId(), user.getEmail(), user.getRoles());
    }

    @Test
    @DisplayName("✅ Create creature successfully")
    void testCreateCreature() throws Exception {
        String json = """
            {
              "name": "Shadowfax",
              "race": "Horse",
              "characterClass": "CABALLERO",
              "imageUrl": "http://example.com/horse.jpg"
            }
            """;

        mockMvc.perform(post("/api/creatures")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json)
                        .header("Authorization", jwtToken))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name").value("Shadowfax"))
                .andExpect(jsonPath("$.race").value("Horse"))
                .andExpect(jsonPath("$.level").value(1))
                .andExpect(jsonPath("$.health").value(100));

        assertThat(creatureRepo.findAll()).hasSize(1);
    }

    @Test
    @DisplayName("✅ Train and rest creature updates stats correctly")
    void testTrainAndRestCreature() throws Exception {
        // Primero creamos una criatura
        String json = """
            {
              "name": "Bill",
              "race": "Pony",
              "characterClass": "CABALLERO",
              "imageUrl": "http://example.com/bill.jpg"
            }
            """;

        String createResponse = mockMvc.perform(post("/api/creatures")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json)
                        .header("Authorization", jwtToken))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString();

        Long creatureId = objectMapper.readTree(createResponse).get("id").asLong();

        // Entrenamos la criatura
        mockMvc.perform(post("/api/creatures/" + creatureId + "/train")
                        .header("Authorization", jwtToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.experience").value(10));

        // Descansamos la criatura
        mockMvc.perform(post("/api/creatures/" + creatureId + "/rest")
                        .header("Authorization", jwtToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.health").value(110)); // vuelve al máximo
    }

    @Test
    @DisplayName("✅ Get and delete creature successfully")
    void testGetAndDeleteCreature() throws Exception {
        // Crear criatura
        String json = """
            {
              "name": "Gwaihir",
              "race": "Eagle",
              "characterClass": "CABALLERO",
              "imageUrl": "http://example.com/eagle.jpg"
            }
            """;

        String response = mockMvc.perform(post("/api/creatures")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json)
                        .header("Authorization", jwtToken))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString();

        Long creatureId = objectMapper.readTree(response).get("id").asLong();

        // Consultar criatura
        mockMvc.perform(get("/api/creatures/" + creatureId)
                        .header("Authorization", jwtToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Gwaihir"))
                .andExpect(jsonPath("$.level").value(1));

        // Eliminar criatura
        mockMvc.perform(delete("/api/creatures/" + creatureId)
                        .header("Authorization", jwtToken))
                .andExpect(status().isNoContent());

        assertThat(creatureRepo.findById(creatureId)).isEmpty();
    }

    @Test
    @DisplayName("❌ Unauthorized when missing JWT token")
    void testUnauthorizedWithoutToken() throws Exception {
        mockMvc.perform(get("/api/creatures"))
                .andExpect(status().isForbidden()); // el filtro de seguridad bloquea el acceso
    }
}
