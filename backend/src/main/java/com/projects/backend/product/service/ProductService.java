package com.projects.backend.product.service;

import java.util.List;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import com.projects.backend.common.response.PageResponse;
import com.projects.backend.product.entity.ProductCategory;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.projects.backend.common.exception.BusinessException;
import com.projects.backend.common.exception.ErrorCode;
import com.projects.backend.product.dto.ProductResponse;
import com.projects.backend.product.entity.Product;
import com.projects.backend.product.repository.ProductRepository;

@Service
public class ProductService {

	private final ProductRepository productRepository;

	public ProductService(ProductRepository productRepository) {
		this.productRepository = productRepository;
	}

	@Transactional(readOnly = true)
	public List<ProductResponse> getProducts() {
		return productRepository.findAll(PageRequest.of(0, 100, Sort.by("id"))).stream()
			.map(ProductResponse::from)
			.toList();
	}

    @Transactional(readOnly = true)
    public PageResponse<ProductResponse> getProductPage(int page, int size, String category, String search) {
        if (page < 0 || size < 1 || size > 100 || search.length() > 100) {
            throw new BusinessException(ErrorCode.INVALID_INPUT);
        }
        ProductCategory filter = switch (category) {
            case "all" -> null;
            case "상의", "TOP" -> ProductCategory.TOP;
            case "하의", "BOTTOM" -> ProductCategory.BOTTOM;
            case "아우터", "OUTER" -> ProductCategory.OUTER;
            default -> throw new BusinessException(ErrorCode.INVALID_INPUT);
        };
        return PageResponse.from(productRepository.search(filter, search.trim(),
            PageRequest.of(page, size, Sort.by("id"))).map(ProductResponse::summary));
    }

	@Transactional(readOnly = true)
	public ProductResponse getProduct(String code) {
		Product product = productRepository.findByCode(code)
			.orElseThrow(() -> new BusinessException(ErrorCode.PRODUCT_NOT_FOUND));

		return ProductResponse.from(product);
	}
}
