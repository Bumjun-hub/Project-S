package com.projects.backend.product.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.projects.backend.product.entity.Product;

public interface ProductRepository extends JpaRepository<Product, Long> {

	boolean existsByCode(String code);

	List<Product> findAllByOrderByIdAsc();

	Optional<Product> findByCode(String code);
}
