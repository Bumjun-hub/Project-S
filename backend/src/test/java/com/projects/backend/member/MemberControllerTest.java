package com.projects.backend.member;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
class MemberControllerTest {

	private static final String SIGN_UP_URL = "/api/v1/members";
	private static final String SIGN_UP_SUCCESS_MESSAGE = "\uD68C\uC6D0\uAC00\uC785\uC774 \uC644\uB8CC\uB418\uC5C8\uC2B5\uB2C8\uB2E4.";
	private static final String DUPLICATE_EMAIL_MESSAGE = "\uC774\uBBF8 \uC0AC\uC6A9 \uC911\uC778 \uC774\uBA54\uC77C\uC785\uB2C8\uB2E4.";

	@Autowired
	private MockMvc mockMvc;

	@Autowired
	private JdbcTemplate jdbcTemplate;

	@Autowired
	private PasswordEncoder passwordEncoder;

	@BeforeEach
	void setUp() {
		jdbcTemplate.update("delete from members");
	}

	@Test
	void signUpReturnsMemberResponse() throws Exception {
		mockMvc.perform(post(SIGN_UP_URL)
				.contentType(MediaType.APPLICATION_JSON)
				.content("""
					{
					  "email": "user1@example.com",
					  "password": "password123",
					  "nickname": "테스터"
					}
					"""))
			.andExpect(status().isOk())
			.andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
			.andExpect(jsonPath("$.success").value(true))
			.andExpect(jsonPath("$.message").value(SIGN_UP_SUCCESS_MESSAGE))
			.andExpect(jsonPath("$.data.memberId").exists())
			.andExpect(jsonPath("$.data.email").value("user1@example.com"))
			.andExpect(jsonPath("$.data.nickname").value("테스터"));
	}

	@Test
	void signUpFailsWhenEmailAlreadyExists() throws Exception {
		jdbcTemplate.update("""
			insert into members (email, password, nickname, role, created_at, updated_at)
			values (?, ?, ?, ?, current_timestamp, current_timestamp)
			""", "duplicate@example.com", "encoded-password", "기존회원", "USER");

		mockMvc.perform(post(SIGN_UP_URL)
				.contentType(MediaType.APPLICATION_JSON)
				.content("""
					{
					  "email": "duplicate@example.com",
					  "password": "password123",
					  "nickname": "새회원"
					}
					"""))
			.andExpect(status().isConflict())
			.andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
			.andExpect(jsonPath("$.success").value(false))
			.andExpect(jsonPath("$.code").value("DUPLICATE_EMAIL"))
			.andExpect(jsonPath("$.message").value(DUPLICATE_EMAIL_MESSAGE));
	}

	@Test
	void signUpStoresEncodedPassword() throws Exception {
		mockMvc.perform(post(SIGN_UP_URL)
				.contentType(MediaType.APPLICATION_JSON)
				.content("""
					{
					  "email": "secure@example.com",
					  "password": "password123",
					  "nickname": "보안회원"
					}
					"""))
			.andExpect(status().isOk());

		String savedPassword = jdbcTemplate.queryForObject(
			"select password from members where email = ?",
			String.class,
			"secure@example.com"
		);

		assertThat(savedPassword).isNotEqualTo("password123");
		assertThat(passwordEncoder.matches("password123", savedPassword)).isTrue();
	}

	@Test
	void signUpFailsWithInvalidRequest() throws Exception {
		mockMvc.perform(post(SIGN_UP_URL)
				.contentType(MediaType.APPLICATION_JSON)
				.content("""
					{
					  "email": "invalid-email",
					  "password": "short",
					  "nickname": "a"
					}
					"""))
			.andExpect(status().isBadRequest())
			.andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
			.andExpect(jsonPath("$.success").value(false))
			.andExpect(jsonPath("$.code").value("INVALID_INPUT"));
	}
}
