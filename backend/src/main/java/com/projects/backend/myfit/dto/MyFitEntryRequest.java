package com.projects.backend.myfit.dto;

import java.util.List;

import com.projects.backend.myfit.entity.FitCategory;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

public record MyFitEntryRequest(
	@NotNull(message = "\uCE74\uD14C\uACE0\uB9AC\uB294 \uD544\uC218\uAC12\uC785\uB2C8\uB2E4.")
	FitCategory category,

	@NotBlank(message = "\uAE30\uC900 \uC637 \uC774\uB984\uC740 \uD544\uC218\uAC12\uC785\uB2C8\uB2E4.")
	String garmentLabel,

	@Valid
	@NotEmpty(message = "\uC2E4\uCE21 \uC815\uBCF4\uB294 \uCD5C\uC18C 1\uAC1C \uC774\uC0C1 \uC785\uB825\uD574\uC57C \uD569\uB2C8\uB2E4.")
	List<MyFitMeasurementRequest> measurements
) {

	public MyFitEntryRequest {
		measurements = measurements == null
			? List.of()
			: List.copyOf(measurements);
	}
}
