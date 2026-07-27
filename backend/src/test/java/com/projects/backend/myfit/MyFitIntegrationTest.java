package com.projects.backend.myfit;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.blankOrNullString;
import static org.hamcrest.Matchers.containsInAnyOrder;
import static org.hamcrest.Matchers.not;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

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
import com.projects.backend.member.entity.Member;
import com.projects.backend.member.repository.MemberRepository;
import com.projects.backend.myfit.entity.MyFit;
import com.projects.backend.myfit.repository.MyFitRepository;

@SpringBootTest
@AutoConfigureMockMvc
class MyFitIntegrationTest {

	private static final String SIGN_UP_URL = "/api/v1/members";
	private static final String LOGIN_URL = "/api/v1/auth/login";
	private static final String MY_FIT_URL = "/api/v1/my-fits";
	private static final String MY_FIT_ME_URL = "/api/v1/my-fits/me";
	private static final String EMAIL = "myfit@example.com";
	private static final String PASSWORD = "Password123!";
	private static final String NICKNAME = "myfittester";
	private static final String CREATE_SUCCESS_MESSAGE = "\uAE30\uC900 \uD54F \uC815\uBCF4\uAC00 \uB4F1\uB85D\uB418\uC5C8\uC2B5\uB2C8\uB2E4.";
	private static final String GET_SUCCESS_MESSAGE = "\uAE30\uC900 \uD54F \uC815\uBCF4\uB97C \uC870\uD68C\uD588\uC2B5\uB2C8\uB2E4.";
	private static final String UPDATE_SUCCESS_MESSAGE = "\uAE30\uC900 \uD54F \uC815\uBCF4\uAC00 \uC218\uC815\uB418\uC5C8\uC2B5\uB2C8\uB2E4.";
	private static final String ALREADY_EXISTS_MESSAGE = "\uC774\uBBF8 \uAE30\uC900 \uD54F \uC815\uBCF4\uAC00 \uB4F1\uB85D\uB418\uC5B4 \uC788\uC2B5\uB2C8\uB2E4.";
	private static final String NOT_FOUND_MESSAGE = "\uAE30\uC900 \uD54F \uC815\uBCF4\uB97C \uCC3E\uC744 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4.";
	private static final String UPDATE_EMPTY_MESSAGE = "\uC218\uC815\uD560 \uAE30\uC900 \uD54F \uC815\uBCF4\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4.";
	private static final String INVALID_INPUT_MESSAGE = "\uC785\uB825\uAC12\uC774 \uC62C\uBC14\uB974\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4.";
	private static final String UNAUTHORIZED_MESSAGE = "\uC778\uC99D\uC774 \uD544\uC694\uD569\uB2C8\uB2E4.";

	@Autowired
	private MockMvc mockMvc;

	@Autowired
	private ObjectMapper objectMapper;

	@Autowired
	private MemberRepository memberRepository;

	@Autowired
	private MyFitRepository myFitRepository;

	@Autowired
	private JdbcTemplate jdbcTemplate;

	@BeforeEach
	void setUp() {
		jdbcTemplate.update("delete from my_fit_measurements");
		jdbcTemplate.update("delete from my_fit_entries");
		jdbcTemplate.update("delete from my_fits");
		jdbcTemplate.update("delete from body_profile_features");
		jdbcTemplate.update("delete from body_profiles");
		jdbcTemplate.update("delete from members");
	}

	@Test
	void create_my_fit_success() throws Exception {
		String accessToken = signupAndLogin();

		createMyFit(accessToken)
			.andExpect(status().isCreated())
			.andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
			.andExpect(jsonPath("$.success").value(true))
			.andExpect(jsonPath("$.message").value(CREATE_SUCCESS_MESSAGE))
			.andExpect(jsonPath("$.data.id").exists())
			.andExpect(jsonPath("$.data.entries[0].category").value("TOP"))
			.andExpect(jsonPath("$.data.entries[0].garmentLabel").value("oxford shirt"))
			.andExpect(jsonPath("$.data.entries[0].measurements[*].area",
				containsInAnyOrder("TOTAL_LENGTH", "CHEST_WIDTH")))
			.andExpect(jsonPath("$.data.entries[0].measurements[*].feeling",
				containsInAnyOrder("EXACT", "LARGE")))
			.andExpect(jsonPath("$.data.createdAt").exists())
			.andExpect(jsonPath("$.data.updatedAt").exists());

		MyFit myFit = findSavedMyFit();
		Long entryId = findSavedEntryId(myFit.getId());
		assertThat(findSavedCategories(myFit.getId())).containsExactly("\uC0C1\uC758");
		assertThat(findSavedAreas(entryId)).containsExactlyInAnyOrder("\uCD1D\uC7A5", "\uAC00\uC2B4\uB2E8\uBA74");
		assertThat(findSavedFeelings(entryId)).containsExactlyInAnyOrder("\uB531\uB9DE\uC74C", "\uCEE4\uC74C");
	}

