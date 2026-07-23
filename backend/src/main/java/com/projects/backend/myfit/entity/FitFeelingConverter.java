package com.projects.backend.myfit.entity;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter
public class FitFeelingConverter implements AttributeConverter<FitFeeling, String> {

	@Override
	public String convertToDatabaseColumn(FitFeeling attribute) {
		if (attribute == null) {
			return null;
		}

		return attribute.getLabel();
	}

	@Override
	public FitFeeling convertToEntityAttribute(String dbData) {
		if (dbData == null) {
			return null;
		}

		return FitFeeling.fromLabel(dbData);
	}
}
