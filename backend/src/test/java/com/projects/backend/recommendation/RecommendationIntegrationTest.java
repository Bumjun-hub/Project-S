package com.projects.backend.recommendation;

import static org.hamcrest.Matchers.blankOrNullString;
import static org.hamcrest.Matchers.hasItem;
import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.not;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
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
import org.springframework.test.web.servlet.MvcResult;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.jayway.jsonpath.JsonPath;
import com.projects.backend.myfit.entity.MeasurementArea;
import com.projects.backend.product.entity.Product;
import com.projects.backend.product.entity.ProductCategory;
import com.projects.backend.product.entity.ProductMeasurement;
import com.projects.backend.product.entity.ProductSize;
import com.projects.backend.product.repository.ProductRepository;

@SpringBootTest
@AutoConfigureMockMvc
class RecommendationIntegrationTest {

	private static final String SIGN_UP_URL = "/api/v1/members";
	private static final String LOGIN_URL = "/api/v1/auth/login";
	private static final String BODY_PROFILE_URL = "/api/v1/body-profiles";
	private static final String MY_FIT_URL = "/api/v1/my-fits";
	private static final String RECOMMENDATION_URL = "/api/v1/recommendations";
	private static final String RECOMMENDATION_HISTORY_URL = "/api/v1/recommendations/history";
	private static final String PASSWORD = "Password123!";
	private static final String SUCCESS_MESSAGE =
		"\uC0AC\uC774\uC988 \uCD94\uCC9C \uACB0\uACFC\uB97C \uC0DD\uC131\uD588\uC2B5\uB2C8\uB2E4.";
	private static final String PRODUCT_NOT_FOUND_MESSAGE =
		"\uC0C1\uD488\uC744 \uCC3E\uC744 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4.";
	private static final String MY_FIT_NOT_FOUND_MESSAGE =
		"\uAE30\uC900 \uD54F \uC815\uBCF4\uB97C \uCC3E\uC744 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4.";
	private static final String RECOMMENDATION_NOT_AVAILABLE_MESSAGE =
		"\uCD94\uCC9C\uC744 \uACC4\uC0B0\uD560 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4.";
	private static final String UNAUTHORIZED_MESSAGE =
		"\uC778\uC99D\uC774 \uD544\uC694\uD569\uB2C8\uB2E4.";

	@Autowired
	private MockMvc mockMvc;

	@Autowired
	private ObjectMapper objectMapper;

	@Autowired
	private JdbcTemplate jdbcTemplate;

	@Autowired
	private ProductRepository productRepository;
    @Autowired
    private jakarta.persistence.EntityManagerFactory entityManagerFactory;

	@BeforeEach
	void setUp() {
		jdbcTemplate.update("delete from recommendation_histories");
		jdbcTemplate.update("delete from my_fit_measurements");
		jdbcTemplate.update("delete from my_fit_entries");
		jdbcTemplate.update("delete from my_fits");
		jdbcTemplate.update("delete from body_profile_features");
		jdbcTemplate.update("delete from body_profiles");
		jdbcTemplate.update("delete from members");
	}

	@Test
	void get_recommendation_history_returns_current_members_records() throws Exception {
		String accessToken = prepareUser("recommend-history@example.com");
		createBodyProfile(accessToken);
		createTopMyFit(accessToken);

		mockMvc.perform(post(RECOMMENDATION_URL)
				.header(HttpHeaders.AUTHORIZATION, "Bearer " + accessToken)
				.contentType(MediaType.APPLICATION_JSON)
				.content(recommendationRequestJson("p-oxford-01")))
			.andExpect(status().isOk());

		mockMvc.perform(get(RECOMMENDATION_HISTORY_URL)
				.header(HttpHeaders.AUTHORIZATION, "Bearer " + accessToken))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.success").value(true))
			.andExpect(jsonPath("$.data", hasSize(1)))
			.andExpect(jsonPath("$.data[0].productCode").value("p-oxford-01"))
			.andExpect(jsonPath("$.data[0].recommendedSize").value("M"))
			.andExpect(jsonPath("$.data[0].createdAt").isNotEmpty());
	}

