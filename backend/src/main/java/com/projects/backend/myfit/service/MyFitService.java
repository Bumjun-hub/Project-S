package com.projects.backend.myfit.service;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.projects.backend.common.exception.BusinessException;
import com.projects.backend.common.exception.ErrorCode;
import com.projects.backend.member.entity.Member;
import com.projects.backend.member.repository.MemberRepository;
import com.projects.backend.myfit.dto.MyFitCreateRequest;
import com.projects.backend.myfit.dto.MyFitEntryRequest;
import com.projects.backend.myfit.dto.MyFitMeasurementRequest;
import com.projects.backend.myfit.dto.MyFitResponse;
import com.projects.backend.myfit.dto.MyFitUpdateRequest;
import com.projects.backend.myfit.entity.FitCategory;
import com.projects.backend.myfit.entity.MeasurementArea;
import com.projects.backend.myfit.entity.MyFit;
import com.projects.backend.myfit.entity.MyFitEntry;
import com.projects.backend.myfit.entity.MyFitMeasurement;
import com.projects.backend.myfit.repository.MyFitRepository;

@Service
public class MyFitService {

	private final MyFitRepository myFitRepository;
	private final MemberRepository memberRepository;

	public MyFitService(MyFitRepository myFitRepository, MemberRepository memberRepository) {
		this.myFitRepository = myFitRepository;
		this.memberRepository = memberRepository;
	}

	@Transactional
	public MyFitResponse create(String email, MyFitCreateRequest request) {
		Member member = findMemberByEmail(email);

		if (myFitRepository.existsByMember(member)) {
			throw new BusinessException(ErrorCode.MY_FIT_ALREADY_EXISTS);
		}

		List<MyFitEntry> entries = toEntries(request.entries());
		MyFit myFit = MyFit.create(member, entries);
		MyFit savedMyFit = myFitRepository.save(myFit);

		return MyFitResponse.from(savedMyFit);
	}

	@Transactional(readOnly = true)
	public MyFitResponse getMyFit(String email) {
		Member member = findMemberByEmail(email);
		MyFit myFit = findMyFitByMember(member);

		return MyFitResponse.from(myFit);
	}

	@Transactional
	public MyFitResponse update(String email, MyFitUpdateRequest request) {
		if (request.isEmpty()) {
			throw new BusinessException(ErrorCode.MY_FIT_UPDATE_EMPTY);
		}

		Member member = findMemberByEmail(email);
		MyFit myFit = findMyFitByMember(member);

		myFit.updateEntries(toEntries(request.entries()));

		return MyFitResponse.from(myFit);
	}

	private Member findMemberByEmail(String email) {
		return memberRepository.findByEmail(email)
			.orElseThrow(() -> new BusinessException(ErrorCode.UNAUTHORIZED));
	}

	private MyFit findMyFitByMember(Member member) {
		return myFitRepository.findByMember(member)
			.orElseThrow(() -> new BusinessException(ErrorCode.MY_FIT_NOT_FOUND));
	}

	private List<MyFitEntry> toEntries(List<MyFitEntryRequest> requests) {
		validateDuplicateCategories(requests);

		return requests.stream()
			.map(this::toEntry)
			.toList();
	}

	private MyFitEntry toEntry(MyFitEntryRequest request) {
		validateDuplicateAreas(request.measurements());

		return MyFitEntry.create(
			request.category(),
			request.garmentLabel().trim(),
			request.measurements().stream()
				.map(this::toMeasurement)
				.toList()
		);
	}

	private MyFitMeasurement toMeasurement(MyFitMeasurementRequest request) {
		return MyFitMeasurement.create(
			request.area(),
			request.sizeCm(),
			request.feeling()
		);
	}

	private void validateDuplicateCategories(List<MyFitEntryRequest> requests) {
		Set<FitCategory> categories = new HashSet<>();

		for (MyFitEntryRequest request : requests) {
			if (!categories.add(request.category())) {
				throw new BusinessException(ErrorCode.INVALID_INPUT);
			}
		}
	}

	private void validateDuplicateAreas(List<MyFitMeasurementRequest> requests) {
		Set<MeasurementArea> areas = new HashSet<>();

		for (MyFitMeasurementRequest request : requests) {
			if (!areas.add(request.area())) {
				throw new BusinessException(ErrorCode.INVALID_INPUT);
			}
		}
	}
}
