package com.projects.backend.myfit.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.projects.backend.member.entity.Member;
import com.projects.backend.myfit.entity.MyFit;

public interface MyFitRepository extends JpaRepository<MyFit, Long> {

	Optional<MyFit> findByMember(Member member);

	boolean existsByMember(Member member);
}
