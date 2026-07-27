package com.projects.backend.recommendation.calculator;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Comparator;
import java.util.EnumMap;
import java.util.EnumSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;

import org.springframework.stereotype.Component;

import com.projects.backend.common.exception.BusinessException;
import com.projects.backend.common.exception.ErrorCode;
import com.projects.backend.myfit.entity.FitFeeling;
import com.projects.backend.myfit.entity.MeasurementArea;
import com.projects.backend.recommendation.calculator.RecommendationInput.MyFitMeasurementInput;
import com.projects.backend.recommendation.calculator.RecommendationInput.ProductMeasurementInput;
import com.projects.backend.recommendation.calculator.RecommendationInput.ProductSizeInput;

@Component
public class RecommendationCalculator {

	private static final int SCORE_SCALE = 4;
	private static final int CM_SCALE = 2;
	private static final BigDecimal ONE_HUNDRED = new BigDecimal("100");
	private static final BigDecimal MATCH_SCORE_ERROR_MULTIPLIER = new BigDecimal("12");
	private static final BigDecimal DEFAULT_ADJUSTMENT_CM = new BigDecimal("1.00");
	private static final BigDecimal DEFAULT_AREA_WEIGHT = new BigDecimal("1.00");
	private static final Map<MeasurementArea, BigDecimal> ADJUSTMENT_BY_AREA = createAdjustmentMap();
	private static final Map<MeasurementArea, BigDecimal> WEIGHT_BY_AREA = createWeightMap();
	private static final Set<MeasurementArea> CORE_AREAS = EnumSet.of(
		MeasurementArea.CHEST_WIDTH,
		MeasurementArea.WAIST_WIDTH,
		MeasurementArea.SHOULDER_WIDTH,
		MeasurementArea.HIP_WIDTH
	);

	public RecommendationResult calculate(RecommendationInput input) {
		if (input == null || input.myFitMeasurements().isEmpty() || input.productSizes().isEmpty()) {
			throw new BusinessException(ErrorCode.RECOMMENDATION_NOT_AVAILABLE);
		}

		Map<MeasurementArea, MyFitMeasurementInput> myFitMeasurementByArea =
			toMyFitMeasurementMap(input.myFitMeasurements());
		if (myFitMeasurementByArea.isEmpty()) {
			throw new BusinessException(ErrorCode.RECOMMENDATION_NOT_AVAILABLE);
		}

		Set<MeasurementArea> requiredComparableAreas = findRequiredComparableAreas(
			input.productSizes(),
			myFitMeasurementByArea.keySet()
		);

		List<SizeCandidate> candidates = input.productSizes().stream()
			.map(size -> toCandidate(size, myFitMeasurementByArea, requiredComparableAreas))
			.filter(Objects::nonNull)
			.toList();

		if (candidates.isEmpty()) {
			throw new BusinessException(ErrorCode.RECOMMENDATION_NOT_AVAILABLE);
		}

		SizeCandidate best = candidates.stream()
			.min(candidateComparator())
			.orElseThrow(() -> new BusinessException(ErrorCode.RECOMMENDATION_NOT_AVAILABLE));

		int matchScore = calculateMatchScore(
			best.sizeScore(),
			best.comparisons().size(),
			myFitMeasurementByArea.size()
		);

		return new RecommendationResult(
			best.size().label(),
			best.sizeScore(),
			matchScore,
			"\uBD80\uC704\uBCC4 \uCC29\uC6A9\uAC10\uACFC \uC2E4\uCE21\uAC12\uC744 \uBC18\uC601\uD588\uC744 \uB54C "
				+ best.size().label()
				+ "\u0020\uC0AC\uC774\uC988\uAC00 \uAC00\uC7A5 \uC548\uC815\uC801\uC778 \uCC28\uC774\uB97C \uBCF4\uC785\uB2C8\uB2E4.",
			best.comparisons()
		);
	}

