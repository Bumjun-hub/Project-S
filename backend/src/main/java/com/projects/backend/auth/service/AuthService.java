package com.projects.backend.auth.service;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.projects.backend.auth.dto.AuthMeResponse;
import com.projects.backend.auth.dto.LoginResponse;
import com.projects.backend.auth.dto.LoginRequest;
import com.projects.backend.auth.jwt.JwtProvider;
import com.projects.backend.common.exception.BusinessException;
import com.projects.backend.common.exception.ErrorCode;
import com.projects.backend.member.entity.Member;
import com.projects.backend.member.repository.MemberRepository;

@Service
public class AuthService {

	private static final String TOKEN_TYPE = "Bearer";
	private static final String ROLE_PREFIX = "ROLE_";

	private final MemberRepository memberRepository;
	private final PasswordEncoder passwordEncoder;
	private final JwtProvider jwtProvider;

	public AuthService(MemberRepository memberRepository, PasswordEncoder passwordEncoder, JwtProvider jwtProvider) {
		this.memberRepository = memberRepository;
		this.passwordEncoder = passwordEncoder;
		this.jwtProvider = jwtProvider;
	}

	@Transactional(readOnly = true)
	public LoginResponse login(LoginRequest request) {
		Member member = authenticate(request);
		String accessToken = jwtProvider.generateAccessToken(member);

		return new LoginResponse(
			accessToken,
			TOKEN_TYPE,
			member.getId(),
			member.getEmail(),
			member.getNickname()
		);
	}

	public AuthMeResponse getCurrentMember(Authentication authentication) {
		String email = authentication.getName();
		String role = authentication.getAuthorities()
			.stream()
			.findFirst()
			.map(GrantedAuthority::getAuthority)
			.map(authority -> authority.replaceFirst("^" + ROLE_PREFIX, ""))
			.orElse("");

		return new AuthMeResponse(email, role);
	}

	@Transactional(readOnly = true)
	public Member authenticate(LoginRequest request) {
		Member member = memberRepository.findByEmail(request.email())
			.orElseThrow(() -> new BusinessException(ErrorCode.INVALID_LOGIN));

		if (!passwordEncoder.matches(request.password(), member.getPassword())) {
			throw new BusinessException(ErrorCode.INVALID_LOGIN);
		}

		return member;
	}
}
