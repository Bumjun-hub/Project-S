package com.projects.backend.bodyprofile;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.containsInAnyOrder;
import static org.hamcrest.Matchers.hasItem;
import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.not;
import static org.hamcrest.Matchers.blankOrNullString;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.test.web.servlet.MvcResult;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.jayway.jsonpath.JsonPath;
import com.projects.backend.bodyprofile.entity.BodyProfile;
import com.projects.backend.bodyprofile.repository.BodyProfileRepository;
import com.projects.backend.member.entity.Member;
import com.projects.backend.member.repository.MemberRepository;

@SpringBootTest
@AutoConfigureMockMvc
class BodyProfileIntegrationTest {

	private static final String SIGN_UP_URL = "/api/v1/members";
	private static final String LOGIN_URL = "/api/v1/auth/login";
	private static final String BODY_PROFILE_URL = "/api/v1/body-profiles";
	private static final String MY_BODY_PROFILE_URL = "/api/v1/body-profiles/me";
	private static final String EMAIL = "bodyprofile@example.com";
	private static final String PASSWORD = "Password123!";
	private static final String NICKNAME = "bodytester";
	private static final String CREATE_SUCCESS_MESSAGE = "\uC2E0\uCCB4 \uD504\uB85C\uD544\uC774 \uB4F1\uB85D\uB418\uC5C8\uC2B5\uB2C8\uB2E4.";
	private static final String GET_SUCCESS_MESSAGE = "\uC2E0\uCCB4 \uD504\uB85C\uD544\uC744 \uC870\uD68C\uD588\uC2B5\uB2C8\uB2E4.";
	private static final String UPDATE_SUCCESS_MESSAGE = "\uC2E0\uCCB4 \uD504\uB85C\uD544\uC774 \uC218\uC815\uB418\uC5C8\uC2B5\uB2C8\uB2E4.";
	private static final String ALREADY_EXISTS_MESSAGE = "\uC774\uBBF8 \uC2E0\uCCB4 \uD504\uB85C\uD544\uC774 \uB4F1\uB85D\uB418\uC5B4 \uC788\uC2B5\uB2C8\uB2E4.";
	private static final String NOT_FOUND_MESSAGE = "\uC2E0\uCCB4 \uD504\uB85C\uD544\uC744 \uCC3E\uC744 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4.";
	private static final String UPDATE_EMPTY_MESSAGE = "\uC218\uC815\uD560 \uC2E0\uCCB4 \uD504\uB85C\uD544 \uC815\uBCF4\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4.";
	private static final String INVALID_INPUT_MESSAGE = "\uC785\uB825\uAC12\uC774 \uC62C\uBC14\uB974\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4.";
	private static final String UNAUTHORIZED_MESSAGE = "\uC778\uC99D\uC774 \uD544\uC694\uD569\uB2C8\uB2E4.";

	@Autowired
	private MockMvc mockMvc;

	@Autowired
	private ObjectMapper objectMapper;

	@Autowired
	private MemberRepository memberRepository;

	@Autowired
	private BodyProfileRepository bodyProfileRepository;

	@Autowired
	private JdbcTemplate jdbcTemplate;

	@BeforeEach
	void setUp() {
		jdbcTemplate.update("delete from body_profile_features");
		jdbcTemplate.update("delete from body_profiles");
		jdbcTemplate.update("delete from members");
	}

	@Test
	void create_body_profile_success() throws Exception {
		// given
		String accessToken = signupAndLogin();

		// when then
		createBodyProfile(accessToken)
			.andExpect(status().isCreated())
			.andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
			.andExpect(jsonPath("$.success").value(true))
			.andExpect(jsonPath("$.message").value(CREATE_SUCCESS_MESSAGE))
			.andExpect(jsonPath("$.data.id").exists())
			.andExpect(jsonPath("$.data.height").value(175.5))
			.andExpect(jsonPath("$.data.weight").value(68.0))
			.andExpect(jsonPath("$.data.gender").value("MALE"))
			.andExpect(jsonPath("$.data.bodyFeatures", hasItem("BROAD_SHOULDERS")))
			.andExpect(jsonPath("$.data.bodyFeatures", hasItem("LONG_ARMS")))
			.andExpect(jsonPath("$.data.createdAt").exists())
			.andExpect(jsonPath("$.data.updatedAt").exists());

		Member member = memberRepository.findByEmail(EMAIL).orElseThrow();
		BodyProfile bodyProfile = bodyProfileRepository.findByMember(member).orElseThrow();
		assertThat(bodyProfile.getHeight()).isEqualByComparingTo(new BigDecimal("175.5"));
		assertThat(bodyProfile.getWeight()).isEqualByComparingTo(new BigDecimal("68.0"));
		assertThat(bodyProfile.getGender().name()).isEqualTo("MALE");
		assertThat(findSavedFeatures(bodyProfile.getId()))
			.containsExactlyInAnyOrder("어깨가 넓은 편", "팔이 긴 편");
	}

