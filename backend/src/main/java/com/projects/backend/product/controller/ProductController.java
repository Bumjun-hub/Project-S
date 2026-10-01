package com.projects.backend.product.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestParam;
import com.projects.backend.common.response.PageResponse;

import com.projects.backend.common.response.ApiResponse;
import com.projects.backend.product.dto.ProductResponse;
import com.projects.backend.product.service.ProductService;

@RestController
@RequestMapping("/api/v1/products")
public class ProductController {

	private static final String GET_PRODUCTS_SUCCESS_MESSAGE =
		"\uC0C1\uD488 \uBAA9\uB85D\uC744 \uC870\uD68C\uD588\uC2B5\uB2C8\uB2E4.";
	private static final String GET_PRODUCT_SUCCESS_MESSAGE =
		"\uC0C1\uD488\uC744 \uC870\uD68C\uD588\uC2B5\uB2C8\uB2E4.";

	private final ProductService productService;

	public ProductController(ProductService productService) {
		this.productService = productService;
	}

	@GetMapping
	public ResponseEntity<ApiResponse<List<ProductResponse>>> getProducts() {
		List<ProductResponse> response = productService.getProducts();

		return ResponseEntity.ok(ApiResponse.success(GET_PRODUCTS_SUCCESS_MESSAGE, response));
	}

	@GetMapping("/{code}")
	public ResponseEntity<ApiResponse<ProductResponse>> getProduct(@PathVariable String code) {
		ProductResponse response = productService.getProduct(code);

		return ResponseEntity.ok(ApiResponse.success(GET_PRODUCT_SUCCESS_MESSAGE, response));
	}

    @GetMapping("/page")
    public ResponseEntity<ApiResponse<PageResponse<ProductResponse>>> getProductPage(
        @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "12") int size,
        @RequestParam(defaultValue = "all") String category, @RequestParam(defaultValue = "") String search
    ) {
        return ResponseEntity.ok(ApiResponse.success(GET_PRODUCTS_SUCCESS_MESSAGE,
            productService.getProductPage(page, size, category, search)));
    }
}
