package com.projects.backend.product;

import static org.hamcrest.Matchers.containsInAnyOrder;
import static org.hamcrest.Matchers.hasItem;
import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
class ProductControllerTest {

	private static final String PRODUCTS_URL = "/api/v1/products";
	private static final String GET_PRODUCTS_SUCCESS_MESSAGE =
		"\uC0C1\uD488 \uBAA9\uB85D\uC744 \uC870\uD68C\uD588\uC2B5\uB2C8\uB2E4.";
	private static final String GET_PRODUCT_SUCCESS_MESSAGE =
		"\uC0C1\uD488\uC744 \uC870\uD68C\uD588\uC2B5\uB2C8\uB2E4.";
	private static final String NOT_FOUND_MESSAGE =
		"\uC0C1\uD488\uC744 \uCC3E\uC744 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4.";

	@Autowired
	private MockMvc mockMvc;
    @Autowired
    private jakarta.persistence.EntityManagerFactory entityManagerFactory;

    @Test
    void paged_products_are_public_filtered_and_do_not_load_size_collections() throws Exception {
        var statistics = entityManagerFactory.unwrap(org.hibernate.SessionFactory.class).getStatistics();
        statistics.clear();
        mockMvc.perform(get(PRODUCTS_URL + "/page?size=2&page=0"))
            .andExpect(status().isOk()).andExpect(jsonPath("$.data.content", hasSize(2)))
            .andExpect(jsonPath("$.data.content[0].sizes", hasSize(0)));
        assertTrue(statistics.getPrepareStatementCount() <= 2, "Listing must use at most one page query and one count query");
        assertTrue(statistics.getCollectionLoadCount() == 0, "Listing must not load measurements");
        mockMvc.perform(get(PRODUCTS_URL + "/page?category=TOP&search=oxford"))
            .andExpect(status().isOk());
        mockMvc.perform(get(PRODUCTS_URL + "/page?category=상의&search=옥스포드"))
            .andExpect(status().isOk()).andExpect(jsonPath("$.data.content", hasSize(1)))
            .andExpect(jsonPath("$.data.content[0].id").value("p-oxford-01"));
        mockMvc.perform(get(PRODUCTS_URL + "/page?category=하의&search=옥스포드"))
            .andExpect(status().isOk()).andExpect(jsonPath("$.data.content", hasSize(0)));
    }

    @Test
    void invalid_product_pagination_returns_400() throws Exception {
        for (String query : new String[] {"page=-1", "size=0", "size=101", "category=INVALID", "page=nope"}) {
            mockMvc.perform(get(PRODUCTS_URL + "/page?" + query))
                .andExpect(status().isBadRequest()).andExpect(jsonPath("$.code").value("INVALID_INPUT"));
        }
    }

	@Test
	void get_products_success_without_token() throws Exception {
		mockMvc.perform(get(PRODUCTS_URL))
			.andExpect(status().isOk())
			.andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
			.andExpect(jsonPath("$.success").value(true))
			.andExpect(jsonPath("$.message").value(GET_PRODUCTS_SUCCESS_MESSAGE))
			.andExpect(jsonPath("$.data", hasSize(4)))
			.andExpect(jsonPath("$.data[*].id", containsInAnyOrder(
				"p-oxford-01",
				"p-knit-02",
				"p-denim-03",
				"p-coat-04"
			)))
			.andExpect(jsonPath("$.data[0].sizes").isArray());
	}

	@Test
	void get_product_success_without_token() throws Exception {
		mockMvc.perform(get(PRODUCTS_URL + "/p-oxford-01"))
			.andExpect(status().isOk())
			.andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
			.andExpect(jsonPath("$.success").value(true))
			.andExpect(jsonPath("$.message").value(GET_PRODUCT_SUCCESS_MESSAGE))
			.andExpect(jsonPath("$.data.id").value("p-oxford-01"))
			.andExpect(jsonPath("$.data.name").value("\uB808\uADE4\uB7EC \uC625\uC2A4\uD3EC\uB4DC \uC154\uCE20"))
			.andExpect(jsonPath("$.data.category").value("\uC0C1\uC758"))
			.andExpect(jsonPath("$.data.sizes", hasSize(4)))
			.andExpect(jsonPath("$.data.sizes[0].label").value("S"))
			.andExpect(jsonPath("$.data.sizes[0].measurements[*].area", hasItem("CHEST_WIDTH")))
			.andExpect(jsonPath("$.data.sizes[0].measurements[*].areaLabel", hasItem("\uAC00\uC2B4\uB2E8\uBA74")));
	}

	@Test
	void get_product_fail_when_not_found() throws Exception {
		mockMvc.perform(get(PRODUCTS_URL + "/unknown-product"))
			.andExpect(status().isNotFound())
			.andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
			.andExpect(jsonPath("$.success").value(false))
			.andExpect(jsonPath("$.code").value("PRODUCT_NOT_FOUND"))
			.andExpect(jsonPath("$.message").value(NOT_FOUND_MESSAGE));
	}
}
