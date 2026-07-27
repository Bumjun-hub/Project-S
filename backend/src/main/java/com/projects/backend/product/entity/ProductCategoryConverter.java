package com.projects.backend.product.entity;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter
public class ProductCategoryConverter implements AttributeConverter<ProductCategory, String> {

	@Override
	public String convertToDatabaseColumn(ProductCategory attribute) {
		if (attribute == null) {
			return null;
		}

		return attribute.getLabel();
	}

	@Override
	public ProductCategory convertToEntityAttribute(String dbData) {
		if (dbData == null) {
			return null;
		}

		return ProductCategory.fromLabel(dbData);
	}
}