	private Map<MeasurementArea, MyFitMeasurementInput> toMyFitMeasurementMap(
		List<MyFitMeasurementInput> measurements
	) {
		Map<MeasurementArea, MyFitMeasurementInput> measurementByArea = new EnumMap<>(MeasurementArea.class);

		for (MyFitMeasurementInput measurement : measurements) {
			if (measurement.area() != null && measurement.sizeCm() != null && measurement.feeling() != null) {
				measurementByArea.putIfAbsent(measurement.area(), measurement);
			}
		}

		return measurementByArea;
	}

	private Set<MeasurementArea> findRequiredComparableAreas(
		List<ProductSizeInput> productSizes,
		Set<MeasurementArea> myFitAreas
	) {
		return productSizes.stream()
			.map(size -> comparableAreas(size, myFitAreas))
			.filter(areas -> !areas.isEmpty())
			.findFirst()
			.orElseThrow(() -> new BusinessException(ErrorCode.RECOMMENDATION_NOT_AVAILABLE));
	}

	private Set<MeasurementArea> comparableAreas(ProductSizeInput size, Set<MeasurementArea> myFitAreas) {
		Set<MeasurementArea> productAreas = EnumSet.noneOf(MeasurementArea.class);

		for (ProductMeasurementInput measurement : size.measurements()) {
			if (measurement.area() != null && measurement.sizeCm() != null) {
				productAreas.add(measurement.area());
			}
		}

		productAreas.retainAll(myFitAreas);
		return productAreas;
	}

	private SizeCandidate toCandidate(
		ProductSizeInput size,
		Map<MeasurementArea, MyFitMeasurementInput> myFitMeasurementByArea,
		Set<MeasurementArea> requiredComparableAreas
	) {
		Set<MeasurementArea> comparableAreas = comparableAreas(size, myFitMeasurementByArea.keySet());
		if (!comparableAreas.equals(requiredComparableAreas)) {
			return null;
		}

		Map<MeasurementArea, ProductMeasurementInput> productMeasurementByArea =
			toProductMeasurementMap(size.measurements());
		List<MeasurementComparisonResult> comparisons = requiredComparableAreas.stream()
			.sorted(Comparator.naturalOrder())
			.map(area -> compare(myFitMeasurementByArea.get(area), productMeasurementByArea.get(area)))
			.toList();

		BigDecimal score = calculateSizeScore(comparisons);
		BigDecimal coreWeightedError = calculateCoreWeightedError(comparisons);

		return new SizeCandidate(size, score, coreWeightedError, comparisons);
	}

	private Map<MeasurementArea, ProductMeasurementInput> toProductMeasurementMap(
		List<ProductMeasurementInput> measurements
	) {
		Map<MeasurementArea, ProductMeasurementInput> measurementByArea = new EnumMap<>(MeasurementArea.class);

		for (ProductMeasurementInput measurement : measurements) {
			if (measurement.area() != null && measurement.sizeCm() != null) {
				measurementByArea.putIfAbsent(measurement.area(), measurement);
			}
		}

		return measurementByArea;
	}

	private MeasurementComparisonResult compare(
		MyFitMeasurementInput myFitMeasurement,
		ProductMeasurementInput productMeasurement
	) {
		MeasurementArea area = myFitMeasurement.area();
		BigDecimal adjustmentCm = adjustmentFor(area, myFitMeasurement.feeling());
		BigDecimal targetSizeCm = myFitMeasurement.sizeCm().add(adjustmentCm).setScale(CM_SCALE, RoundingMode.HALF_UP);
		BigDecimal productSizeCm = productMeasurement.sizeCm().setScale(CM_SCALE, RoundingMode.HALF_UP);
		BigDecimal differenceCm = productSizeCm.subtract(targetSizeCm).setScale(CM_SCALE, RoundingMode.HALF_UP);
		BigDecimal absoluteDifferenceCm = differenceCm.abs().setScale(CM_SCALE, RoundingMode.HALF_UP);
		BigDecimal areaWeight = WEIGHT_BY_AREA.getOrDefault(area, DEFAULT_AREA_WEIGHT);
		BigDecimal weightedError = absoluteDifferenceCm.multiply(areaWeight).setScale(SCORE_SCALE, RoundingMode.HALF_UP);

		return new MeasurementComparisonResult(
			area,
			area.getLabel(),
			myFitMeasurement.sizeCm().setScale(CM_SCALE, RoundingMode.HALF_UP),
			myFitMeasurement.feeling(),
			adjustmentCm.setScale(CM_SCALE, RoundingMode.HALF_UP),
			targetSizeCm,
			productSizeCm,
			differenceCm,
			absoluteDifferenceCm,
			areaWeight,
			weightedError,
			createMessage(myFitMeasurement.feeling(), differenceCm, absoluteDifferenceCm)
		);
	}

