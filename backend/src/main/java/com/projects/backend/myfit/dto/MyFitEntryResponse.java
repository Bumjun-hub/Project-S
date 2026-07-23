package com.projects.backend.myfit.dto;

import java.util.List;

import com.projects.backend.myfit.entity.FitCategory;
import com.projects.backend.myfit.entity.MyFitEntry;

public record MyFitEntryResponse(
	Long id,
	FitCategory category,
	String garmentLabel,
	List<MyFitMeasurementResponse> measurements
) {

	public static MyFitEntryResponse from(MyFitEntry entry) {
		return new MyFitEntryResponse(
			entry.getId(),
			entry.getCategory(),
			entry.getGarmentLabel(),
			entry.getMeasurements().stream()
				.map(MyFitMeasurementResponse::from)
				.toList()
		);
	}
}
