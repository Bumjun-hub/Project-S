package com.projects.backend.bodyprofile.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Set;

import com.projects.backend.bodyprofile.entity.BodyFeature;
import com.projects.backend.bodyprofile.entity.BodyProfile;
import com.projects.backend.bodyprofile.entity.Gender;

public record BodyProfileResponse(
	Long id,
	BigDecimal height,
	BigDecimal weight,
	Gender gender,
	Set<BodyFeature> bodyFeatures,
	LocalDateTime createdAt,
	LocalDateTime updatedAt
) {

	public static BodyProfileResponse from(BodyProfile bodyProfile) {
		return new BodyProfileResponse(
			bodyProfile.getId(),
			bodyProfile.getHeight(),
			bodyProfile.getWeight(),
			bodyProfile.getGender(),
			Set.copyOf(bodyProfile.getBodyFeatures()),
			bodyProfile.getCreatedAt(),
			bodyProfile.getUpdatedAt()
		);
	}
}
