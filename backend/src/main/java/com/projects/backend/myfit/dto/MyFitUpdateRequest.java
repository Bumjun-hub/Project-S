package com.projects.backend.myfit.dto;

import java.util.List;

import jakarta.validation.Valid;

public record MyFitUpdateRequest(
	@Valid
	List<MyFitEntryRequest> entries
) {

	public MyFitUpdateRequest {
		if (entries != null) {
			entries = List.copyOf(entries);
		}
	}

	public boolean isEmpty() {
		return entries == null;
	}
}
