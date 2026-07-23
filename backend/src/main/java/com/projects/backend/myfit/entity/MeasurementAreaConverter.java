package com.projects.backend.myfit.entity;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter
public class MeasurementAreaConverter implements AttributeConverter<MeasurementArea, String> {

	@Override
	public String convertToDatabaseColumn(MeasurementArea attribute) {
		if (attribute == null) {
			return null;
		}

		return attribute.getLabel();
	}

	@Override
	public MeasurementArea convertToEntityAttribute(String dbData) {
		if (dbData == null) {
			return null;
		}

		return MeasurementArea.fromLabel(dbData);
	}
}
