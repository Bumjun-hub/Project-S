package com.projects.backend.product.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.repository.query.Param;
import com.projects.backend.product.entity.ProductCategory;

import com.projects.backend.product.entity.Product;

public interface ProductRepository extends JpaRepository<Product, Long> {

	boolean existsByCode(String code);

	List<Product> findAllByOrderByIdAsc();

    @Query("select p from Product p where (:category is null or p.category = :category) "
        + "and (lower(p.name) like lower(concat('%', :search, '%')) "
        + "or lower(p.brand) like lower(concat('%', :search, '%')) "
        + "or lower(p.description) like lower(concat('%', :search, '%')))")
    Page<Product> search(@Param("category") ProductCategory category, @Param("search") String search, Pageable pageable);

	Optional<Product> findByCode(String code);
}
