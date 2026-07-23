package com.projects.backend.bodyprofile.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.HashSet;
import java.util.Set;

import com.projects.backend.member.entity.Member;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.Convert;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.ForeignKey;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

@Entity
@Table(
	name = "body_profiles",
	uniqueConstraints = {
		@UniqueConstraint(name = "uk_body_profiles_member_id", columnNames = "member_id")
	}
)
public class BodyProfile {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@OneToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(
		name = "member_id",
		nullable = false,
		foreignKey = @ForeignKey(name = "fk_body_profiles_member")
	)
	private Member member;

	@Column(nullable = false, precision = 5, scale = 1)
	private BigDecimal height;

	@Column(nullable = false, precision = 5, scale = 1)
	private BigDecimal weight;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false)
	private Gender gender;

	@ElementCollection(fetch = FetchType.LAZY)
	@CollectionTable(
		name = "body_profile_features",
		joinColumns = @JoinColumn(
			name = "body_profile_id",
			foreignKey = @ForeignKey(name = "fk_body_profile_features_profile")
		),
		uniqueConstraints = {
			@UniqueConstraint(
				name = "uk_body_profile_features_profile_feature",
				columnNames = {"body_profile_id", "feature"}
			)
		}
	)
	@Column(name = "feature", nullable = false, length = 50)
	@Convert(converter = BodyFeatureConverter.class)
	private Set<BodyFeature> bodyFeatures = new HashSet<>();

	@Column(nullable = false, updatable = false)
	private LocalDateTime createdAt;

	@Column(nullable = false)
	private LocalDateTime updatedAt;

	protected BodyProfile() {
	}

	private BodyProfile(
		Member member,
		BigDecimal height,
		BigDecimal weight,
		Gender gender,
		Set<BodyFeature> bodyFeatures
	) {
		this.member = member;
		this.height = height;
		this.weight = weight;
		this.gender = gender;
		this.bodyFeatures = copyBodyFeatures(bodyFeatures);
	}

	public static BodyProfile create(
		Member member,
		BigDecimal height,
		BigDecimal weight,
		Gender gender,
		Set<BodyFeature> bodyFeatures
	) {
		return new BodyProfile(
			member,
			height,
			weight,
			gender,
			bodyFeatures
		);
	}

	private static Set<BodyFeature> copyBodyFeatures(Set<BodyFeature> bodyFeatures) {
		if (bodyFeatures == null) {
			return new HashSet<>();
		}

		return new HashSet<>(bodyFeatures);
	}

	public void updateHeight(BigDecimal height) {
		this.height = height;
	}

	public void updateWeight(BigDecimal weight) {
		this.weight = weight;
	}

	public void updateGender(Gender gender) {
		this.gender = gender;
	}

	public void updateBodyFeatures(Set<BodyFeature> bodyFeatures) {
		this.bodyFeatures = copyBodyFeatures(bodyFeatures);
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

	public Member getMember() {
		return member;
	}

	public BigDecimal getHeight() {
		return height;
	}

	public BigDecimal getWeight() {
		return weight;
	}

	public Gender getGender() {
		return gender;
	}

	public Set<BodyFeature> getBodyFeatures() {
		return Collections.unmodifiableSet(bodyFeatures);
	}

	public LocalDateTime getCreatedAt() {
		return createdAt;
	}

	public LocalDateTime getUpdatedAt() {
		return updatedAt;
	}
}
