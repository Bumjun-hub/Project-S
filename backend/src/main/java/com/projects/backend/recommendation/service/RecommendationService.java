package com.projects.backend.recommendation.service;

import java.util.List;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import com.projects.backend.common.response.PageResponse;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.projects.backend.common.exception.BusinessException;
import com.projects.backend.common.exception.ErrorCode;
import com.projects.backend.member.entity.Member;
import com.projects.backend.member.repository.MemberRepository;
import com.projects.backend.myfit.entity.FitCategory;
import com.projects.backend.myfit.entity.MyFit;
import com.projects.backend.myfit.entity.MyFitEntry;
import com.projects.backend.myfit.entity.MyFitMeasurement;
import com.projects.backend.myfit.repository.MyFitRepository;
import com.projects.backend.product.entity.Product;
import com.projects.backend.product.entity.ProductCategory;
import com.projects.backend.product.entity.ProductMeasurement;
import com.projects.backend.product.entity.ProductSize;
import com.projects.backend.product.repository.ProductRepository;
import com.projects.backend.recommendation.calculator.RecommendationCalculator;
import com.projects.backend.recommendation.calculator.RecommendationInput;
import com.projects.backend.recommendation.calculator.RecommendationInput.MyFitMeasurementInput;
import com.projects.backend.recommendation.calculator.RecommendationInput.ProductMeasurementInput;
import com.projects.backend.recommendation.calculator.RecommendationInput.ProductSizeInput;
import com.projects.backend.recommendation.calculator.RecommendationResult;
import com.projects.backend.recommendation.dto.RecommendationCreateRequest;
import com.projects.backend.recommendation.dto.RecommendationFeedbackRequest;
import com.projects.backend.recommendation.dto.RecommendationHistoryResponse;
import com.projects.backend.recommendation.dto.RecommendationResponse;
import com.projects.backend.recommendation.entity.RecommendationHistory;
import com.projects.backend.recommendation.repository.RecommendationHistoryRepository;

@Service
public class RecommendationService {

	private final MemberRepository memberRepository;
	private final MyFitRepository myFitRepository;
	private final ProductRepository productRepository;
	private final RecommendationCalculator recommendationCalculator;
	private final RecommendationHistoryRepository recommendationHistoryRepository;

	public RecommendationService(
		MemberRepository memberRepository,
		MyFitRepository myFitRepository,
		ProductRepository productRepository,
		RecommendationCalculator recommendationCalculator,
		RecommendationHistoryRepository recommendationHistoryRepository
	) {
		this.memberRepository = memberRepository;
		this.myFitRepository = myFitRepository;
		this.productRepository = productRepository;
		this.recommendationCalculator = recommendationCalculator;
		this.recommendationHistoryRepository = recommendationHistoryRepository;
	}

	@Transactional
	public RecommendationResponse recommend(String email, RecommendationCreateRequest request, String requestKey) {
        if (requestKey != null && !requestKey.matches("[A-Za-z0-9-]{1,64}")) {
            throw new BusinessException(ErrorCode.INVALID_INPUT);
        }
        Member member = memberRepository.findByEmailForUpdate(email)
            .orElseThrow(() -> new BusinessException(ErrorCode.UNAUTHORIZED));
        if (requestKey != null) {
            var previous = recommendationHistoryRepository.findByMemberAndRequestKey(member, requestKey);
            if (previous.isPresent()) {
                if (!previous.get().getProductCodeSnapshot().equals(request.productCode().trim())) {
                    throw new BusinessException(ErrorCode.INVALID_INPUT);
                }
                return RecommendationResponse.from(previous.get());
            }
        }
		MyFit myFit = findMyFitByMember(member);
		Product product = findProductByCode(request.productCode().trim());
		MyFitEntry myFitEntry = findMyFitEntry(myFit, mapToFitCategory(product.getCategory()));

		RecommendationInput input = toRecommendationInput(myFitEntry, product.getSizes());
		RecommendationResult result = recommendationCalculator.calculate(input);
        RecommendationHistory history = RecommendationHistory.create(member, product, result);
        history.assignRequestKey(requestKey);
        return RecommendationResponse.from(recommendationHistoryRepository.save(history));
	}

