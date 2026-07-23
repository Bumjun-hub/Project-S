package com.projects.backend.bodyprofile.entity;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter
public class BodyFeatureConverter implements AttributeConverter<BodyFeature, String> {

	@Override
	public String convertToDatabaseColumn(BodyFeature attribute) {
		if (attribute == null) {
			return null;
		}

		return attribute.getLabel();
	}

	@Override
	public BodyFeature convertToEntityAttribute(String dbData) {
		if (dbData == null) {
			return null;
		}

		return BodyFeature.fromLabel(dbData);
	}
}
