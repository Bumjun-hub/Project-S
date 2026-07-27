package com.projects.backend.recommendation.calculator;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

import org.junit.jupiter.api.Test;

import com.projects.backend.common.exception.BusinessException;
import com.projects.backend.common.exception.ErrorCode;
import com.projects.backend.myfit.entity.FitFeeling;
import com.projects.backend.myfit.entity.MeasurementArea;
import com.projects.backend.recommendation.calculator.RecommendationInput.MyFitMeasurementInput;
import com.projects.backend.recommendation.calculator.RecommendationInput.ProductMeasurementInput;
import com.projects.backend.recommendation.calculator.RecommendationInput.ProductSizeInput;

class RecommendationCalculatorTest {

	private final RecommendationCalculator calculator = new RecommendationCalculator();

	@Test
	void exact_feeling_recommends_nearest_size() {
		RecommendationInput input = input(
			List.of(myFit(MeasurementArea.CHEST_WIDTH, "50.00", FitFeeling.EXACT)),
			List.of(
				size("S", 1, product(MeasurementArea.CHEST_WIDTH, "48.00")),
				size("M", 2, product(MeasurementArea.CHEST_WIDTH, "50.00")),
				size("L", 3, product(MeasurementArea.CHEST_WIDTH, "54.00"))
			)
		);

		RecommendationResult result = calculator.calculate(input);

		assertThat(result.recommendedSize()).isEqualTo("M");
		assertThat(result.comparisons().get(0).differenceCm()).isEqualByComparingTo("0.00");
	}

	@Test
	void small_feeling_recommends_larger_adjusted_size() {
		RecommendationInput input = input(
			List.of(myFit(MeasurementArea.CHEST_WIDTH, "50.00", FitFeeling.SMALL)),
			List.of(
				size("M", 1, product(MeasurementArea.CHEST_WIDTH, "50.00")),
				size("L", 2, product(MeasurementArea.CHEST_WIDTH, "52.00"))
			)
		);

		RecommendationResult result = calculator.calculate(input);

		assertThat(result.recommendedSize()).isEqualTo("L");
		assertThat(result.comparisons().get(0).adjustmentCm()).isEqualByComparingTo("1.50");
		assertThat(result.comparisons().get(0).targetSizeCm()).isEqualByComparingTo("51.50");
	}

	@Test
	void large_feeling_recommends_smaller_adjusted_size() {
		RecommendationInput input = input(
			List.of(myFit(MeasurementArea.CHEST_WIDTH, "50.00", FitFeeling.LARGE)),
			List.of(
				size("S", 1, product(MeasurementArea.CHEST_WIDTH, "48.50")),
				size("M", 2, product(MeasurementArea.CHEST_WIDTH, "50.00"))
			)
		);

		RecommendationResult result = calculator.calculate(input);

		assertThat(result.recommendedSize()).isEqualTo("S");
		assertThat(result.comparisons().get(0).adjustmentCm()).isEqualByComparingTo("-1.50");
		assertThat(result.comparisons().get(0).targetSizeCm()).isEqualByComparingTo("48.50");
	}

	@Test
	void area_weights_affect_recommended_size() {
		RecommendationInput input = input(
			List.of(
				myFit(MeasurementArea.CHEST_WIDTH, "50.00", FitFeeling.EXACT),
				myFit(MeasurementArea.HEM_WIDTH, "30.00", FitFeeling.EXACT)
			),
			List.of(
				size(
					"A",
					1,
					product(MeasurementArea.CHEST_WIDTH, "52.00"),
					product(MeasurementArea.HEM_WIDTH, "30.00")
				),
				size(
					"B",
					2,
					product(MeasurementArea.CHEST_WIDTH, "50.00"),
					product(MeasurementArea.HEM_WIDTH, "33.00")
				)
			)
		);

		RecommendationResult result = calculator.calculate(input);

		assertThat(result.recommendedSize()).isEqualTo("B");
	}

	@Test
	void fail_when_no_common_measurement_area_exists() {
		RecommendationInput input = input(
			List.of(myFit(MeasurementArea.CHEST_WIDTH, "50.00", FitFeeling.EXACT)),
			List.of(size("M", 1, product(MeasurementArea.WAIST_WIDTH, "40.00")))
		);

		assertThatThrownBy(() -> calculator.calculate(input))
			.isInstanceOfSatisfying(BusinessException.class, exception ->
				assertThat(exception.getErrorCode()).isEqualTo(ErrorCode.RECOMMENDATION_NOT_AVAILABLE)
			);
	}

	@Test
	void size_with_missing_comparable_area_is_excluded() {
		RecommendationInput input = input(
			List.of(
				myFit(MeasurementArea.CHEST_WIDTH, "50.00", FitFeeling.EXACT),
				myFit(MeasurementArea.SHOULDER_WIDTH, "45.00", FitFeeling.EXACT)
			),
			List.of(
				size(
					"FULL",
					1,
					product(MeasurementArea.CHEST_WIDTH, "54.00"),
					product(MeasurementArea.SHOULDER_WIDTH, "49.00")
				),
				size("MISSING", 2, product(MeasurementArea.CHEST_WIDTH, "50.00"))
			)
		);

		RecommendationResult result = calculator.calculate(input);

		assertThat(result.recommendedSize()).isEqualTo("FULL");
		assertThat(result.comparisons()).hasSize(2);
	}