	private BigDecimal adjustmentFor(MeasurementArea area, FitFeeling feeling) {
		BigDecimal baseAdjustment = ADJUSTMENT_BY_AREA.getOrDefault(area, DEFAULT_ADJUSTMENT_CM);

		return switch (feeling) {
			case SMALL -> baseAdjustment;
			case EXACT -> BigDecimal.ZERO;
			case LARGE -> baseAdjustment.negate();
		};
	}

	private BigDecimal calculateSizeScore(List<MeasurementComparisonResult> comparisons) {
		BigDecimal weightedErrorSum = comparisons.stream()
			.map(MeasurementComparisonResult::weightedError)
			.reduce(BigDecimal.ZERO, BigDecimal::add);
		BigDecimal weightSum = comparisons.stream()
			.map(MeasurementComparisonResult::areaWeight)
			.reduce(BigDecimal.ZERO, BigDecimal::add);

		if (weightSum.compareTo(BigDecimal.ZERO) == 0) {
			throw new BusinessException(ErrorCode.RECOMMENDATION_NOT_AVAILABLE);
		}

		return weightedErrorSum.divide(weightSum, SCORE_SCALE, RoundingMode.HALF_UP);
	}

	private BigDecimal calculateCoreWeightedError(List<MeasurementComparisonResult> comparisons) {
		return comparisons.stream()
			.filter(comparison -> CORE_AREAS.contains(comparison.area()))
			.map(MeasurementComparisonResult::weightedError)
			.reduce(BigDecimal.ZERO, BigDecimal::add)
			.setScale(SCORE_SCALE, RoundingMode.HALF_UP);
	}

	private Comparator<SizeCandidate> candidateComparator() {
		return Comparator
			.comparing(SizeCandidate::sizeScore)
			.thenComparing(SizeCandidate::coreWeightedError)
			.thenComparingInt(candidate -> candidate.size().displayOrder())
			.thenComparing(candidate -> candidate.size().label());
	}

	private int calculateMatchScore(BigDecimal sizeScore, int comparedAreaCount, int myFitAreaCount) {
		BigDecimal errorScore = ONE_HUNDRED.subtract(sizeScore.multiply(MATCH_SCORE_ERROR_MULTIPLIER));
		if (errorScore.compareTo(BigDecimal.ZERO) < 0) {
			errorScore = BigDecimal.ZERO;
		}

		BigDecimal coverageRatio = new BigDecimal(comparedAreaCount)
			.divide(new BigDecimal(myFitAreaCount), SCORE_SCALE, RoundingMode.HALF_UP);
		BigDecimal matchScore = errorScore.multiply(coverageRatio);

		return clamp(matchScore.setScale(0, RoundingMode.HALF_UP).intValue());
	}

	private int clamp(int score) {
		if (score < 0) {
			return 0;
		}
		if (score > 100) {
			return 100;
		}
		return score;
	}

