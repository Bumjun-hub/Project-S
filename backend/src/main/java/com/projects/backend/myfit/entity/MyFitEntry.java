package com.projects.backend.myfit.entity;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

import jakarta.persistence.CascadeType;
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
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

@Entity
@Table(
	name = "my_fit_entries",
	uniqueConstraints = {
		@UniqueConstraint(name = "uk_my_fit_entries_fit_category", columnNames = {"my_fit_id", "category"})
	}
)
public class MyFitEntry {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(
		name = "my_fit_id",
		nullable = false,
		foreignKey = @ForeignKey(name = "fk_my_fit_entries_fit")
	)
	private MyFit myFit;

	@Convert(converter = FitCategoryConverter.class)
	@Column(nullable = false, length = 20)
	private FitCategory category;

	@Column(nullable = false, length = 100)
	private String garmentLabel;

	@OneToMany(mappedBy = "entry", cascade = CascadeType.ALL, orphanRemoval = true)
	private List<MyFitMeasurement> measurements = new ArrayList<>();

	protected MyFitEntry() {
	}

	private MyFitEntry(FitCategory category, String garmentLabel, List<MyFitMeasurement> measurements) {
		this.category = category;
		this.garmentLabel = garmentLabel;
		updateMeasurements(measurements);
	}

	public static MyFitEntry create(
		FitCategory category,
		String garmentLabel,
		List<MyFitMeasurement> measurements
	) {
		return new MyFitEntry(category, garmentLabel, measurements);
	}

	void assignMyFit(MyFit myFit) {
		this.myFit = myFit;
	}

	public void updateMeasurements(List<MyFitMeasurement> measurements) {
		this.measurements.clear();
		if (measurements == null) {
			return;
		}

		for (MyFitMeasurement measurement : measurements) {
			addMeasurement(measurement);
		}
	}

	private void addMeasurement(MyFitMeasurement measurement) {
		measurement.assignEntry(this);
		this.measurements.add(measurement);
	}

	public Long getId() {
		return id;
	}

	public MyFit getMyFit() {
		return myFit;
	}

	public FitCategory getCategory() {
		return category;
	}

	public String getGarmentLabel() {
		return garmentLabel;
	}

	public List<MyFitMeasurement> getMeasurements() {
		return Collections.unmodifiableList(measurements);
	}
}
