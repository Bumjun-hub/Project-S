package com.projects.backend.recommendation.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import com.projects.backend.recommendation.dto.MeasurementComparisonResponse;
import jakarta.persistence.Convert;
import jakarta.persistence.FetchType;
import jakarta.persistence.Index;
import jakarta.persistence.UniqueConstraint;

import com.projects.backend.member.entity.Member;
import com.projects.backend.product.entity.Product;
import com.projects.backend.recommendation.calculator.RecommendationResult;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

@Entity
@Table(name = "recommendation_histories",
    indexes = @Index(name = "idx_history_member_created", columnList = "member_id,created_at,id"),
    uniqueConstraints = @UniqueConstraint(name = "uk_history_member_request", columnNames = {"member_id", "request_key"}))
public class RecommendationHistory {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	private Member member;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	private Product product;

    @Column(length = 64)
    private String requestKey;
    @Column(length = 50)
    private String productCodeSnapshot;
    @Column(length = 100)
    private String productNameSnapshot;
    @Column(length = 60)
    private String brandSnapshot;
    @Column(length = 30)
    private String calculatorVersion;
    @Convert(converter = ComparisonSnapshotConverter.class)
    @Column(columnDefinition = "text")
    private List<MeasurementComparisonResponse> comparisons;

	@Column(nullable = false, length = 20)
	private String recommendedSize;

	@Column(nullable = false)
	private int matchScore;

	@Column(nullable = false, precision = 10, scale = 4)
	private BigDecimal sizeScore;

	@Column(nullable = false, length = 500)
	private String reason;

	@Enumerated(EnumType.STRING)
	@Column(length = 10)
	private FitFeedback feedback;

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
        this.productCodeSnapshot = product.getCode();
        this.productNameSnapshot = product.getName();
        this.brandSnapshot = product.getBrand();
        this.calculatorVersion = "measurements-v1";
        this.comparisons = result.comparisons().stream().map(MeasurementComparisonResponse::from).toList();
	}

	public static RecommendationHistory create(Member member, Product product, RecommendationResult result) {
		return new RecommendationHistory(member, product, result);
	}

	public void updateFeedback(FitFeedback feedback) {
		this.feedback = feedback;
	}

    public void assignRequestKey(String requestKey) { this.requestKey = requestKey; }
    public String getProductCodeSnapshot() { return productCodeSnapshot == null ? product.getCode() : productCodeSnapshot; }
    public String getProductNameSnapshot() { return productNameSnapshot == null ? product.getName() : productNameSnapshot; }
    public String getBrandSnapshot() { return brandSnapshot == null ? product.getBrand() : brandSnapshot; }
    public String getCalculatorVersion() { return calculatorVersion; }
    public List<MeasurementComparisonResponse> getComparisons() { return comparisons == null ? List.of() : List.copyOf(comparisons); }

	@PrePersist
	void prePersist() {
        // PostgreSQL/H2 timestamp columns persist microseconds, not nanoseconds.
        // Keep initial and replayed responses identical.
		this.createdAt = LocalDateTime.now().truncatedTo(java.time.temporal.ChronoUnit.MICROS);
	}

	public Long getId() { return id; }
	public Product getProduct() { return product; }
	public String getRecommendedSize() { return recommendedSize; }
	public int getMatchScore() { return matchScore; }
	public BigDecimal getSizeScore() { return sizeScore; }
	public String getReason() { return reason; }
	public FitFeedback getFeedback() { return feedback; }
	public LocalDateTime getCreatedAt() { return createdAt; }
}