	private String createMessage(
		FitFeeling feeling,
		BigDecimal differenceCm,
		BigDecimal absoluteDifferenceCm
	) {
		if (absoluteDifferenceCm.compareTo(new BigDecimal("0.50")) <= 0) {
			return switch (feeling) {
				case SMALL -> "\uAE30\uC874 \uC637\uC774 \uC791\uAC8C \uB290\uAEF4\uC84C\uACE0, \uC120\uD0DD\uD55C \uC0C1\uD488\uC740 \uBCF4\uC815 \uBAA9\uD45C\uC5D0 \uAC00\uAE4C\uC6CC \uB354 \uC5EC\uC720 \uC788\uB294 \uCC29\uC6A9\uC774 \uC608\uC0C1\uB429\uB2C8\uB2E4.";
				case EXACT -> "\uAE30\uC900 \uC637\uACFC \uAC70\uC758 \uB3D9\uC77C\uD55C \uC2E4\uCE21\uC785\uB2C8\uB2E4.";
				case LARGE -> "\uAE30\uC874 \uC637\uC774 \uD06C\uAC8C \uB290\uAEF4\uC84C\uC73C\uBA70, \uC120\uD0DD\uD55C \uC0C1\uD488\uC740 \uB354 \uC791\uC740 \uC2E4\uCE21\uC73C\uB85C \uCC29\uC6A9\uAC10 \uAC1C\uC120\uC774 \uC608\uC0C1\uB429\uB2C8\uB2E4.";
			};
		}

		if (differenceCm.compareTo(BigDecimal.ZERO) > 0) {
			return "\uBAA9\uD45C \uC2E4\uCE21\uBCF4\uB2E4 \uC0C1\uD488\uC774 \uB2E4\uC18C \uD06C\uAC8C \uCE21\uC815\uB418\uC5C8\uC2B5\uB2C8\uB2E4.";
		}

		return "\uBAA9\uD45C \uC2E4\uCE21\uBCF4\uB2E4 \uC0C1\uD488\uC774 \uB2E4\uC18C \uC791\uAC8C \uCE21\uC815\uB418\uC5C8\uC2B5\uB2C8\uB2E4.";
	}

	private static Map<MeasurementArea, BigDecimal> createAdjustmentMap() {
		Map<MeasurementArea, BigDecimal> adjustments = new EnumMap<>(MeasurementArea.class);
		adjustments.put(MeasurementArea.CHEST_WIDTH, new BigDecimal("1.50"));
		adjustments.put(MeasurementArea.WAIST_WIDTH, new BigDecimal("1.50"));
		adjustments.put(MeasurementArea.HIP_WIDTH, new BigDecimal("1.50"));
		adjustments.put(MeasurementArea.SHOULDER_WIDTH, new BigDecimal("1.00"));
		adjustments.put(MeasurementArea.TOTAL_LENGTH, new BigDecimal("2.00"));
		adjustments.put(MeasurementArea.SLEEVE_LENGTH, new BigDecimal("2.00"));
		adjustments.put(MeasurementArea.THIGH_WIDTH, new BigDecimal("1.00"));
		adjustments.put(MeasurementArea.RISE, new BigDecimal("1.00"));
		adjustments.put(MeasurementArea.HEM_WIDTH, new BigDecimal("1.00"));
		return Map.copyOf(adjustments);
	}

	private static Map<MeasurementArea, BigDecimal> createWeightMap() {
		Map<MeasurementArea, BigDecimal> weights = new EnumMap<>(MeasurementArea.class);
		weights.put(MeasurementArea.CHEST_WIDTH, new BigDecimal("1.40"));
		weights.put(MeasurementArea.WAIST_WIDTH, new BigDecimal("1.40"));
		weights.put(MeasurementArea.SHOULDER_WIDTH, new BigDecimal("1.20"));
		weights.put(MeasurementArea.HIP_WIDTH, new BigDecimal("1.20"));
		weights.put(MeasurementArea.TOTAL_LENGTH, new BigDecimal("0.80"));
		weights.put(MeasurementArea.SLEEVE_LENGTH, new BigDecimal("0.80"));
		weights.put(MeasurementArea.THIGH_WIDTH, new BigDecimal("0.80"));
		weights.put(MeasurementArea.RISE, new BigDecimal("0.70"));
		weights.put(MeasurementArea.HEM_WIDTH, new BigDecimal("0.70"));
		return Map.copyOf(weights);
	}

	private record SizeCandidate(
		ProductSizeInput size,
		BigDecimal sizeScore,
		BigDecimal coreWeightedError,
		List<MeasurementComparisonResult> comparisons
	) {
	}
}
