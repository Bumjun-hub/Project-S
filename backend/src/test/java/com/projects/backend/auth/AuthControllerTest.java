package com.projects.backend.auth;

import static org.hamcrest.Matchers.not;
import static org.hamcrest.Matchers.blankOrNullString;
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
class AuthControllerTest {

	private static final String LOGIN_URL = "/api/v1/auth/login";
	private static final String LOGIN_SUCCESS_MESSAGE = "\uB85C\uADF8\uC778\uC774 \uC644\uB8CC\uB418\uC5C8\uC2B5\uB2C8\uB2E4.";
	private static final String INVALID_LOGIN_MESSAGE =
		"\uC774\uBA54\uC77C \uB610\uB294 \uBE44\uBC00\uBC88\uD638\uAC00 \uC62C\uBC14\uB974\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4.";

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
	void loginReturnsAccessToken() throws Exception {
		saveMember("login@example.com", "password123", "login-user");

		mockMvc.perform(post(LOGIN_URL)
				.contentType(MediaType.APPLICATION_JSON)
				.content("""
					{
					  "email": "login@example.com",
					  "password": "password123"
					}
					"""))
			.andExpect(status().isOk())
			.andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
			.andExpect(jsonPath("$.success").value(true))
			.andExpect(jsonPath("$.message").value(LOGIN_SUCCESS_MESSAGE))
			.andExpect(jsonPath("$.data.accessToken", not(blankOrNullString())))
			.andExpect(jsonPath("$.data.tokenType").value("Bearer"))
			.andExpect(jsonPath("$.data.memberId").exists())
			.andExpect(jsonPath("$.data.email").value("login@example.com"))
			.andExpect(jsonPath("$.data.nickname").value("login-user"));
	}

	@Test
	void loginFailsWhenPasswordDoesNotMatch() throws Exception {
		saveMember("login-fail@example.com", "password123", "login-user");

		mockMvc.perform(post(LOGIN_URL)
				.contentType(MediaType.APPLICATION_JSON)
				.content("""
					{
					  "email": "login-fail@example.com",
					  "password": "wrong-password"
					}
					"""))
			.andExpect(status().isUnauthorized())
			.andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
			.andExpect(jsonPath("$.success").value(false))
			.andExpect(jsonPath("$.code").value("INVALID_LOGIN"))
			.andExpect(jsonPath("$.message").value(INVALID_LOGIN_MESSAGE));
	}

	@Test
	void loginFailsWithInvalidRequest() throws Exception {
		mockMvc.perform(post(LOGIN_URL)
				.contentType(MediaType.APPLICATION_JSON)
				.content("""
					{
					  "email": "invalid-email",
					  "password": ""
					}
					"""))
			.andExpect(status().isBadRequest())
			.andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
			.andExpect(jsonPath("$.success").value(false))
			.andExpect(jsonPath("$.code").value("INVALID_INPUT"));
	}

	private void saveMember(String email, String rawPassword, String nickname) {
		jdbcTemplate.update("""
			insert into members (email, password, nickname, role, created_at, updated_at)
			values (?, ?, ?, ?, current_timestamp, current_timestamp)
			""", email, passwordEncoder.encode(rawPassword), nickname, "USER");
	}
}