	@Test
	void create_recommendation_success() throws Exception {
		String accessToken = prepareUser("recommend-success@example.com");
		createBodyProfile(accessToken);
		createTopMyFit(accessToken);

		mockMvc.perform(post(RECOMMENDATION_URL)
				.header(HttpHeaders.AUTHORIZATION, "Bearer " + accessToken)
				.contentType(MediaType.APPLICATION_JSON)
				.content(recommendationRequestJson("p-oxford-01")))
			.andExpect(status().isOk())
			.andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
			.andExpect(jsonPath("$.success").value(true))
			.andExpect(jsonPath("$.message").value(SUCCESS_MESSAGE))
			.andExpect(jsonPath("$.data.productCode").value("p-oxford-01"))
			.andExpect(jsonPath("$.data.recommendedSize").value("M"))
			.andExpect(jsonPath("$.data.matchScore").isNumber())
			.andExpect(jsonPath("$.data.reason").isNotEmpty())
			.andExpect(jsonPath("$.data.comparisons", hasSize(2)))
			.andExpect(jsonPath("$.data.comparisons[*].area", hasItem("CHEST_WIDTH")))
			.andExpect(jsonPath("$.data.comparisons[*].area", hasItem("TOTAL_LENGTH")));
	}

	@Test
	void create_recommendation_fail_without_token() throws Exception {
		mockMvc.perform(post(RECOMMENDATION_URL)
				.contentType(MediaType.APPLICATION_JSON)
				.content(recommendationRequestJson("p-oxford-01")))
			.andExpect(status().isUnauthorized())
			.andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
			.andExpect(jsonPath("$.success").value(false))
			.andExpect(jsonPath("$.code").value("UNAUTHORIZED"))
			.andExpect(jsonPath("$.message").value(UNAUTHORIZED_MESSAGE));
	}

	@Test
	void create_recommendation_fail_when_product_not_found() throws Exception {
		String accessToken = prepareUser("recommend-product-not-found@example.com");
		createBodyProfile(accessToken);
		createTopMyFit(accessToken);

		mockMvc.perform(post(RECOMMENDATION_URL)
				.header(HttpHeaders.AUTHORIZATION, "Bearer " + accessToken)
				.contentType(MediaType.APPLICATION_JSON)
				.content(recommendationRequestJson("unknown-product")))
			.andExpect(status().isNotFound())
			.andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
			.andExpect(jsonPath("$.success").value(false))
			.andExpect(jsonPath("$.code").value("PRODUCT_NOT_FOUND"))
			.andExpect(jsonPath("$.message").value(PRODUCT_NOT_FOUND_MESSAGE));
	}

	@Test
	void create_recommendation_fail_when_my_fit_not_found() throws Exception {
		String accessToken = prepareUser("recommend-myfit-not-found@example.com");
		createBodyProfile(accessToken);

		mockMvc.perform(post(RECOMMENDATION_URL)
				.header(HttpHeaders.AUTHORIZATION, "Bearer " + accessToken)
				.contentType(MediaType.APPLICATION_JSON)
				.content(recommendationRequestJson("p-oxford-01")))
			.andExpect(status().isNotFound())
			.andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
			.andExpect(jsonPath("$.success").value(false))
			.andExpect(jsonPath("$.code").value("MY_FIT_NOT_FOUND"))
			.andExpect(jsonPath("$.message").value(MY_FIT_NOT_FOUND_MESSAGE));
	}

