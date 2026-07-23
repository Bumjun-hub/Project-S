package com.projects.backend.bodyprofile.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.projects.backend.bodyprofile.entity.BodyProfile;
import com.projects.backend.member.entity.Member;

public interface BodyProfileRepository extends JpaRepository<BodyProfile, Long> {

	Optional<BodyProfile> findByMember(Member member);

	boolean existsByMember(Member member);
}