	@Test
	void get_my_body_profile_success() throws Exception {
		// given
		String accessToken = signupAndLogin();
		createBodyProfile(accessToken).andExpect(status().isCreated());

		// when then
		mockMvc.perform(get(MY_BODY_PROFILE_URL)
				.header(HttpHeaders.AUTHORIZATION, "Bearer " + accessToken))
			.andExpect(status().isOk())
			.andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
			.andExpect(jsonPath("$.success").value(true))
			.andExpect(jsonPath("$.message").value(GET_SUCCESS_MESSAGE))
			.andExpect(jsonPath("$.data.height").value(175.5))
			.andExpect(jsonPath("$.data.weight").value(68.0))
			.andExpect(jsonPath("$.data.gender").value("MALE"))
			.andExpect(jsonPath("$.data.bodyFeatures", containsInAnyOrder("BROAD_SHOULDERS", "LONG_ARMS")));
	}

	@Test
	void update_my_body_profile_success() throws Exception {
		// given
		String accessToken = signupAndLogin();
		createBodyProfile(accessToken).andExpect(status().isCreated());

		// when then
		mockMvc.perform(patch(MY_BODY_PROFILE_URL)
				.header(HttpHeaders.AUTHORIZATION, "Bearer " + accessToken)
				.contentType(MediaType.APPLICATION_JSON)
				.content(objectMapper.writeValueAsString(Map.of(
					"weight", 70.5,
					"bodyFeatures", List.of("LONG_LEGS")
				))))
			.andExpect(status().isOk())
			.andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
			.andExpect(jsonPath("$.success").value(true))
			.andExpect(jsonPath("$.message").value(UPDATE_SUCCESS_MESSAGE))
			.andExpect(jsonPath("$.data.height").value(175.5))
			.andExpect(jsonPath("$.data.weight").value(70.5))
			.andExpect(jsonPath("$.data.gender").value("MALE"))
			.andExpect(jsonPath("$.data.bodyFeatures", containsInAnyOrder("LONG_LEGS")))
			.andExpect(jsonPath("$.data.bodyFeatures", not(hasItem("BROAD_SHOULDERS"))))
			.andExpect(jsonPath("$.data.bodyFeatures", not(hasItem("LONG_ARMS"))));

		BodyProfile bodyProfile = findSavedBodyProfile();
		assertThat(bodyProfile.getHeight()).isEqualByComparingTo(new BigDecimal("175.5"));
		assertThat(bodyProfile.getWeight()).isEqualByComparingTo(new BigDecimal("70.5"));
		assertThat(bodyProfile.getGender().name()).isEqualTo("MALE");
		assertThat(findSavedFeatures(bodyProfile.getId())).containsExactly("다리가 긴 편");
	}

	@Test
	void update_body_features_to_empty_success() throws Exception {
		// given
		String accessToken = signupAndLogin();
		createBodyProfile(accessToken).andExpect(status().isCreated());

		// when then
		mockMvc.perform(patch(MY_BODY_PROFILE_URL)
				.header(HttpHeaders.AUTHORIZATION, "Bearer " + accessToken)
				.contentType(MediaType.APPLICATION_JSON)
				.content(objectMapper.writeValueAsString(Map.of("bodyFeatures", List.of()))))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.data.bodyFeatures", hasSize(0)));

		BodyProfile bodyProfile = findSavedBodyProfile();
		assertThat(findSavedFeatures(bodyProfile.getId())).isEmpty();
	}

	@Test
	void create_body_profile_fail_when_already_exists() throws Exception {
		// given
		String accessToken = signupAndLogin();
		createBodyProfile(accessToken).andExpect(status().isCreated());

		// when then
		createBodyProfile(accessToken)
			.andExpect(status().isConflict())
			.andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
			.andExpect(jsonPath("$.success").value(false))
			.andExpect(jsonPath("$.code").value("BODY_PROFILE_ALREADY_EXISTS"))
			.andExpect(jsonPath("$.message").value(ALREADY_EXISTS_MESSAGE));
	}

	@Test
	void get_my_body_profile_fail_when_not_found() throws Exception {
		// given
		String accessToken = signupAndLogin();

		// when then
		mockMvc.perform(get(MY_BODY_PROFILE_URL)
				.header(HttpHeaders.AUTHORIZATION, "Bearer " + accessToken))
			.andExpect(status().isNotFound())
			.andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
			.andExpect(jsonPath("$.success").value(false))
			.andExpect(jsonPath("$.code").value("BODY_PROFILE_NOT_FOUND"))
			.andExpect(jsonPath("$.message").value(NOT_FOUND_MESSAGE));
	}

