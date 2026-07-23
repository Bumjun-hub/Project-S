package com.projects.backend.myfit.dto;

import java.math.BigDecimal;

import com.projects.backend.myfit.entity.FitFeeling;
import com.projects.backend.myfit.entity.MeasurementArea;
import com.projects.backend.myfit.entity.MyFitMeasurement;

public record MyFitMeasurementResponse(
	Long id,
	MeasurementArea area,
	BigDecimal sizeCm,
	FitFeeling feeling
) {

	public static MyFitMeasurementResponse from(MyFitMeasurement measurement) {
		return new MyFitMeasurementResponse(
			measurement.getId(),
			measurement.getArea(),
			measurement.getSizeCm(),
			measurement.getFeeling()
		);
	}
}