	@Test
	void get_my_fit_success() throws Exception {
		String accessToken = signupAndLogin();
		createMyFit(accessToken).andExpect(status().isCreated());

		mockMvc.perform(get(MY_FIT_ME_URL)
				.header(HttpHeaders.AUTHORIZATION, "Bearer " + accessToken))
			.andExpect(status().isOk())
			.andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
			.andExpect(jsonPath("$.success").value(true))
			.andExpect(jsonPath("$.message").value(GET_SUCCESS_MESSAGE))
			.andExpect(jsonPath("$.data.entries[0].category").value("TOP"))
			.andExpect(jsonPath("$.data.entries[0].garmentLabel").value("oxford shirt"))
			.andExpect(jsonPath("$.data.entries[0].measurements[*].area",
				containsInAnyOrder("TOTAL_LENGTH", "CHEST_WIDTH")));
	}

	@Test
	void update_my_fit_success() throws Exception {
		String accessToken = signupAndLogin();
		createMyFit(accessToken).andExpect(status().isCreated());

		mockMvc.perform(patch(MY_FIT_ME_URL)
				.header(HttpHeaders.AUTHORIZATION, "Bearer " + accessToken)
				.contentType(MediaType.APPLICATION_JSON)
				.content(updateMyFitRequestJson()))
			.andExpect(status().isOk())
			.andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
			.andExpect(jsonPath("$.success").value(true))
			.andExpect(jsonPath("$.message").value(UPDATE_SUCCESS_MESSAGE))
			.andExpect(jsonPath("$.data.entries[0].category").value("BOTTOM"))
			.andExpect(jsonPath("$.data.entries[0].garmentLabel").value("straight denim"))
			.andExpect(jsonPath("$.data.entries[0].measurements[0].area").value("WAIST_WIDTH"))
			.andExpect(jsonPath("$.data.entries[0].measurements[0].feeling").value("SMALL"));

		MyFit myFit = findSavedMyFit();
		Long entryId = findSavedEntryId(myFit.getId());
		assertThat(findSavedCategories(myFit.getId())).containsExactly("\uD558\uC758");
		assertThat(findSavedAreas(entryId)).containsExactly("\uD5C8\uB9AC\uB2E8\uBA74");
		assertThat(findSavedFeelings(entryId)).containsExactly("\uC791\uC558\uC74C");
	}

	@Test
	void update_my_fit_same_category_repeatedly_success() throws Exception {
		String accessToken = signupAndLogin();
		createMyFit(accessToken).andExpect(status().isCreated());
		MyFit myFit = findSavedMyFit();
		Long originalEntryId = findSavedEntryId(myFit.getId());

		mockMvc.perform(patch(MY_FIT_ME_URL)
				.header(HttpHeaders.AUTHORIZATION, "Bearer " + accessToken)
				.contentType(MediaType.APPLICATION_JSON)
				.content(sameCategoryUpdateMyFitRequestJson("updated oxford", 51.00, 69.00)))
			.andExpect(status().isOk())
			.andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
			.andExpect(jsonPath("$.success").value(true))
			.andExpect(jsonPath("$.message").value(UPDATE_SUCCESS_MESSAGE))
			.andExpect(jsonPath("$.data.entries[0].category").value("TOP"))
			.andExpect(jsonPath("$.data.entries[0].garmentLabel").value("updated oxford"))
			.andExpect(jsonPath("$.data.entries[0].measurements[*].area",
				containsInAnyOrder("TOTAL_LENGTH", "CHEST_WIDTH")));

		mockMvc.perform(patch(MY_FIT_ME_URL)
				.header(HttpHeaders.AUTHORIZATION, "Bearer " + accessToken)
				.contentType(MediaType.APPLICATION_JSON)
				.content(sameCategoryUpdateMyFitRequestJson("updated oxford second", 53.00, 71.00)))
			.andExpect(status().isOk())
			.andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
			.andExpect(jsonPath("$.success").value(true))
			.andExpect(jsonPath("$.message").value(UPDATE_SUCCESS_MESSAGE))
			.andExpect(jsonPath("$.data.entries[0].category").value("TOP"))
			.andExpect(jsonPath("$.data.entries[0].garmentLabel").value("updated oxford second"))
			.andExpect(jsonPath("$.data.entries[0].measurements[*].area",
				containsInAnyOrder("TOTAL_LENGTH", "CHEST_WIDTH")));

		Long updatedEntryId = findSavedEntryId(myFit.getId());
		assertThat(updatedEntryId).isEqualTo(originalEntryId);
		assertThat(findSavedCategories(myFit.getId())).containsExactly("\uC0C1\uC758");
		assertThat(findSavedAreas(updatedEntryId)).containsExactlyInAnyOrder("\uCD1D\uC7A5", "\uAC00\uC2B4\uB2E8\uBA74");
		assertThat(findSavedFeelings(updatedEntryId)).containsExactlyInAnyOrder("\uB531\uB9DE\uC74C", "\uC791\uC558\uC74C");
	}