	@Test
	void update_body_profile_fail_when_request_is_empty() throws Exception {
		// given
		String accessToken = signupAndLogin();
		createBodyProfile(accessToken).andExpect(status().isCreated());

		// when then
		mockMvc.perform(patch(MY_BODY_PROFILE_URL)
				.header(HttpHeaders.AUTHORIZATION, "Bearer " + accessToken)
				.contentType(MediaType.APPLICATION_JSON)
				.content("{}"))
			.andExpect(status().isBadRequest())
			.andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
			.andExpect(jsonPath("$.success").value(false))
			.andExpect(jsonPath("$.code").value("BODY_PROFILE_UPDATE_EMPTY"))
			.andExpect(jsonPath("$.message").value(UPDATE_EMPTY_MESSAGE));
	}

	@Test
	void create_body_profile_fail_when_request_is_invalid() throws Exception {
		// given
		String accessToken = signupAndLogin();

		// when then
		mockMvc.perform(post(BODY_PROFILE_URL)
				.header(HttpHeaders.AUTHORIZATION, "Bearer " + accessToken)
				.contentType(MediaType.APPLICATION_JSON)
				.content("""
					{
					  "height": 99.9,
					  "weight": 301.0,
					  "gender": null,
					  "bodyFeatures": []
					}
					"""))
			.andExpect(status().isBadRequest())
			.andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
			.andExpect(jsonPath("$.success").value(false))
			.andExpect(jsonPath("$.code").value("INVALID_INPUT"))
			.andExpect(jsonPath("$.message").value(INVALID_INPUT_MESSAGE));
	}

	@Test
	void create_body_profile_fail_without_token() throws Exception {
		// when then
		mockMvc.perform(post(BODY_PROFILE_URL)
				.contentType(MediaType.APPLICATION_JSON)
				.content(createBodyProfileRequestJson()))
			.andExpect(status().isUnauthorized())
			.andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
			.andExpect(jsonPath("$.success").value(false))
			.andExpect(jsonPath("$.code").value("UNAUTHORIZED"))
			.andExpect(jsonPath("$.message").value(UNAUTHORIZED_MESSAGE));
	}

	@Test
	void get_my_body_profile_fail_with_invalid_token() throws Exception {
		// when then
		mockMvc.perform(get(MY_BODY_PROFILE_URL)
				.header(HttpHeaders.AUTHORIZATION, "Bearer invalid-token"))
			.andExpect(status().isUnauthorized())
			.andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
			.andExpect(jsonPath("$.success").value(false))
			.andExpect(jsonPath("$.code").value("UNAUTHORIZED"))
			.andExpect(jsonPath("$.message").value(UNAUTHORIZED_MESSAGE));
	}

	private String signupAndLogin() throws Exception {
		signUp(EMAIL, PASSWORD, NICKNAME);

		return loginAndExtractAccessToken(EMAIL, PASSWORD);
	}

	private void signUp(String email, String password, String nickname) throws Exception {
		mockMvc.perform(post(SIGN_UP_URL)
				.contentType(MediaType.APPLICATION_JSON)
				.content("""
					{
					  "email": "%s",
					  "password": "%s",
					  "nickname": "%s"
					}
					""".formatted(email, password, nickname)))
			.andExpect(status().isOk());
	}

	private String loginAndExtractAccessToken(String email, String password) throws Exception {
		MvcResult loginResult = mockMvc.perform(post(LOGIN_URL)
				.contentType(MediaType.APPLICATION_JSON)
				.content("""
					{
					  "email": "%s",
					  "password": "%s"
					}
					""".formatted(email, password)))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.data.accessToken", not(blankOrNullString())))
			.andReturn();

		return JsonPath.read(loginResult.getResponse().getContentAsString(), "$.data.accessToken");
	}

	private ResultActions createBodyProfile(String accessToken) throws Exception {
		return mockMvc.perform(post(BODY_PROFILE_URL)
			.header(HttpHeaders.AUTHORIZATION, "Bearer " + accessToken)
			.contentType(MediaType.APPLICATION_JSON)
			.content(createBodyProfileRequestJson()));
	}

	private String createBodyProfileRequestJson() throws Exception {
		return objectMapper.writeValueAsString(Map.of(
			"height", 175.5,
			"weight", 68.0,
			"gender", "MALE",
			"bodyFeatures", List.of("BROAD_SHOULDERS", "LONG_ARMS")
		));
	}

	private BodyProfile findSavedBodyProfile() {
		Member member = memberRepository.findByEmail(EMAIL).orElseThrow();

		return bodyProfileRepository.findByMember(member).orElseThrow();
	}

	private List<String> findSavedFeatures(Long bodyProfileId) {
		return jdbcTemplate.queryForList(
			"select feature from body_profile_features where body_profile_id = ?",
			String.class,
			bodyProfileId
		);
	}
}
