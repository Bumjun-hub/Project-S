package com.projects.backend.myfit.entity;

import java.math.BigDecimal;

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
	name = "my_fit_measurements",
	uniqueConstraints = {
		@UniqueConstraint(name = "uk_my_fit_measurements_entry_area", columnNames = {"entry_id", "area"})
	}
)
public class MyFitMeasurement {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(
		name = "entry_id",
		nullable = false,
		foreignKey = @ForeignKey(name = "fk_my_fit_measurements_entry")
	)
	private MyFitEntry entry;

	@Convert(converter = MeasurementAreaConverter.class)
	@Column(nullable = false, length = 30)
	private MeasurementArea area;

	@Column(nullable = false, precision = 7, scale = 2)
	private BigDecimal sizeCm;

	@Convert(converter = FitFeelingConverter.class)
	@Column(nullable = false, length = 20)
	private FitFeeling feeling;

	protected MyFitMeasurement() {
	}

	private MyFitMeasurement(MeasurementArea area, BigDecimal sizeCm, FitFeeling feeling) {
		this.area = area;
		this.sizeCm = sizeCm;
		this.feeling = feeling;
	}

	public static MyFitMeasurement create(MeasurementArea area, BigDecimal sizeCm, FitFeeling feeling) {
		return new MyFitMeasurement(area, sizeCm, feeling);
	}

	void assignEntry(MyFitEntry entry) {
		this.entry = entry;
	}

	public void update(BigDecimal sizeCm, FitFeeling feeling) {
		this.sizeCm = sizeCm;
		this.feeling = feeling;
	}

	public Long getId() {
		return id;
	}

	public MyFitEntry getEntry() {
		return entry;
	}

	public MeasurementArea getArea() {
		return area;
	}

	public BigDecimal getSizeCm() {
		return sizeCm;
	}

	public FitFeeling getFeeling() {
		return feeling;
	}
}
