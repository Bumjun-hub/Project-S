package com.projects.backend.product.entity;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.ForeignKey;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

@Entity
@Table(
	name = "product_sizes",
	uniqueConstraints = {
		@UniqueConstraint(name = "uk_product_sizes_product_label", columnNames = {"product_id", "label"})
	}
)
public class ProductSize {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(
		name = "product_id",
		nullable = false,
		foreignKey = @ForeignKey(name = "fk_product_sizes_product")
	)
	private Product product;

	@Column(nullable = false, length = 20)
	private String label;

	@Column(nullable = false)
	private int displayOrder;

	@OneToMany(mappedBy = "productSize", cascade = CascadeType.ALL, orphanRemoval = true)
	private List<ProductMeasurement> measurements = new ArrayList<>();

	protected ProductSize() {
	}

	private ProductSize(String label, int displayOrder, List<ProductMeasurement> measurements) {
		this.label = label;
		this.displayOrder = displayOrder;
		updateMeasurements(measurements);
	}

	public static ProductSize create(String label, int displayOrder, List<ProductMeasurement> measurements) {
		return new ProductSize(label, displayOrder, measurements);
	}

	void assignProduct(Product product) {
		this.product = product;
	}

	public void updateMeasurements(List<ProductMeasurement> measurements) {
		this.measurements.clear();
		if (measurements == null) {
			return;
		}

		for (ProductMeasurement measurement : measurements) {
			addMeasurement(measurement);
		}
	}

	private void addMeasurement(ProductMeasurement measurement) {
		measurement.assignProductSize(this);
		this.measurements.add(measurement);
	}

	public Long getId() {
		return id;
	}

	public Product getProduct() {
		return product;
	}

	public String getLabel() {
		return label;
	}

	public int getDisplayOrder() {
		return displayOrder;
	}

	public List<ProductMeasurement> getMeasurements() {
		return Collections.unmodifiableList(measurements);
	}
}
