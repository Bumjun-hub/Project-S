package com.projects.backend.myfit.entity;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter
public class FitCategoryConverter implements AttributeConverter<FitCategory, String> {

	@Override
	public String convertToDatabaseColumn(FitCategory attribute) {
		if (attribute == null) {
			return null;
		}

		return attribute.getLabel();
	}

	@Override
	public FitCategory convertToEntityAttribute(String dbData) {
		if (dbData == null) {
			return null;
		}

		return FitCategory.fromLabel(dbData);
	}
}