	@Transactional(readOnly = true)
	public List<RecommendationHistoryResponse> getHistory(String email) {
		Member member = findMemberByEmail(email);

		return recommendationHistoryRepository.findTop100ByMemberOrderByCreatedAtDescIdDesc(member).stream()
			.map(RecommendationHistoryResponse::from)
			.toList();
	}

    @Transactional(readOnly = true)
    public PageResponse<RecommendationHistoryResponse> getHistoryPage(String email, int page, int size) {
        if (page < 0 || size < 1 || size > 100) throw new BusinessException(ErrorCode.INVALID_INPUT);
        Member member = findMemberByEmail(email);
        return PageResponse.from(recommendationHistoryRepository.findByMember(member,
            PageRequest.of(page, size, Sort.by(Sort.Order.desc("createdAt"), Sort.Order.desc("id"))))
            .map(RecommendationHistoryResponse::from));
    }

	@Transactional
	public RecommendationHistoryResponse updateFeedback(
		String email,
		Long historyId,
		RecommendationFeedbackRequest request
	) {
		Member member = findMemberByEmail(email);
		RecommendationHistory history = recommendationHistoryRepository.findByIdAndMember(historyId, member)
			.orElseThrow(() -> new BusinessException(ErrorCode.RECOMMENDATION_HISTORY_NOT_FOUND));
		history.updateFeedback(request.feedback());

		return RecommendationHistoryResponse.from(history);
	}

	private Member findMemberByEmail(String email) {
		return memberRepository.findByEmail(email)
			.orElseThrow(() -> new BusinessException(ErrorCode.UNAUTHORIZED));
	}

	private MyFit findMyFitByMember(Member member) {
		return myFitRepository.findByMember(member)
			.orElseThrow(() -> new BusinessException(ErrorCode.MY_FIT_NOT_FOUND));
	}

	private Product findProductByCode(String productCode) {
		return productRepository.findByCode(productCode)
			.orElseThrow(() -> new BusinessException(ErrorCode.PRODUCT_NOT_FOUND));
	}

	private MyFitEntry findMyFitEntry(MyFit myFit, FitCategory category) {
		return myFit.getEntries().stream()
			.filter(entry -> entry.getCategory() == category)
			.findFirst()
			.orElseThrow(() -> new BusinessException(ErrorCode.RECOMMENDATION_NOT_AVAILABLE));
	}

	private FitCategory mapToFitCategory(ProductCategory category) {
		return switch (category) {
			case TOP, OUTER -> FitCategory.TOP;
			case BOTTOM -> FitCategory.BOTTOM;
		};
	}

	private RecommendationInput toRecommendationInput(MyFitEntry myFitEntry, List<ProductSize> productSizes) {
		return new RecommendationInput(
			myFitEntry.getMeasurements().stream()
				.map(this::toMyFitMeasurementInput)
				.toList(),
			productSizes.stream()
				.map(this::toProductSizeInput)
				.toList()
		);
	}

	private MyFitMeasurementInput toMyFitMeasurementInput(MyFitMeasurement measurement) {
		return new MyFitMeasurementInput(
			measurement.getArea(),
			measurement.getSizeCm(),
			measurement.getFeeling()
		);
	}

	private ProductSizeInput toProductSizeInput(ProductSize size) {
		return new ProductSizeInput(
			size.getLabel(),
			size.getDisplayOrder(),
			size.getMeasurements().stream()
				.map(this::toProductMeasurementInput)
				.toList()
		);
	}

	private ProductMeasurementInput toProductMeasurementInput(ProductMeasurement measurement) {
		return new ProductMeasurementInput(
			measurement.getArea(),
			measurement.getSizeCm()
		);
	}
}