	@Test
	void create_recommendation_fail_when_no_common_measurement_area() throws Exception {
		saveProductWithoutCommonArea();
		String accessToken = prepareUser("recommend-no-common@example.com");
		createBodyProfile(accessToken);
		createTopMyFit(accessToken);

		mockMvc.perform(post(RECOMMENDATION_URL)
				.header(HttpHeaders.AUTHORIZATION, "Bearer " + accessToken)
				.contentType(MediaType.APPLICATION_JSON)
				.content(recommendationRequestJson("rec-no-common-01")))
			.andExpect(status().isUnprocessableEntity())
			.andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
			.andExpect(jsonPath("$.success").value(false))
			.andExpect(jsonPath("$.code").value("RECOMMENDATION_NOT_AVAILABLE"))
			.andExpect(jsonPath("$.message").value(RECOMMENDATION_NOT_AVAILABLE_MESSAGE));
	}

	private String prepareUser(String email) throws Exception {
		signUp(email);
		return loginAndExtractAccessToken(email);
	}

    @Test
    void recommendation_feedback_and_history_use_same_saved_id_and_comparisons() throws Exception {
        String token = prepareUser("feedback-flow@example.com");
        createBodyProfile(token);
        createTopMyFit(token);
        var created = objectMapper.readTree(recommend(token, "feedback-flow-key")).get("data");
        long id = created.get("historyId").asLong();
        assertTrue(id > 0);
        assertTrue(created.get("createdAt").asText().length() > 0);

        mockMvc.perform(patch(RECOMMENDATION_HISTORY_URL + "/" + id + "/feedback")
            .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
            .contentType(MediaType.APPLICATION_JSON).content("{\"feedback\":\"GOOD\"}"))
            .andExpect(status().isOk()).andExpect(jsonPath("$.data.id").value(id))
            .andExpect(jsonPath("$.data.feedback").value("GOOD"));

        var history = objectMapper.readTree(mockMvc.perform(get(RECOMMENDATION_HISTORY_URL + "/page")
            .header(HttpHeaders.AUTHORIZATION, "Bearer " + token))
            .andExpect(status().isOk()).andReturn().getResponse().getContentAsString()).get("data");
        assertEquals(1, history.get("totalElements").asInt());
        var record = history.get("content").get(0);
        assertEquals(id, record.get("id").asLong());
        assertEquals("GOOD", record.get("feedback").asText());
        assertEquals(created.get("comparisons"), record.get("comparisons"));
        assertEquals(created.get("createdAt"), record.get("createdAt"));
        assertEquals("measurements-v1", record.get("calculatorVersion").asText());
    }

    @Test
    void another_member_cannot_read_or_update_an_owners_history() throws Exception {
        String owner = prepareUser("history-owner@example.com");
        createBodyProfile(owner);
        createTopMyFit(owner);
        long id = objectMapper.readTree(recommend(owner, "owner-run")).at("/data/historyId").asLong();
        String other = prepareUser("history-other@example.com");
        mockMvc.perform(get(RECOMMENDATION_HISTORY_URL + "/page")
            .header(HttpHeaders.AUTHORIZATION, "Bearer " + other))
            .andExpect(status().isOk()).andExpect(jsonPath("$.data.content", hasSize(0)));
        mockMvc.perform(patch(RECOMMENDATION_HISTORY_URL + "/" + id + "/feedback")
            .header(HttpHeaders.AUTHORIZATION, "Bearer " + other)
            .contentType(MediaType.APPLICATION_JSON).content("{\"feedback\":\"LARGE\"}"))
            .andExpect(status().isNotFound());
        assertEquals(0, jdbcTemplate.queryForObject("select count(*) from recommendation_histories where feedback is not null", Integer.class));
    }

    @Test
    void retrying_the_same_request_does_not_create_duplicate_history() throws Exception {
        String token = prepareUser("idempotent@example.com");
        createBodyProfile(token);
        createTopMyFit(token);
        var first = objectMapper.readTree(recommend(token, "same-request"));
        var second = objectMapper.readTree(recommend(token, "same-request"));
        assertEquals(first.get("data"), second.get("data"));
        assertEquals(1, jdbcTemplate.queryForObject("select count(*) from recommendation_histories", Integer.class));
        mockMvc.perform(post(RECOMMENDATION_URL).header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
            .header("Idempotency-Key", "same-request").contentType(MediaType.APPLICATION_JSON)
            .content(recommendationRequestJson("p-knit-02")))
            .andExpect(status().isBadRequest()).andExpect(jsonPath("$.code").value("INVALID_INPUT"));
    }