	@Test
	void create_my_fit_fail_when_already_exists() throws Exception {
		String accessToken = signupAndLogin();
		createMyFit(accessToken).andExpect(status().isCreated());

		createMyFit(accessToken)
			.andExpect(status().isConflict())
			.andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
			.andExpect(jsonPath("$.success").value(false))
			.andExpect(jsonPath("$.code").value("MY_FIT_ALREADY_EXISTS"))
			.andExpect(jsonPath("$.message").value(ALREADY_EXISTS_MESSAGE));
	}

	@Test
	void get_my_fit_fail_when_not_found() throws Exception {
		String accessToken = signupAndLogin();

		mockMvc.perform(get(MY_FIT_ME_URL)
				.header(HttpHeaders.AUTHORIZATION, "Bearer " + accessToken))
			.andExpect(status().isNotFound())
			.andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
			.andExpect(jsonPath("$.success").value(false))
			.andExpect(jsonPath("$.code").value("MY_FIT_NOT_FOUND"))
			.andExpect(jsonPath("$.message").value(NOT_FOUND_MESSAGE));
	}

	@Test
	void update_my_fit_fail_when_not_found() throws Exception {
		String accessToken = signupAndLogin();

		mockMvc.perform(patch(MY_FIT_ME_URL)
				.header(HttpHeaders.AUTHORIZATION, "Bearer " + accessToken)
				.contentType(MediaType.APPLICATION_JSON)
				.content(updateMyFitRequestJson()))
			.andExpect(status().isNotFound())
			.andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
			.andExpect(jsonPath("$.success").value(false))
			.andExpect(jsonPath("$.code").value("MY_FIT_NOT_FOUND"))
			.andExpect(jsonPath("$.message").value(NOT_FOUND_MESSAGE));
	}

	@Test
	void update_my_fit_fail_when_request_is_empty() throws Exception {
		String accessToken = signupAndLogin();
		createMyFit(accessToken).andExpect(status().isCreated());

		mockMvc.perform(patch(MY_FIT_ME_URL)
				.header(HttpHeaders.AUTHORIZATION, "Bearer " + accessToken)
				.contentType(MediaType.APPLICATION_JSON)
				.content("{}"))
			.andExpect(status().isBadRequest())
			.andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
			.andExpect(jsonPath("$.success").value(false))
			.andExpect(jsonPath("$.code").value("MY_FIT_UPDATE_EMPTY"))
			.andExpect(jsonPath("$.message").value(UPDATE_EMPTY_MESSAGE));
	}

	@Test
	void create_my_fit_fail_when_measurements_are_empty() throws Exception {
		String accessToken = signupAndLogin();

		mockMvc.perform(post(MY_FIT_URL)
				.header(HttpHeaders.AUTHORIZATION, "Bearer " + accessToken)
				.contentType(MediaType.APPLICATION_JSON)
				.content("""
					{
					  "entries": [
					    {
					      "category": "TOP",
					      "garmentLabel": "oxford shirt",
					      "measurements": []
					    }
					  ]
					}
					"""))
			.andExpect(status().isBadRequest())
			.andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
			.andExpect(jsonPath("$.success").value(false))
			.andExpect(jsonPath("$.code").value("INVALID_INPUT"))
			.andExpect(jsonPath("$.message").value(INVALID_INPUT_MESSAGE));
	}

