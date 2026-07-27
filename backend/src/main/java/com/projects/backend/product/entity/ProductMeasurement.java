package com.projects.backend.product.entity;

import java.math.BigDecimal;

import com.projects.backend.myfit.entity.MeasurementArea;
import com.projects.backend.myfit.entity.MeasurementAreaConverter;

import jakarta.persistence.Column;
import jakarta.persistence.Convert;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.ForeignKey;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

@Entity
@Table(
	name = "product_measurements",
	uniqueConstraints = {
		@UniqueConstraint(name = "uk_product_measurements_size_area", columnNames = {"product_size_id", "area"})
	}
)
public class ProductMeasurement {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(
		name = "product_size_id",
		nullable = false,
		foreignKey = @ForeignKey(name = "fk_product_measurements_size")
	)
	private ProductSize productSize;

	@Convert(converter = MeasurementAreaConverter.class)
	@Column(nullable = false, length = 30)
	private MeasurementArea area;

	@Column(nullable = false, precision = 7, scale = 2)
	private BigDecimal sizeCm;

	protected ProductMeasurement() {
	}

	private ProductMeasurement(MeasurementArea area, BigDecimal sizeCm) {
		this.area = area;
		this.sizeCm = sizeCm;
	}

	public static ProductMeasurement create(MeasurementArea area, BigDecimal sizeCm) {
		return new ProductMeasurement(area, sizeCm);
	}

	void assignProductSize(ProductSize productSize) {
		this.productSize = productSize;
	}

	public Long getId() {
		return id;
	}

	public ProductSize getProductSize() {
		return productSize;
	}

	public MeasurementArea getArea() {
		return area;
	}

	public BigDecimal getSizeCm() {
		return sizeCm;
	}
}
