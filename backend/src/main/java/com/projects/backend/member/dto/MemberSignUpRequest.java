package com.projects.backend.member.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record MemberSignUpRequest(
	@NotBlank(message = "\uC774\uBA54\uC77C\uC740 \uD544\uC218\uC785\uB2C8\uB2E4.")
	@Email(message = "\uC774\uBA54\uC77C \uD615\uC2DD\uC774 \uC62C\uBC14\uB974\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4.")
	String email,

	@NotBlank(message = "\uBE44\uBC00\uBC88\uD638\uB294 \uD544\uC218\uC785\uB2C8\uB2E4.")
	@Size(min = 8, message = "\uBE44\uBC00\uBC88\uD638\uB294 8\uC790 \uC774\uC0C1\uC774\uC5B4\uC57C \uD569\uB2C8\uB2E4.")
	String password,

	@NotBlank(message = "\uB2C9\uB124\uC784\uC740 \uD544\uC218\uC785\uB2C8\uB2E4.")
	@Size(min = 2, max = 20, message = "\uB2C9\uB124\uC784\uC740 2\uC790 \uC774\uC0C1 20\uC790 \uC774\uD558\uC5EC\uC57C \uD569\uB2C8\uB2E4.")
	String nickname
) {
}
