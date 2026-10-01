package com.projects.backend.recommendation.entity;

import java.util.List;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.projects.backend.recommendation.dto.MeasurementComparisonResponse;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

/** Preserve the measurements used at analysis time, independently of later edits. */
@Converter
public class ComparisonSnapshotConverter implements AttributeConverter<List<MeasurementComparisonResponse>, String> {
    private static final ObjectMapper MAPPER = new ObjectMapper();

    @Override
    public String convertToDatabaseColumn(List<MeasurementComparisonResponse> value) {
        try { return MAPPER.writeValueAsString(value == null ? List.of() : value); }
        catch (Exception error) { throw new IllegalStateException("Cannot serialize recommendation snapshot", error); }
    }

    @Override
    public List<MeasurementComparisonResponse> convertToEntityAttribute(String value) {
        if (value == null || value.isBlank()) return List.of();
        try { return MAPPER.readValue(value, new TypeReference<List<MeasurementComparisonResponse>>() {}); }
        catch (Exception error) { throw new IllegalStateException("Cannot read recommendation snapshot", error); }
    }
}
