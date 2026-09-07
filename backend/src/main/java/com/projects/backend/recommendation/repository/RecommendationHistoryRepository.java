package com.projects.backend.recommendation.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.projects.backend.member.entity.Member;
import com.projects.backend.recommendation.entity.RecommendationHistory;

public interface RecommendationHistoryRepository extends JpaRepository<RecommendationHistory, Long> {

	List<RecommendationHistory> findAllByMemberOrderByCreatedAtDesc(Member member);
}
