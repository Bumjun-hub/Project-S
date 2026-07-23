package com.projects.backend.myfit.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

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
import com.projects.backend.myfit.entity.FitFeeling;
import com.projects.backend.myfit.entity.MeasurementArea;
import com.projects.backend.myfit.entity.MyFit;
import com.projects.backend.myfit.entity.MyFitEntry;
import com.projects.backend.myfit.entity.MyFitMeasurement;
import com.projects.backend.myfit.repository.MyFitRepository;

@ExtendWith(MockitoExtension.class)
class MyFitServiceTest {

	private static final String EMAIL = "test@example.com";
	private static final String GARMENT_LABEL = "favorite shirt M";
	private static final BigDecimal CHEST_WIDTH = new BigDecimal("52.50");

	@Mock
	private MyFitRepository myFitRepository;

	@Mock
	private MemberRepository memberRepository;

	@InjectMocks
	private MyFitService myFitService;

	@Test
	void create_success() {
		Member member = createMember();
		MyFitCreateRequest request = createRequest();
		when(memberRepository.findByEmail(EMAIL)).thenReturn(Optional.of(member));
		when(myFitRepository.existsByMember(member)).thenReturn(false);
		when(myFitRepository.save(any(MyFit.class))).thenAnswer(invocation -> invocation.getArgument(0));

		MyFitResponse response = myFitService.create(EMAIL, request);

		assertThat(response.entries()).hasSize(1);
		assertThat(response.entries().get(0).category()).isEqualTo(FitCategory.TOP);
		assertThat(response.entries().get(0).garmentLabel()).isEqualTo(GARMENT_LABEL);
		assertThat(response.entries().get(0).measurements()).hasSize(1);
		assertThat(response.entries().get(0).measurements().get(0).area()).isEqualTo(MeasurementArea.CHEST_WIDTH);
		assertThat(response.entries().get(0).measurements().get(0).sizeCm()).isEqualByComparingTo(CHEST_WIDTH);
		assertThat(response.entries().get(0).measurements().get(0).feeling()).isEqualTo(FitFeeling.EXACT);

		ArgumentCaptor<MyFit> myFitCaptor = ArgumentCaptor.forClass(MyFit.class);
		verify(memberRepository).findByEmail(EMAIL);
		verify(myFitRepository).existsByMember(member);
		verify(myFitRepository).save(myFitCaptor.capture());

		MyFit savedMyFit = myFitCaptor.getValue();
		assertThat(savedMyFit.getMember()).isSameAs(member);
		assertThat(savedMyFit.getEntries()).hasSize(1);
		assertThat(savedMyFit.getEntries().get(0).getMyFit()).isSameAs(savedMyFit);
		assertThat(savedMyFit.getEntries().get(0).getMeasurements().get(0).getEntry())
			.isSameAs(savedMyFit.getEntries().get(0));
	}

	@Test
	void create_fail_when_my_fit_already_exists() {
		Member member = createMember();
		MyFitCreateRequest request = createRequest();
		when(memberRepository.findByEmail(EMAIL)).thenReturn(Optional.of(member));
		when(myFitRepository.existsByMember(member)).thenReturn(true);

		assertThatThrownBy(() -> myFitService.create(EMAIL, request))
			.isInstanceOfSatisfying(BusinessException.class, exception ->
				assertThat(exception.getErrorCode()).isEqualTo(ErrorCode.MY_FIT_ALREADY_EXISTS)
			);

		verify(memberRepository).findByEmail(EMAIL);
		verify(myFitRepository).existsByMember(member);
		verify(myFitRepository, never()).save(any());
	}

	@Test
	void getMyFit_success() {
		Member member = createMember();
		MyFit myFit = createMyFit(member);
		when(memberRepository.findByEmail(EMAIL)).thenReturn(Optional.of(member));
		when(myFitRepository.findByMember(member)).thenReturn(Optional.of(myFit));

		MyFitResponse response = myFitService.getMyFit(EMAIL);

		assertThat(response.entries()).hasSize(1);
		assertThat(response.entries().get(0).category()).isEqualTo(FitCategory.TOP);
		verify(memberRepository).findByEmail(EMAIL);
		verify(myFitRepository).findByMember(member);
	}

