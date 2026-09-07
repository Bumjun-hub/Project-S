package com.projects.backend.recommendation;

import static org.hamcrest.Matchers.blankOrNullString;
import static org.hamcrest.Matchers.hasItem;
import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.not;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
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
