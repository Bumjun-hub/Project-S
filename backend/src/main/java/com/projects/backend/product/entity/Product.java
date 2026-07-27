package com.projects.backend.product.entity;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Convert;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

@Entity
@Table(
	name = "products",
	uniqueConstraints = {
		@UniqueConstraint(name = "uk_products_code", columnNames = "code")
	}
)
public class Product {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(nullable = false, length = 50)
	private String code;

	@Column(nullable = false, length = 100)
	private String name;

	@Column(nullable = false, length = 60)
	private String brand;

	@Convert(converter = ProductCategoryConverter.class)
	@Column(nullable = false, length = 20)
	private ProductCategory category;

	@Column(nullable = false)
	private int priceKrw;

	@Column(nullable = false, length = 500)
	private String description;

	@OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true)
	private List<ProductSize> sizes = new ArrayList<>();

	@Column(nullable = false, updatable = false)
	private LocalDateTime createdAt;

	@Column(nullable = false)
	private LocalDateTime updatedAt;

	protected Product() {
	}

	private Product(
		String code,
		String name,
		String brand,
		ProductCategory category,
		int priceKrw,
		String description,
		List<ProductSize> sizes
	) {
		this.code = code;
		this.name = name;
		this.brand = brand;
		this.category = category;
		this.priceKrw = priceKrw;
		this.description = description;
		updateSizes(sizes);
	}

	public static Product create(
		String code,
		String name,
		String brand,
		ProductCategory category,
		int priceKrw,
		String description,
		List<ProductSize> sizes
	) {
		return new Product(code, name, brand, category, priceKrw, description, sizes);
	}

	public void updateSizes(List<ProductSize> sizes) {
		this.sizes.clear();
		if (sizes == null) {
			return;
		}

		for (ProductSize size : sizes) {
			addSize(size);
		}
	}

	private void addSize(ProductSize size) {
		size.assignProduct(this);
		this.sizes.add(size);
	}

	@PrePersist
	void prePersist() {
		LocalDateTime now = LocalDateTime.now();
		this.createdAt = now;
		this.updatedAt = now;
	}

	@PreUpdate
	void preUpdate() {
		this.updatedAt = LocalDateTime.now();
	}

	public Long getId() {
		return id;
	}

	public String getCode() {
		return code;
	}

	public String getName() {
		return name;
	}

	public String getBrand() {
		return brand;
	}

	public ProductCategory getCategory() {
		return category;
	}

	public int getPriceKrw() {
		return priceKrw;
	}

	public String getDescription() {
		return description;
	}

	public List<ProductSize> getSizes() {
		return Collections.unmodifiableList(sizes);
	}

	public LocalDateTime getCreatedAt() {
		return createdAt;
	}

	public LocalDateTime getUpdatedAt() {
		return updatedAt;
	}
}
