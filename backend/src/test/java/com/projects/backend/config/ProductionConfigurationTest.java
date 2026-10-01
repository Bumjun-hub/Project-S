package com.projects.backend.config;

import static org.junit.jupiter.api.Assertions.*;
import org.junit.jupiter.api.Test;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.support.ResourcePropertySource;
import org.springframework.mock.env.MockEnvironment;

class ProductionConfigurationTest {
    @Test
    void production_requires_explicit_signing_key_and_never_updates_the_schema() throws Exception {
        var properties = new ResourcePropertySource(new ClassPathResource("application-prod.properties"));
        var environment = new MockEnvironment();
        environment.getPropertySources().addFirst(properties);
        assertThrows(IllegalArgumentException.class, () -> environment.getProperty("jwt.secret"));
        environment.setProperty("JWT_SECRET", "random-test-only-signing-key-at-least-32-bytes");
        assertEquals("random-test-only-signing-key-at-least-32-bytes", environment.getProperty("jwt.secret"));
        assertEquals("validate", environment.getProperty("spring.jpa.hibernate.ddl-auto"));
        assertEquals("false", environment.getProperty("spring.jpa.show-sql"));
    }
}
