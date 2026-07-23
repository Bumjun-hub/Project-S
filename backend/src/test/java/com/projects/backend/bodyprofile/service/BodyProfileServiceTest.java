package com.projects.backend.bodyprofile.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.util.Optional;
import java.util.Set;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.projects.backend.bodyprofile.dto.BodyProfileCreateRequest;
import com.projects.backend.bodyprofile.dto.BodyProfileResponse;
import com.projects.backend.bodyprofile.dto.BodyProfileUpdateRequest;
import com.projects.backend.bodyprofile.entity.BodyFeature;
import com.projects.backend.bodyprofile.entity.BodyProfile;
import com.projects.backend.bodyprofile.entity.Gender;
import com.projects.backend.bodyprofile.repository.BodyProfileRepository;
import com.projects.backend.common.exception.BusinessException;
import com.projects.backend.common.exception.ErrorCode;
import com.projects.backend.member.entity.Member;
import com.projects.backend.member.repository.MemberRepository;

@ExtendWith(MockitoExtension.class)
class BodyProfileServiceTest {

	private static final String EMAIL = "test@example.com";
	private static final BigDecimal HEIGHT = new BigDecimal("175.5");
	private static final BigDecimal WEIGHT = new BigDecimal("68.0");
	private static final Set<BodyFeature> BODY_FEATURES = Set.of(
		BodyFeature.BROAD_SHOULDERS,
		BodyFeature.LONG_ARMS
	);

	@Mock
	private BodyProfileRepository bodyProfileRepository;

	@Mock
	private MemberRepository memberRepository;

	@InjectMocks
	private BodyProfileService bodyProfileService;

	@Test
	void create_success() {
		// given
		Member member = createMember();
		BodyProfileCreateRequest request = createRequest();
		when(memberRepository.findByEmail(EMAIL)).thenReturn(Optional.of(member));
		when(bodyProfileRepository.existsByMember(member)).thenReturn(false);
		when(bodyProfileRepository.save(any(BodyProfile.class))).thenAnswer(invocation -> invocation.getArgument(0));

		// when
		BodyProfileResponse response = bodyProfileService.create(EMAIL, request);

		// then
		assertThat(response.height()).isEqualByComparingTo(HEIGHT);
		assertThat(response.weight()).isEqualByComparingTo(WEIGHT);
		assertThat(response.gender()).isEqualTo(Gender.MALE);
		assertThat(response.bodyFeatures()).containsExactlyInAnyOrderElementsOf(BODY_FEATURES);

		ArgumentCaptor<BodyProfile> bodyProfileCaptor = ArgumentCaptor.forClass(BodyProfile.class);
		verify(memberRepository).findByEmail(EMAIL);
		verify(bodyProfileRepository).existsByMember(member);
		verify(bodyProfileRepository).save(bodyProfileCaptor.capture());

		BodyProfile savedBodyProfile = bodyProfileCaptor.getValue();
		assertThat(savedBodyProfile.getMember()).isSameAs(member);
		assertThat(savedBodyProfile.getHeight()).isEqualByComparingTo(HEIGHT);
		assertThat(savedBodyProfile.getWeight()).isEqualByComparingTo(WEIGHT);
		assertThat(savedBodyProfile.getGender()).isEqualTo(Gender.MALE);
		assertThat(savedBodyProfile.getBodyFeatures()).containsExactlyInAnyOrderElementsOf(BODY_FEATURES);
	}

	@Test
	void create_fail_when_profile_already_exists() {
		// given
		Member member = createMember();
		BodyProfileCreateRequest request = createRequest();
		when(memberRepository.findByEmail(EMAIL)).thenReturn(Optional.of(member));
		when(bodyProfileRepository.existsByMember(member)).thenReturn(true);

		// when then
		assertThatThrownBy(() -> bodyProfileService.create(EMAIL, request))
			.isInstanceOfSatisfying(BusinessException.class, exception ->
				assertThat(exception.getErrorCode()).isEqualTo(ErrorCode.BODY_PROFILE_ALREADY_EXISTS)
			);

		verify(memberRepository).findByEmail(EMAIL);
		verify(bodyProfileRepository).existsByMember(member);
		verify(bodyProfileRepository, never()).save(any());
	}

	@Test
	void getMyProfile_success() {
		// given
		Member member = createMember();
		BodyProfile bodyProfile = createBodyProfile(member);
		when(memberRepository.findByEmail(EMAIL)).thenReturn(Optional.of(member));
		when(bodyProfileRepository.findByMember(member)).thenReturn(Optional.of(bodyProfile));

		// when
		BodyProfileResponse response = bodyProfileService.getMyProfile(EMAIL);

		// then
		assertThat(response.height()).isEqualByComparingTo(HEIGHT);
		assertThat(response.weight()).isEqualByComparingTo(WEIGHT);
		assertThat(response.gender()).isEqualTo(Gender.MALE);
		assertThat(response.bodyFeatures()).containsExactlyInAnyOrderElementsOf(BODY_FEATURES);
		verify(memberRepository).findByEmail(EMAIL);
		verify(bodyProfileRepository).findByMember(member);
	}

