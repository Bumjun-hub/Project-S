package com.projects.backend.recommendation.dto;

import java.math.BigDecimal;

import com.projects.backend.myfit.entity.FitFeeling;
import com.projects.backend.myfit.entity.MeasurementArea;
import com.projects.backend.recommendation.calculator.MeasurementComparisonResult;

public record MeasurementComparisonResponse(
	MeasurementArea area,
	String areaLabel,
	BigDecimal myFitSizeCm,
	FitFeeling feeling,
	BigDecimal adjustmentCm,
	BigDecimal targetSizeCm,
	BigDecimal productSizeCm,
	BigDecimal differenceCm,
	BigDecimal absoluteDifferenceCm,
	String message
) {

	public static MeasurementComparisonResponse from(MeasurementComparisonResult result) {
		return new MeasurementComparisonResponse(
			result.area(),
			result.areaLabel(),
			result.myFitSizeCm(),
			result.feeling(),
			result.adjustmentCm(),
			result.targetSizeCm(),
			result.productSizeCm(),
			result.differenceCm(),
			result.absoluteDifferenceCm(),
			result.message()
		);
	}
}
