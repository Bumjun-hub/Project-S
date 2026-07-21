package com.projects.backend.common.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

	private static final String LOCAL_NEXT_ORIGIN = "http://localhost:3000";

	@Override
	public void addCorsMappings(CorsRegistry registry) {
		// Apply CORS at the Spring MVC layer because Security is not enabled yet.
		registry.addMapping("/**")
			// Allow local Next.js dev server to call the Spring Boot API.
			.allowedOrigins(LOCAL_NEXT_ORIGIN)
			// Support common REST API methods and browser preflight requests.
			.allowedMethods("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")
			// Allow client-requested headers during local development.
			.allowedHeaders("*")
			// Permit credentialed requests such as cookies or auth headers from localhost:3000.
			.allowCredentials(true)
			// Cache preflight results for one hour to reduce repeated OPTIONS requests.
			.maxAge(3600);
	}
}
