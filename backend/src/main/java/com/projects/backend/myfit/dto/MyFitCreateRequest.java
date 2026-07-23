package com.projects.backend.myfit.dto;

import java.util.List;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;

public record MyFitCreateRequest(
	@Valid
	@NotEmpty(message = "\uAE30\uC900 \uD54F \uC815\uBCF4\uB294 \uCD5C\uC18C 1\uAC1C \uC774\uC0C1 \uC785\uB825\uD574\uC57C \uD569\uB2C8\uB2E4.")
	List<MyFitEntryRequest> entries
) {

	public MyFitCreateRequest {
		entries = entries == null
			? List.of()
			: List.copyOf(entries);
	}
}
