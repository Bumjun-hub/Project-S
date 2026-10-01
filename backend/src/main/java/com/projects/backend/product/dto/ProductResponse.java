package com.projects.backend.product.dto;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;

import com.projects.backend.product.entity.Product;
import com.projects.backend.product.entity.ProductSize;

public record ProductResponse(
	String id,
	String name,
	String brand,
	String category,
	int priceKrw,
	String description,
	List<ProductSizeResponse> sizes,
	LocalDateTime createdAt,
	LocalDateTime updatedAt
) {
    public static ProductResponse summary(Product product) {
        return new ProductResponse(product.getCode(), product.getName(), product.getBrand(),
            product.getCategory().getLabel(), product.getPriceKrw(), product.getDescription(),
            List.of(), product.getCreatedAt(), product.getUpdatedAt());
    }

	public static ProductResponse from(Product product) {
		return new ProductResponse(
			product.getCode(),
			product.getName(),
			product.getBrand(),
			product.getCategory().getLabel(),
			product.getPriceKrw(),
			product.getDescription(),
			product.getSizes().stream()
				.sorted(Comparator.comparingInt(ProductSize::getDisplayOrder))
				.map(ProductSizeResponse::from)
				.toList(),
			product.getCreatedAt(),
			product.getUpdatedAt()
		);
	}
}