	@Test
	void getMyProfile_fail_when_profile_not_found() {
		// given
		Member member = createMember();
		when(memberRepository.findByEmail(EMAIL)).thenReturn(Optional.of(member));
		when(bodyProfileRepository.findByMember(member)).thenReturn(Optional.empty());

		// when then
		assertThatThrownBy(() -> bodyProfileService.getMyProfile(EMAIL))
			.isInstanceOfSatisfying(BusinessException.class, exception ->
				assertThat(exception.getErrorCode()).isEqualTo(ErrorCode.BODY_PROFILE_NOT_FOUND)
			);

		verify(memberRepository).findByEmail(EMAIL);
		verify(bodyProfileRepository).findByMember(member);
	}

	@Test
	void update_fail_when_request_is_empty() {
		// given
		BodyProfileUpdateRequest request = new BodyProfileUpdateRequest(null, null, null, null);

		// when then
		assertThatThrownBy(() -> bodyProfileService.update(EMAIL, request))
			.isInstanceOfSatisfying(BusinessException.class, exception ->
				assertThat(exception.getErrorCode()).isEqualTo(ErrorCode.BODY_PROFILE_UPDATE_EMPTY)
			);

		verifyNoInteractions(memberRepository);
		verifyNoInteractions(bodyProfileRepository);
	}

	@Test
	void update_success_with_partial_fields() {
		// given
		Member member = createMember();
		BodyProfile bodyProfile = createBodyProfile(member);
		BodyProfileUpdateRequest request = new BodyProfileUpdateRequest(
			null,
			new BigDecimal("70.5"),
			null,
			Set.of(BodyFeature.LONG_LEGS)
		);
		when(memberRepository.findByEmail(EMAIL)).thenReturn(Optional.of(member));
		when(bodyProfileRepository.findByMember(member)).thenReturn(Optional.of(bodyProfile));

		// when
		BodyProfileResponse response = bodyProfileService.update(EMAIL, request);

		// then
		assertThat(response.height()).isEqualByComparingTo(HEIGHT);
		assertThat(response.weight()).isEqualByComparingTo(new BigDecimal("70.5"));
		assertThat(response.gender()).isEqualTo(Gender.MALE);
		assertThat(response.bodyFeatures()).containsExactly(BodyFeature.LONG_LEGS);
		assertThat(bodyProfile.getHeight()).isEqualByComparingTo(HEIGHT);
		assertThat(bodyProfile.getWeight()).isEqualByComparingTo(new BigDecimal("70.5"));
		assertThat(bodyProfile.getGender()).isEqualTo(Gender.MALE);
		assertThat(bodyProfile.getBodyFeatures()).containsExactly(BodyFeature.LONG_LEGS);
		verify(bodyProfileRepository, never()).save(any());
	}

	@Test
	void update_success_when_body_features_is_empty() {
		// given
		Member member = createMember();
		BodyProfile bodyProfile = createBodyProfile(member);
		BodyProfileUpdateRequest request = new BodyProfileUpdateRequest(null, null, null, Set.of());
		when(memberRepository.findByEmail(EMAIL)).thenReturn(Optional.of(member));
		when(bodyProfileRepository.findByMember(member)).thenReturn(Optional.of(bodyProfile));

		// when
		BodyProfileResponse response = bodyProfileService.update(EMAIL, request);

		// then
		assertThat(response.bodyFeatures()).isEmpty();
		assertThat(bodyProfile.getBodyFeatures()).isEmpty();
		verify(bodyProfileRepository, never()).save(any());
	}

	@Test
	void create_fail_when_member_not_found() {
		// given
		BodyProfileCreateRequest request = createRequest();
		when(memberRepository.findByEmail(EMAIL)).thenReturn(Optional.empty());

		// when then
		assertThatThrownBy(() -> bodyProfileService.create(EMAIL, request))
			.isInstanceOfSatisfying(BusinessException.class, exception ->
				assertThat(exception.getErrorCode()).isEqualTo(ErrorCode.UNAUTHORIZED)
			);

		verify(memberRepository).findByEmail(EMAIL);
		verify(bodyProfileRepository, never()).existsByMember(any());
		verify(bodyProfileRepository, never()).save(any());
	}

	private Member createMember() {
		return Member.create(EMAIL, "encoded-password", "tester");
	}

	private BodyProfile createBodyProfile(Member member) {
		return BodyProfile.create(
			member,
			HEIGHT,
			WEIGHT,
			Gender.MALE,
			BODY_FEATURES
		);
	}

	private BodyProfileCreateRequest createRequest() {
		return new BodyProfileCreateRequest(
			HEIGHT,
			WEIGHT,
			Gender.MALE,
			BODY_FEATURES
		);
	}
}
