package com.projects.backend.bodyprofile.dto;

import java.math.BigDecimal;
import java.util.Set;

import com.projects.backend.bodyprofile.entity.BodyFeature;
import com.projects.backend.bodyprofile.entity.Gender;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotNull;

public record BodyProfileCreateRequest(
	@NotNull(message = "\uD0A4\uB294 \uD544\uC218\uAC12\uC785\uB2C8\uB2E4.")
	@DecimalMin(value = "100.0", message = "\uD0A4\uB294 100.0cm \uC774\uC0C1\uC774\uC5B4\uC57C \uD569\uB2C8\uB2E4.")
	@DecimalMax(value = "250.0", message = "\uD0A4\uB294 250.0cm \uC774\uD558\uC5EC\uC57C \uD569\uB2C8\uB2E4.")
	@Digits(integer = 3, fraction = 1, message = "\uD0A4\uB294 \uC18C\uC218\uC810 \uCCAB\uC9F8 \uC790\uB9AC\uAE4C\uC9C0\uB9CC \uC785\uB825\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4.")
	BigDecimal height,

	@NotNull(message = "\uBAB8\uBB34\uAC8C\uB294 \uD544\uC218\uAC12\uC785\uB2C8\uB2E4.")
	@DecimalMin(value = "20.0", message = "\uBAB8\uBB34\uAC8C\uB294 20.0kg \uC774\uC0C1\uC774\uC5B4\uC57C \uD569\uB2C8\uB2E4.")
	@DecimalMax(value = "300.0", message = "\uBAB8\uBB34\uAC8C\uB294 300.0kg \uC774\uD558\uC5EC\uC57C \uD569\uB2C8\uB2E4.")
	@Digits(integer = 3, fraction = 1, message = "\uBAB8\uBB34\uAC8C\uB294 \uC18C\uC218\uC810 \uCCAB\uC9F8 \uC790\uB9AC\uAE4C\uC9C0\uB9CC \uC785\uB825\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4.")
	BigDecimal weight,

	@NotNull(message = "\uC131\uBCC4\uC740 \uD544\uC218\uAC12\uC785\uB2C8\uB2E4.")
	Gender gender,

	Set<BodyFeature> bodyFeatures
) {

	public BodyProfileCreateRequest {
		bodyFeatures = bodyFeatures == null
			? Set.of()
			: Set.copyOf(bodyFeatures);
	}
}
