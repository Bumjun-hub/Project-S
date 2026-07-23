package com.projects.backend.myfit.dto;

import java.math.BigDecimal;

import com.projects.backend.myfit.entity.FitFeeling;
import com.projects.backend.myfit.entity.MeasurementArea;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotNull;

public record MyFitMeasurementRequest(
	@NotNull(message = "\uCE21\uC815 \uBD80\uC704\uB294 \uD544\uC218\uAC12\uC785\uB2C8\uB2E4.")
	MeasurementArea area,

	@NotNull(message = "\uC2E4\uCE21\uAC12\uC740 \uD544\uC218\uAC12\uC785\uB2C8\uB2E4.")
	@DecimalMin(value = "0.1", message = "\uC2E4\uCE21\uAC12\uC740 0.1cm \uC774\uC0C1\uC774\uC5B4\uC57C \uD569\uB2C8\uB2E4.")
	@Digits(integer = 5, fraction = 2, message = "\uC2E4\uCE21\uAC12\uC740 \uC815\uC218 5\uC790\uB9AC\uC640 \uC18C\uC218\uC810 \uB458\uC9F8 \uC790\uB9AC\uAE4C\uC9C0\uB9CC \uC785\uB825\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4.")
	BigDecimal sizeCm,

	@NotNull(message = "\uCC29\uC6A9\uAC10\uC740 \uD544\uC218\uAC12\uC785\uB2C8\uB2E4.")
	FitFeeling feeling
) {
}
