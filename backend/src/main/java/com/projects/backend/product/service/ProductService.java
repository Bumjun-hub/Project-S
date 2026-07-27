package com.projects.backend.product.service;

import java.util.List;

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
		return productRepository.findAllByOrderByIdAsc().stream()
			.map(ProductResponse::from)
			.toList();
	}

	@Transactional(readOnly = true)
	public ProductResponse getProduct(String code) {
		Product product = productRepository.findByCode(code)
			.orElseThrow(() -> new BusinessException(ErrorCode.PRODUCT_NOT_FOUND));

		return ProductResponse.from(product);
	}
}
