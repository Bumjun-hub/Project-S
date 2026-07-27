package com.projects.backend.product.dto;

import java.math.BigDecimal;

import com.projects.backend.myfit.entity.MeasurementArea;
import com.projects.backend.product.entity.ProductMeasurement;

public record ProductMeasurementResponse(
	Long id,
	MeasurementArea area,
	String areaLabel,
	BigDecimal sizeCm
) {

	public static ProductMeasurementResponse from(ProductMeasurement measurement) {
		return new ProductMeasurementResponse(
			measurement.getId(),
			measurement.getArea(),
			measurement.getArea().getLabel(),
			measurement.getSizeCm()
		);
	}
}
