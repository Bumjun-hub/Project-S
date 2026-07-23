package com.projects.backend.myfit.entity;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

import com.projects.backend.member.entity.Member;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.ForeignKey;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

@Entity
@Table(
	name = "my_fits",
	uniqueConstraints = {
		@UniqueConstraint(name = "uk_my_fits_member_id", columnNames = "member_id")
	}
)
public class MyFit {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@OneToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(
		name = "member_id",
		nullable = false,
		foreignKey = @ForeignKey(name = "fk_my_fits_member")
	)
	private Member member;

	@OneToMany(mappedBy = "myFit", cascade = CascadeType.ALL, orphanRemoval = true)
	private List<MyFitEntry> entries = new ArrayList<>();

	@Column(nullable = false, updatable = false)
	private LocalDateTime createdAt;

	@Column(nullable = false)
	private LocalDateTime updatedAt;

	protected MyFit() {
	}

	private MyFit(Member member, List<MyFitEntry> entries) {
		this.member = member;
		updateEntries(entries);
	}

	public static MyFit create(Member member, List<MyFitEntry> entries) {
		return new MyFit(member, entries);
	}

	public void updateEntries(List<MyFitEntry> entries) {
		this.entries.clear();
		if (entries == null) {
			return;
		}

		for (MyFitEntry entry : entries) {
			addEntry(entry);
		}
	}

	private void addEntry(MyFitEntry entry) {
		entry.assignMyFit(this);
		this.entries.add(entry);
	}

	@PrePersist
	void prePersist() {
		LocalDateTime now = LocalDateTime.now();
		this.createdAt = now;
		this.updatedAt = now;
	}

	@PreUpdate
	void preUpdate() {
		this.updatedAt = LocalDateTime.now();
	}

	public Long getId() {
		return id;
	}

	public Member getMember() {
		return member;
	}

	public List<MyFitEntry> getEntries() {
		return Collections.unmodifiableList(entries);
	}

	public LocalDateTime getCreatedAt() {
		return createdAt;
	}

	public LocalDateTime getUpdatedAt() {
		return updatedAt;
	}
}
