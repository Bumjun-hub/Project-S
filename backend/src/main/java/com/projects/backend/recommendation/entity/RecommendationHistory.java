package com.projects.backend.recommendation.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.projects.backend.member.entity.Member;
import com.projects.backend.product.entity.Product;
import com.projects.backend.recommendation.calculator.RecommendationResult;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

@Entity
@Table(name = "recommendation_histories")
public class RecommendationHistory {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne(optional = false)
	private Member member;

	@ManyToOne(optional = false)
	private Product product;

	@Column(nullable = false, length = 20)
	private String recommendedSize;

	@Column(nullable = false)
	private int matchScore;

	@Column(nullable = false, precision = 10, scale = 4)
	private BigDecimal sizeScore;

	@Column(nullable = false, length = 500)
	private String reason;

	@Column(nullable = false, updatable = false)
	private LocalDateTime createdAt;

	protected RecommendationHistory() {
	}

	private RecommendationHistory(Member member, Product product, RecommendationResult result) {
		this.member = member;
		this.product = product;
		this.recommendedSize = result.recommendedSize();
		this.matchScore = result.matchScore();
		this.sizeScore = result.sizeScore();
		this.reason = result.reason();
	}

	public static RecommendationHistory create(Member member, Product product, RecommendationResult result) {
		return new RecommendationHistory(member, product, result);
	}

	@PrePersist
	void prePersist() {
		this.createdAt = LocalDateTime.now();
	}

	public Long getId() { return id; }
	public Product getProduct() { return product; }
	public String getRecommendedSize() { return recommendedSize; }
	public int getMatchScore() { return matchScore; }
	public BigDecimal getSizeScore() { return sizeScore; }
	public String getReason() { return reason; }
	public LocalDateTime getCreatedAt() { return createdAt; }
}
