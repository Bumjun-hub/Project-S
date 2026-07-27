package com.projects.backend.recommendation.calculator;

import java.math.BigDecimal;

import com.projects.backend.myfit.entity.FitFeeling;
import com.projects.backend.myfit.entity.MeasurementArea;

public record MeasurementComparisonResult(
	MeasurementArea area,
	String areaLabel,
	BigDecimal myFitSizeCm,
	FitFeeling feeling,
	BigDecimal adjustmentCm,
	BigDecimal targetSizeCm,
	BigDecimal productSizeCm,
	BigDecimal differenceCm,
	BigDecimal absoluteDifferenceCm,
	BigDecimal areaWeight,
	BigDecimal weightedError,
	String message
) {
}
