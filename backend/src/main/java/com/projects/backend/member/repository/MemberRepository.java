package com.projects.backend.member.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.projects.backend.member.entity.Member;

public interface MemberRepository extends JpaRepository<Member, Long> {

	boolean existsByEmail(String email);
}
