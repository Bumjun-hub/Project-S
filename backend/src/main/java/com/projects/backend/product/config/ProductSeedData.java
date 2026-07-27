package com.projects.backend.product.config;

import static com.projects.backend.myfit.entity.MeasurementArea.CHEST_WIDTH;
import static com.projects.backend.myfit.entity.MeasurementArea.HEM_WIDTH;
import static com.projects.backend.myfit.entity.MeasurementArea.HIP_WIDTH;
import static com.projects.backend.myfit.entity.MeasurementArea.RISE;
import static com.projects.backend.myfit.entity.MeasurementArea.SHOULDER_WIDTH;
import static com.projects.backend.myfit.entity.MeasurementArea.SLEEVE_LENGTH;
import static com.projects.backend.myfit.entity.MeasurementArea.THIGH_WIDTH;
import static com.projects.backend.myfit.entity.MeasurementArea.TOTAL_LENGTH;
import static com.projects.backend.myfit.entity.MeasurementArea.WAIST_WIDTH;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.projects.backend.myfit.entity.MeasurementArea;
import com.projects.backend.product.entity.Product;
import com.projects.backend.product.entity.ProductCategory;
import com.projects.backend.product.entity.ProductMeasurement;
import com.projects.backend.product.entity.ProductSize;
import com.projects.backend.product.repository.ProductRepository;

@Configuration
public class ProductSeedData {

	@Bean
	CommandLineRunner seedProducts(ProductRepository productRepository) {
		return args -> {
			for (Product product : products()) {
				if (!productRepository.existsByCode(product.getCode())) {
					productRepository.save(product);
				}
			}
		};
	}

	private List<Product> products() {
		return List.of(
			Product.create(
				"p-oxford-01",
				"\uB808\uADE4\uB7EC \uC625\uC2A4\uD3EC\uB4DC \uC154\uCE20",
				"\uBAA8\uD06C\uC6CD\uC2A4",
				ProductCategory.TOP,
				59000,
				"\uB370\uC77C\uB9AC\uC6A9 \uAE30\uBCF8 \uD54F. \uBA74 \uD63C\uBC29, \uC138\uBBF8 \uB808\uADE4\uB7EC \uC2E4\uB8E8\uC5E3\uC785\uB2C8\uB2E4.",
				List.of(
					topSize("S", 1, "70", "44", "47", "61", "47"),
					topSize("M", 2, "72", "46", "50", "62", "49"),
					topSize("L", 3, "74", "48", "53", "63", "51"),
					topSize("XL", 4, "76", "50", "57", "64", "54")
				)
			),
			Product.create(
				"p-knit-02",
				"\uB77C\uC6B4\uB4DC \uC6B8\uB2C8\uD2B8",
				"\uC5D0\uB514\uD1A0",
				ProductCategory.TOP,
				89000,
				"\uAC00\uBCBC\uC6B4 \uC6B8 \uBE14\uB80C\uB4DC \uB2C8\uD2B8. \uC5B4\uAE68\u00B7\uC18C\uB9E4 \uB77C\uC778\uC774 \uC548\uC815\uC801\uC778 \uD54F\uC785\uB2C8\uB2E4.",
				List.of(
					topSize("44", 1, "64", "42", "48", "60", "39"),
					topSize("46", 2, "66", "44", "51", "61", "41"),
					topSize("48", 3, "68", "46", "54", "62", "43"),
					topSize("50", 4, "70", "48", "58", "63", "45")
				)
			),
			Product.create(
				"p-denim-03",
				"\uC2A4\uD2B8\uB808\uC774\uD2B8 \uB370\uB2D8 \uD32C\uCE20",
				"\uB77C\uC6B0\uD2B8",
				ProductCategory.BOTTOM,
				129000,
				"\uBBF8\uB4DC\uB77C\uC774\uC988 \uC2A4\uD2B8\uB808\uC774\uD2B8. \uD5C8\uB9AC \uC2E4\uCE21\uACFC \uC0AC\uC774\uC988\uD45C\uB97C \uD568\uAED8 \uBCF4\uBA74 \uC88B\uC2B5\uB2C8\uB2E4.",
				List.of(
					bottomSize("28", 1, "101", "37", "47", "28", "24", "18"),
					bottomSize("30", 2, "102", "39", "49", "29", "25", "19"),
					bottomSize("32", 3, "103", "41", "51", "30", "26", "20"),
					bottomSize("34", 4, "104", "44", "54", "31", "28", "21")
				)
			),
			Product.create(
				"p-coat-04",
				"\uBC1C\uB9C8\uCE78 \uC2F1\uAE00 \uCF54\uD2B8",
				"\uB178\uB358\uB77C\uC778",
				ProductCategory.OUTER,
				298000,
				"\uD074\uB798\uC2DD \uC2E4\uB8E8\uC5E3\uC758 \uC2F1\uAE00 \uCF54\uD2B8. \uC5B4\uAE68\u00B7\uCD1D\uC7A5 \uB77C\uC778\uC774 \uC815\uB3C8\uB41C \uC624\uBC84\uCF54\uD2B8 \uD54F\uC785\uB2C8\uB2E4.",
				List.of(
					topSize("90", 1, "105", "45", "49", "61", "55"),
					topSize("95", 2, "107", "47", "52", "62", "57"),
					topSize("100", 3, "109", "49", "55", "63", "59"),
					topSize("105", 4, "111", "51", "59", "64", "62")
				)
			)
		);
	}

	private ProductSize topSize(
		String label,
		int displayOrder,
		String totalLength,
		String shoulderWidth,
		String chestWidth,
		String sleeveLength,
		String hemWidth
	) {
		return ProductSize.create(label, displayOrder, List.of(
			measurement(TOTAL_LENGTH, totalLength),
			measurement(SHOULDER_WIDTH, shoulderWidth),
			measurement(CHEST_WIDTH, chestWidth),
			measurement(SLEEVE_LENGTH, sleeveLength),
			measurement(HEM_WIDTH, hemWidth)
		));
	}

	private ProductSize bottomSize(
		String label,
		int displayOrder,
		String totalLength,
		String waistWidth,
		String hipWidth,
		String rise,
		String thighWidth,
		String hemWidth
	) {
		return ProductSize.create(label, displayOrder, List.of(
			measurement(TOTAL_LENGTH, totalLength),
			measurement(WAIST_WIDTH, waistWidth),
			measurement(HIP_WIDTH, hipWidth),
			measurement(RISE, rise),
			measurement(THIGH_WIDTH, thighWidth),
			measurement(HEM_WIDTH, hemWidth)
		));
	}

	private ProductMeasurement measurement(MeasurementArea area, String sizeCm) {
		return ProductMeasurement.create(area, new BigDecimal(sizeCm));
	}
}
