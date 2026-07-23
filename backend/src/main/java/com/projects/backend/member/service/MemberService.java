package com.projects.backend.member.service;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.projects.backend.common.exception.BusinessException;
import com.projects.backend.common.exception.ErrorCode;
import com.projects.backend.member.dto.MemberSignUpRequest;
import com.projects.backend.member.dto.MemberSignUpResponse;
import com.projects.backend.member.entity.Member;
import com.projects.backend.member.repository.MemberRepository;

@Service
public class MemberService {

	private final MemberRepository memberRepository;
	private final PasswordEncoder passwordEncoder;

	public MemberService(MemberRepository memberRepository, PasswordEncoder passwordEncoder) {
		this.memberRepository = memberRepository;
		this.passwordEncoder = passwordEncoder;
	}

	@Transactional
	public MemberSignUpResponse signUp(MemberSignUpRequest request) {
		if (memberRepository.existsByEmail(request.email())) {
			throw new BusinessException(ErrorCode.DUPLICATE_EMAIL);
		}

		String encodedPassword = passwordEncoder.encode(request.password());
		Member member = Member.create(request.email(), encodedPassword, request.nickname());
		Member savedMember = memberRepository.save(member);

		return new MemberSignUpResponse(savedMember.getId(), savedMember.getEmail(), savedMember.getNickname());
	}
}
