package com.projects.backend.bodyprofile.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.projects.backend.bodyprofile.dto.BodyProfileCreateRequest;
import com.projects.backend.bodyprofile.dto.BodyProfileResponse;
import com.projects.backend.bodyprofile.dto.BodyProfileUpdateRequest;
import com.projects.backend.bodyprofile.entity.BodyProfile;
import com.projects.backend.bodyprofile.repository.BodyProfileRepository;
import com.projects.backend.common.exception.BusinessException;
import com.projects.backend.common.exception.ErrorCode;
import com.projects.backend.member.entity.Member;
import com.projects.backend.member.repository.MemberRepository;

@Service
public class BodyProfileService {

	private final BodyProfileRepository bodyProfileRepository;
	private final MemberRepository memberRepository;

	public BodyProfileService(BodyProfileRepository bodyProfileRepository, MemberRepository memberRepository) {
		this.bodyProfileRepository = bodyProfileRepository;
		this.memberRepository = memberRepository;
	}

	@Transactional
	public BodyProfileResponse create(String email, BodyProfileCreateRequest request) {
		Member member = findMemberByEmail(email);

		if (bodyProfileRepository.existsByMember(member)) {
			throw new BusinessException(ErrorCode.BODY_PROFILE_ALREADY_EXISTS);
		}

		BodyProfile bodyProfile = BodyProfile.create(
			member,
			request.height(),
			request.weight(),
			request.gender(),
			request.bodyFeatures()
		);
		BodyProfile savedBodyProfile = bodyProfileRepository.save(bodyProfile);

		return BodyProfileResponse.from(savedBodyProfile);
	}

	@Transactional(readOnly = true)
	public BodyProfileResponse getMyProfile(String email) {
		Member member = findMemberByEmail(email);
		BodyProfile bodyProfile = findBodyProfileByMember(member);

		return BodyProfileResponse.from(bodyProfile);
	}

	@Transactional
	public BodyProfileResponse update(String email, BodyProfileUpdateRequest request) {
		if (request.isEmpty()) {
			throw new BusinessException(ErrorCode.BODY_PROFILE_UPDATE_EMPTY);
		}

		Member member = findMemberByEmail(email);
		BodyProfile bodyProfile = findBodyProfileByMember(member);

		if (request.height() != null) {
			bodyProfile.updateHeight(request.height());
		}

		if (request.weight() != null) {
			bodyProfile.updateWeight(request.weight());
		}

		if (request.gender() != null) {
			bodyProfile.updateGender(request.gender());
		}

		if (request.bodyFeatures() != null) {
			bodyProfile.updateBodyFeatures(request.bodyFeatures());
		}

		return BodyProfileResponse.from(bodyProfile);
	}

	private Member findMemberByEmail(String email) {
		return memberRepository.findByEmail(email)
			.orElseThrow(() -> new BusinessException(ErrorCode.UNAUTHORIZED));
	}

	private BodyProfile findBodyProfileByMember(Member member) {
		return bodyProfileRepository.findByMember(member)
			.orElseThrow(() -> new BusinessException(ErrorCode.BODY_PROFILE_NOT_FOUND));
	}
}
