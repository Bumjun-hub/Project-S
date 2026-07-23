package com.projects.backend.myfit.dto;

import java.time.LocalDateTime;
import java.util.List;

import com.projects.backend.myfit.entity.MyFit;

public record MyFitResponse(
	Long id,
	List<MyFitEntryResponse> entries,
	LocalDateTime createdAt,
	LocalDateTime updatedAt
) {

	public static MyFitResponse from(MyFit myFit) {
		return new MyFitResponse(
			myFit.getId(),
			myFit.getEntries().stream()
				.map(MyFitEntryResponse::from)
				.toList(),
			myFit.getCreatedAt(),
			myFit.getUpdatedAt()
		);
	}
}