	@Test
	void getMyFit_fail_when_my_fit_not_found() {
		Member member = createMember();
		when(memberRepository.findByEmail(EMAIL)).thenReturn(Optional.of(member));
		when(myFitRepository.findByMember(member)).thenReturn(Optional.empty());

		assertThatThrownBy(() -> myFitService.getMyFit(EMAIL))
			.isInstanceOfSatisfying(BusinessException.class, exception ->
				assertThat(exception.getErrorCode()).isEqualTo(ErrorCode.MY_FIT_NOT_FOUND)
			);

		verify(memberRepository).findByEmail(EMAIL);
		verify(myFitRepository).findByMember(member);
	}

	@Test
	void update_success() {
		Member member = createMember();
		MyFit myFit = createMyFit(member);
		MyFitUpdateRequest request = new MyFitUpdateRequest(List.of(
			new MyFitEntryRequest(
				FitCategory.BOTTOM,
				"straight denim",
				List.of(new MyFitMeasurementRequest(
					MeasurementArea.WAIST_WIDTH,
					new BigDecimal("40.00"),
					FitFeeling.SMALL
				))
			)
		));
		when(memberRepository.findByEmail(EMAIL)).thenReturn(Optional.of(member));
		when(myFitRepository.findByMember(member)).thenReturn(Optional.of(myFit));

		MyFitResponse response = myFitService.update(EMAIL, request);

		assertThat(response.entries()).hasSize(1);
		assertThat(response.entries().get(0).category()).isEqualTo(FitCategory.BOTTOM);
		assertThat(response.entries().get(0).garmentLabel()).isEqualTo("straight denim");
		assertThat(response.entries().get(0).measurements().get(0).area()).isEqualTo(MeasurementArea.WAIST_WIDTH);
		assertThat(myFit.getEntries()).hasSize(1);
		assertThat(myFit.getEntries().get(0).getCategory()).isEqualTo(FitCategory.BOTTOM);
		verify(myFitRepository, never()).save(any());
	}

	@Test
	void update_fail_when_request_is_empty() {
		MyFitUpdateRequest request = new MyFitUpdateRequest(null);

		assertThatThrownBy(() -> myFitService.update(EMAIL, request))
			.isInstanceOfSatisfying(BusinessException.class, exception ->
				assertThat(exception.getErrorCode()).isEqualTo(ErrorCode.MY_FIT_UPDATE_EMPTY)
			);

		verifyNoInteractions(memberRepository);
		verifyNoInteractions(myFitRepository);
	}

	@Test
	void create_fail_when_member_not_found() {
		MyFitCreateRequest request = createRequest();
		when(memberRepository.findByEmail(EMAIL)).thenReturn(Optional.empty());

		assertThatThrownBy(() -> myFitService.create(EMAIL, request))
			.isInstanceOfSatisfying(BusinessException.class, exception ->
				assertThat(exception.getErrorCode()).isEqualTo(ErrorCode.UNAUTHORIZED)
			);

		verify(memberRepository).findByEmail(EMAIL);
		verify(myFitRepository, never()).existsByMember(any());
		verify(myFitRepository, never()).save(any());
	}

	private Member createMember() {
		return Member.create(EMAIL, "encoded-password", "tester");
	}

	private MyFit createMyFit(Member member) {
		return MyFit.create(
			member,
			List.of(MyFitEntry.create(
				FitCategory.TOP,
				GARMENT_LABEL,
				List.of(MyFitMeasurement.create(MeasurementArea.CHEST_WIDTH, CHEST_WIDTH, FitFeeling.EXACT))
			))
		);
	}

	private MyFitCreateRequest createRequest() {
		return new MyFitCreateRequest(List.of(
			new MyFitEntryRequest(
				FitCategory.TOP,
				GARMENT_LABEL,
				List.of(new MyFitMeasurementRequest(MeasurementArea.CHEST_WIDTH, CHEST_WIDTH, FitFeeling.EXACT))
			)
		));
	}
}