    @Test
    void concurrent_retries_store_one_record() throws Exception {
        String token = prepareUser("concurrent@example.com");
        createBodyProfile(token);
        createTopMyFit(token);
        var executor = java.util.concurrent.Executors.newFixedThreadPool(2);
        try {
            var first = executor.submit(() -> recommend(token, "concurrent-run"));
            var second = executor.submit(() -> recommend(token, "concurrent-run"));
            assertEquals(objectMapper.readTree(first.get(15, java.util.concurrent.TimeUnit.SECONDS)).get("data"),
                objectMapper.readTree(second.get(15, java.util.concurrent.TimeUnit.SECONDS)).get("data"));
            assertEquals(1, jdbcTemplate.queryForObject("select count(*) from recommendation_histories", Integer.class));
        } finally {
            executor.shutdownNow();
        }
    }

    @Test
    void history_snapshot_survives_product_and_myfit_edits() throws Exception {
        String token = prepareUser("snapshot@example.com");
        createBodyProfile(token);
        createTopMyFit(token);
        var created = objectMapper.readTree(recommend(token, "snapshot-run")).get("data");
        String originalName = jdbcTemplate.queryForObject("select name from products where code = 'p-oxford-01'", String.class);
        try {
            jdbcTemplate.update("update products set name = 'renamed product' where code = 'p-oxford-01'");
            jdbcTemplate.update("update my_fit_measurements set size_cm = 99");
            var record = objectMapper.readTree(mockMvc.perform(get(RECOMMENDATION_HISTORY_URL)
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)).andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString()).at("/data/0");
            assertEquals(created.get("productName"), record.get("productName"));
            assertEquals(created.get("comparisons"), record.get("comparisons"));
            assertEquals(created.get("reason").asText(), record.get("reason").asText());
        } finally {
            jdbcTemplate.update("update products set name = ? where code = 'p-oxford-01'", originalName);
        }
    }

    @Test
    void paged_history_is_latest_first_and_rejects_invalid_page_sizes() throws Exception {
        String token = prepareUser("paged-history@example.com");
        createBodyProfile(token);
        createTopMyFit(token);
        long firstId = objectMapper.readTree(recommend(token, "page-run-one")).at("/data/historyId").asLong();
        long secondId = objectMapper.readTree(recommend(token, "page-run-two")).at("/data/historyId").asLong();
        var statistics = entityManagerFactory.unwrap(org.hibernate.SessionFactory.class).getStatistics();
        statistics.clear();
        mockMvc.perform(get(RECOMMENDATION_HISTORY_URL + "/page?size=1&page=0").header(HttpHeaders.AUTHORIZATION, "Bearer " + token))
            .andExpect(status().isOk()).andExpect(jsonPath("$.data.totalElements").value(2))
            .andExpect(jsonPath("$.data.content[0].id").value(secondId));
        assertTrue(statistics.getPrepareStatementCount() <= 3, "History uses member lookup, one joined page query and one count query");
        assertEquals(0, statistics.getCollectionLoadCount(), "History must not fetch current product measurement collections");
        mockMvc.perform(get(RECOMMENDATION_HISTORY_URL + "/page?size=1&page=1").header(HttpHeaders.AUTHORIZATION, "Bearer " + token))
            .andExpect(status().isOk()).andExpect(jsonPath("$.data.content[0].id").value(firstId));
        mockMvc.perform(get(RECOMMENDATION_HISTORY_URL + "/page?size=101").header(HttpHeaders.AUTHORIZATION, "Bearer " + token))
            .andExpect(status().isBadRequest());
        mockMvc.perform(get(RECOMMENDATION_HISTORY_URL + "/page")).andExpect(status().isUnauthorized());
    }

    @Test
    void invalid_feedback_id_or_enum_is_a_client_error_not_a_server_error() throws Exception {
        String token = prepareUser("invalid-feedback@example.com");
        mockMvc.perform(patch(RECOMMENDATION_HISTORY_URL + "/rec-invalid/feedback").header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
            .contentType(MediaType.APPLICATION_JSON).content("{\"feedback\":\"GOOD\"}"))
            .andExpect(status().isBadRequest()).andExpect(jsonPath("$.code").value("INVALID_INPUT"));
        mockMvc.perform(patch(RECOMMENDATION_HISTORY_URL + "/1/feedback").header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
            .contentType(MediaType.APPLICATION_JSON).content("{\"feedback\":\"UNKNOWN\"}"))
            .andExpect(status().isBadRequest()).andExpect(jsonPath("$.code").value("INVALID_INPUT"));
    }

    private String recommend(String token, String key) throws Exception {
        return mockMvc.perform(post(RECOMMENDATION_URL).header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
            .header("Idempotency-Key", key).contentType(MediaType.APPLICATION_JSON)
            .content(recommendationRequestJson("p-oxford-01")))
            .andExpect(status().isOk()).andReturn().getResponse().getContentAsString();
    }

	private void signUp(String email) throws Exception {
		mockMvc.perform(post(SIGN_UP_URL)
				.contentType(MediaType.APPLICATION_JSON)
				.content("""
					{
					  "email": "%s",
					  "password": "%s",
					  "nickname": "recommendtester"
					}
					""".formatted(email, PASSWORD)))
			.andExpect(status().isOk());
	}

	private String loginAndExtractAccessToken(String email) throws Exception {
		MvcResult loginResult = mockMvc.perform(post(LOGIN_URL)
				.contentType(MediaType.APPLICATION_JSON)
				.content("""
					{
					  "email": "%s",
					  "password": "%s"
					}
					""".formatted(email, PASSWORD)))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.data.accessToken", not(blankOrNullString())))
			.andReturn();

		return JsonPath.read(loginResult.getResponse().getContentAsString(), "$.data.accessToken");
	}

	private void createBodyProfile(String accessToken) throws Exception {
		mockMvc.perform(post(BODY_PROFILE_URL)
				.header(HttpHeaders.AUTHORIZATION, "Bearer " + accessToken)
				.contentType(MediaType.APPLICATION_JSON)
				.content(objectMapper.writeValueAsString(Map.of(
					"height", 175.0,
					"weight", 68.0,
					"gender", "MALE",
					"bodyFeatures", List.of("BROAD_SHOULDERS")
				))))
			.andExpect(status().isCreated());
	}

	private void createTopMyFit(String accessToken) throws Exception {
		mockMvc.perform(post(MY_FIT_URL)
				.header(HttpHeaders.AUTHORIZATION, "Bearer " + accessToken)
				.contentType(MediaType.APPLICATION_JSON)
				.content(objectMapper.writeValueAsString(Map.of(
					"entries", List.of(Map.of(
						"category", "TOP",
						"garmentLabel", "favorite oxford",
						"measurements", List.of(
							Map.of("area", "CHEST_WIDTH", "sizeCm", 50.0, "feeling", "EXACT"),
							Map.of("area", "TOTAL_LENGTH", "sizeCm", 72.0, "feeling", "EXACT")
						)
					))
				))))
			.andExpect(status().isCreated());
	}

	private String recommendationRequestJson(String productCode) throws Exception {
		return objectMapper.writeValueAsString(Map.of("productCode", productCode));
	}

	private void saveProductWithoutCommonArea() {
		if (productRepository.existsByCode("rec-no-common-01")) {
			return;
		}

		productRepository.save(Product.create(
			"rec-no-common-01",
			"No Common Area Shirt",
			"Recommend Test",
			ProductCategory.TOP,
			10000,
			"recommendation test product",
			List.of(ProductSize.create(
				"M",
				1,
				List.of(ProductMeasurement.create(MeasurementArea.WAIST_WIDTH, new java.math.BigDecimal("40.00")))
			))
		));
	}
}