	@Test
	void create_my_fit_fail_without_token() throws Exception {
		mockMvc.perform(post(MY_FIT_URL)
				.contentType(MediaType.APPLICATION_JSON)
				.content(createMyFitRequestJson()))
			.andExpect(status().isUnauthorized())
			.andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
			.andExpect(jsonPath("$.success").value(false))
			.andExpect(jsonPath("$.code").value("UNAUTHORIZED"))
			.andExpect(jsonPath("$.message").value(UNAUTHORIZED_MESSAGE));
	}

	private String signupAndLogin() throws Exception {
		signUp();

		return loginAndExtractAccessToken();
	}

	private void signUp() throws Exception {
		mockMvc.perform(post(SIGN_UP_URL)
				.contentType(MediaType.APPLICATION_JSON)
				.content("""
					{
					  "email": "%s",
					  "password": "%s",
					  "nickname": "%s"
					}
					""".formatted(EMAIL, PASSWORD, NICKNAME)))
			.andExpect(status().isOk());
	}

	private String loginAndExtractAccessToken() throws Exception {
		MvcResult loginResult = mockMvc.perform(post(LOGIN_URL)
				.contentType(MediaType.APPLICATION_JSON)
				.content("""
					{
					  "email": "%s",
					  "password": "%s"
					}
					""".formatted(EMAIL, PASSWORD)))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.data.accessToken", not(blankOrNullString())))
			.andReturn();

		return JsonPath.read(loginResult.getResponse().getContentAsString(), "$.data.accessToken");
	}

	private ResultActions createMyFit(String accessToken) throws Exception {
		return mockMvc.perform(post(MY_FIT_URL)
			.header(HttpHeaders.AUTHORIZATION, "Bearer " + accessToken)
			.contentType(MediaType.APPLICATION_JSON)
			.content(createMyFitRequestJson()));
	}

	private String createMyFitRequestJson() throws Exception {
		return objectMapper.writeValueAsString(Map.of(
			"entries", List.of(Map.of(
				"category", "TOP",
				"garmentLabel", "oxford shirt",
				"measurements", List.of(
					Map.of("area", "TOTAL_LENGTH", "sizeCm", 68.50, "feeling", "EXACT"),
					Map.of("area", "CHEST_WIDTH", "sizeCm", 52.50, "feeling", "LARGE")
				)
			))
		));
	}

	private String updateMyFitRequestJson() throws Exception {
		return objectMapper.writeValueAsString(Map.of(
			"entries", List.of(Map.of(
				"category", "BOTTOM",
				"garmentLabel", "straight denim",
				"measurements", List.of(
					Map.of("area", "WAIST_WIDTH", "sizeCm", 40.00, "feeling", "SMALL")
				)
			))
		));
	}

	private String sameCategoryUpdateMyFitRequestJson(String garmentLabel, double chestWidth, double totalLength)
		throws Exception {
		return objectMapper.writeValueAsString(Map.of(
			"entries", List.of(Map.of(
				"category", "TOP",
				"garmentLabel", garmentLabel,
				"measurements", List.of(
					Map.of("area", "TOTAL_LENGTH", "sizeCm", totalLength, "feeling", "EXACT"),
					Map.of("area", "CHEST_WIDTH", "sizeCm", chestWidth, "feeling", "SMALL")
				)
			))
		));
	}

	private MyFit findSavedMyFit() {
		Member member = memberRepository.findByEmail(EMAIL).orElseThrow();

		return myFitRepository.findByMember(member).orElseThrow();
	}

	private List<String> findSavedCategories(Long myFitId) {
		return jdbcTemplate.queryForList(
			"select category from my_fit_entries where my_fit_id = ?",
			String.class,
			myFitId
		);
	}

	private Long findSavedEntryId(Long myFitId) {
		return jdbcTemplate.queryForObject(
			"select id from my_fit_entries where my_fit_id = ?",
			Long.class,
			myFitId
		);
	}

	private List<String> findSavedAreas(Long entryId) {
		return jdbcTemplate.queryForList(
			"select area from my_fit_measurements where entry_id = ?",
			String.class,
			entryId
		);
	}

	private List<String> findSavedFeelings(Long entryId) {
		return jdbcTemplate.queryForList(
			"select feeling from my_fit_measurements where entry_id = ?",
			String.class,
			entryId
		);
	}
}