	@Test
	void tie_uses_core_area_error_before_display_order() {
		RecommendationInput input = input(
			List.of(
				myFit(MeasurementArea.CHEST_WIDTH, "50.00", FitFeeling.EXACT),
				myFit(MeasurementArea.TOTAL_LENGTH, "70.00", FitFeeling.EXACT)
			),
			List.of(
				size(
					"A",
					1,
					product(MeasurementArea.CHEST_WIDTH, "51.00"),
					product(MeasurementArea.TOTAL_LENGTH, "70.00")
				),
				size(
					"B",
					2,
					product(MeasurementArea.CHEST_WIDTH, "50.00"),
					product(MeasurementArea.TOTAL_LENGTH, "71.75")
				)
			)
		);

		RecommendationResult result = calculator.calculate(input);

		assertThat(result.recommendedSize()).isEqualTo("B");
	}

	@Test
	void tie_uses_display_order_and_label() {
		RecommendationInput input = input(
			List.of(myFit(MeasurementArea.CHEST_WIDTH, "50.00", FitFeeling.EXACT)),
			List.of(
				size("B", 2, product(MeasurementArea.CHEST_WIDTH, "51.00")),
				size("A", 2, product(MeasurementArea.CHEST_WIDTH, "51.00")),
				size("C", 1, product(MeasurementArea.CHEST_WIDTH, "51.00"))
			)
		);

		RecommendationResult result = calculator.calculate(input);

		assertThat(result.recommendedSize()).isEqualTo("C");
	}

	@Test
	void match_score_is_clamped_between_zero_and_one_hundred() {
		RecommendationInput perfectInput = input(
			List.of(myFit(MeasurementArea.CHEST_WIDTH, "50.00", FitFeeling.EXACT)),
			List.of(size("M", 1, product(MeasurementArea.CHEST_WIDTH, "50.00")))
		);
		RecommendationInput badInput = input(
			List.of(myFit(MeasurementArea.CHEST_WIDTH, "50.00", FitFeeling.EXACT)),
			List.of(size("M", 1, product(MeasurementArea.CHEST_WIDTH, "100.00")))
		);

		assertThat(calculator.calculate(perfectInput).matchScore()).isBetween(0, 100);
		assertThat(calculator.calculate(badInput).matchScore()).isBetween(0, 100);
		assertThat(calculator.calculate(perfectInput).matchScore()).isEqualTo(100);
		assertThat(calculator.calculate(badInput).matchScore()).isEqualTo(0);
	}

	@Test
	void difference_cm_keeps_positive_and_negative_direction() {
		RecommendationInput input = input(
			List.of(
				myFit(MeasurementArea.CHEST_WIDTH, "50.00", FitFeeling.EXACT),
				myFit(MeasurementArea.SHOULDER_WIDTH, "45.00", FitFeeling.EXACT)
			),
			List.of(size(
				"M",
				1,
				product(MeasurementArea.CHEST_WIDTH, "52.00"),
				product(MeasurementArea.SHOULDER_WIDTH, "44.00")
			))
		);

		RecommendationResult result = calculator.calculate(input);

		assertThat(findComparison(result, MeasurementArea.CHEST_WIDTH).differenceCm()).isPositive();
		assertThat(findComparison(result, MeasurementArea.SHOULDER_WIDTH).differenceCm()).isNegative();
	}

	@Test
	void calculator_does_not_mutate_input_lists_or_domain_values() {
		List<MyFitMeasurementInput> myFits = new ArrayList<>();
		myFits.add(myFit(MeasurementArea.CHEST_WIDTH, "50.00", FitFeeling.EXACT));
		List<ProductMeasurementInput> productMeasurements = new ArrayList<>();
		productMeasurements.add(product(MeasurementArea.CHEST_WIDTH, "50.00"));
		List<ProductSizeInput> productSizes = new ArrayList<>();
		productSizes.add(new ProductSizeInput("M", 1, productMeasurements));
		RecommendationInput input = input(myFits, productSizes);

		calculator.calculate(input);

		assertThat(myFits).hasSize(1);
		assertThat(productMeasurements).hasSize(1);
		assertThat(productSizes).hasSize(1);
		assertThat(input.myFitMeasurements()).hasSize(1);
		assertThat(input.productSizes()).hasSize(1);
		assertThat(input.productSizes().get(0).measurements()).hasSize(1);
	}

	private MeasurementComparisonResult findComparison(RecommendationResult result, MeasurementArea area) {
		return result.comparisons().stream()
			.filter(comparison -> comparison.area() == area)
			.findFirst()
			.orElseThrow();
	}

	private RecommendationInput input(
		List<MyFitMeasurementInput> myFitMeasurements,
		List<ProductSizeInput> productSizes
	) {
		return new RecommendationInput(myFitMeasurements, productSizes);
	}

	private MyFitMeasurementInput myFit(MeasurementArea area, String sizeCm, FitFeeling feeling) {
		return new MyFitMeasurementInput(area, new BigDecimal(sizeCm), feeling);
	}

	private ProductSizeInput size(String label, int displayOrder, ProductMeasurementInput... measurements) {
		return new ProductSizeInput(label, displayOrder, List.of(measurements));
	}

	private ProductMeasurementInput product(MeasurementArea area, String sizeCm) {
		return new ProductMeasurementInput(area, new BigDecimal(sizeCm));
	}
}
