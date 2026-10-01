package com.projects.backend.recommendation.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.projects.backend.member.entity.Member;
import com.projects.backend.recommendation.entity.RecommendationHistory;

public interface RecommendationHistoryRepository extends JpaRepository<RecommendationHistory, Long> {

    @EntityGraph(attributePaths = "product")
    List<RecommendationHistory> findTop100ByMemberOrderByCreatedAtDescIdDesc(Member member);

    @EntityGraph(attributePaths = "product")
    Page<RecommendationHistory> findByMember(Member member, Pageable pageable);

    Optional<RecommendationHistory> findByMemberAndRequestKey(Member member, String requestKey);

	Optional<RecommendationHistory> findByIdAndMember(Long id, Member member);
}
