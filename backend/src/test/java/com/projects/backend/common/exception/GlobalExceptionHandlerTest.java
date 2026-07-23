package com.projects.backend.common.exception;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Bean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;

@SpringBootTest
@AutoConfigureMockMvc(addFilters = false)
class GlobalExceptionHandlerTest {

	private static final String INVALID_INPUT_MESSAGE = "\uC785\uB825\uAC12\uC774 \uC62C\uBC14\uB974\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4.";
	private static final String INTERNAL_SERVER_ERROR_MESSAGE = "\uC11C\uBC84\uC5D0\uC11C \uC624\uB958\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4.";

	@Autowired
	private MockMvc mockMvc;

	@Test
	void businessExceptionReturnsErrorResponse() throws Exception {
		mockMvc.perform(get("/test/business-exception"))
			.andExpect(status().isBadRequest())
			.andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
			.andExpect(jsonPath("$.success").value(false))
			.andExpect(jsonPath("$.code").value("INVALID_INPUT"))
			.andExpect(jsonPath("$.message").value(INVALID_INPUT_MESSAGE));
	}

	@Test
	void validationExceptionReturnsInvalidInputErrorResponse() throws Exception {
		mockMvc.perform(post("/test/validation-exception")
				.contentType(MediaType.APPLICATION_JSON)
				.content("{}"))
			.andExpect(status().isBadRequest())
			.andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
			.andExpect(jsonPath("$.success").value(false))
			.andExpect(jsonPath("$.code").value("INVALID_INPUT"))
			.andExpect(jsonPath("$.message").value(INVALID_INPUT_MESSAGE));
	}

	@Test
	void unknownExceptionReturnsInternalServerErrorResponse() throws Exception {
		mockMvc.perform(get("/test/unknown-exception"))
			.andExpect(status().isInternalServerError())
			.andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
			.andExpect(jsonPath("$.success").value(false))
			.andExpect(jsonPath("$.code").value("INTERNAL_SERVER_ERROR"))
			.andExpect(jsonPath("$.message").value(INTERNAL_SERVER_ERROR_MESSAGE));
	}

	@RestController
	static class TestController {

		@GetMapping("/test/business-exception")
		void businessException() {
			throw createBusinessException("INVALID_INPUT");
		}

		@PostMapping("/test/validation-exception")
		void validationException(@Valid @RequestBody TestRequest request) {
		}

		@GetMapping("/test/unknown-exception")
		void unknownException() {
			throw new IllegalStateException("Unexpected test exception");
		}
	}

	private record TestRequest(
		@NotBlank String name
	) {
	}

	@TestConfiguration
	static class TestControllerConfiguration {

		@Bean
		TestController testController() {
			return new TestController();
		}
	}

	@SuppressWarnings({ "unchecked", "rawtypes" })
	private static RuntimeException createBusinessException(String errorCodeName) {
		try {
			Class<? extends Enum> errorCodeClass = Class
				.forName("com.projects.backend.common.exception.ErrorCode")
				.asSubclass(Enum.class);
			Enum errorCode = Enum.valueOf(errorCodeClass, errorCodeName);

			return (RuntimeException) Class
				.forName("com.projects.backend.common.exception.BusinessException")
				.getConstructor(errorCodeClass)
				.newInstance(errorCode);
		} catch (ReflectiveOperationException exception) {
			throw new IllegalStateException(exception);
		}
	}
}
