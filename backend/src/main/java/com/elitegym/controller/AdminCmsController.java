package com.elitegym.controller;

import com.elitegym.dto.common.ApiResponse;
import com.elitegym.dto.publicinfo.*;
import com.elitegym.entity.*;
import com.elitegym.exception.ResourceNotFoundException;
import com.elitegym.repository.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@RestController
@RequestMapping({"/api/admin/cms", "/api/v1/admin/cms"})
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminCmsController {

    private final FacilityRepository facilityRepository;
    private final AchievementRepository achievementRepository;
    private final TestimonialRepository testimonialRepository;
    private final ClassScheduleRepository classScheduleRepository;
    private final FaqRepository faqRepository;
    private final UserRepository userRepository;

    // =========================================================================
    // 1. FACILITIES CMS
    // =========================================================================

    @GetMapping("/facilities")
    public ResponseEntity<ApiResponse<List<FacilityDto>>> getAllFacilities() {
        List<FacilityDto> list = facilityRepository.findAll().stream()
                .map(this::mapFacilityToDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.ok("All facilities retrieved", list));
    }

    @PostMapping("/facilities")
    public ResponseEntity<ApiResponse<FacilityDto>> createFacility(@Valid @RequestBody FacilityRequest request) {
        log.info("Admin creating facility: {}", request.getName());
        Facility facility = Facility.builder()
                .name(request.getName().trim())
                .category(request.getCategory().toUpperCase())
                .description(request.getDescription())
                .rules(request.getRules())
                .capacity(request.getCapacity())
                .imageUrl(request.getImageUrl())
                .operationalHours(request.getOperationalHours())
                .active(request.getActive() != null ? request.getActive() : true)
                .build();

        Facility saved = facilityRepository.save(facility);
        return new ResponseEntity<>(ApiResponse.ok("Facility created successfully", mapFacilityToDto(saved)), HttpStatus.CREATED);
    }

    @PutMapping("/facilities/{id}")
    public ResponseEntity<ApiResponse<FacilityDto>> updateFacility(
            @PathVariable Long id,
            @Valid @RequestBody FacilityRequest request) {
        log.info("Admin updating facility #{}", id);
        Facility facility = facilityRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Facility", "id", id));

        facility.setName(request.getName().trim());
        facility.setCategory(request.getCategory().toUpperCase());
        facility.setDescription(request.getDescription());
        facility.setRules(request.getRules());
        facility.setCapacity(request.getCapacity());
        facility.setImageUrl(request.getImageUrl());
        facility.setOperationalHours(request.getOperationalHours());
        if (request.getActive() != null) {
            facility.setActive(request.getActive());
        }

        Facility updated = facilityRepository.save(facility);
        return ResponseEntity.ok(ApiResponse.ok("Facility updated successfully", mapFacilityToDto(updated)));
    }

    @RequestMapping(value = {"/facilities/{id}/toggle-status", "/facilities/{id}/status"}, method = {RequestMethod.PATCH, RequestMethod.PUT})
    public ResponseEntity<ApiResponse<FacilityDto>> toggleFacilityStatus(
            @PathVariable Long id,
            @RequestParam(required = false) Boolean active) {
        Facility facility = facilityRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Facility", "id", id));

        if (active != null) {
            facility.setActive(active);
        } else {
            facility.setActive(!facility.isActive());
        }

        Facility updated = facilityRepository.save(facility);
        return ResponseEntity.ok(ApiResponse.ok("Facility status updated", mapFacilityToDto(updated)));
    }

    @PatchMapping("/facilities/{id}/capacity")
    public ResponseEntity<ApiResponse<FacilityDto>> updateFacilityCapacity(
            @PathVariable Long id,
            @RequestParam Integer capacity) {
        Facility facility = facilityRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Facility", "id", id));

        facility.setCapacity(capacity);
        Facility updated = facilityRepository.save(facility);
        return ResponseEntity.ok(ApiResponse.ok("Facility capacity updated", mapFacilityToDto(updated)));
    }

    @DeleteMapping("/facilities/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteFacility(@PathVariable Long id) {
        if (!facilityRepository.existsById(id)) {
            throw new ResourceNotFoundException("Facility", "id", id);
        }
        facilityRepository.deleteById(id);
        return ResponseEntity.ok(ApiResponse.ok("Facility deleted successfully"));
    }

    // =========================================================================
    // 2. ACHIEVEMENTS CMS
    // =========================================================================

    @GetMapping("/achievements")
    public ResponseEntity<ApiResponse<List<AchievementDto>>> getAllAchievements() {
        List<AchievementDto> list = achievementRepository.findAllByOrderByYearAwardedDesc().stream()
                .map(this::mapAchievementToDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.ok("All achievements retrieved", list));
    }

    @PostMapping("/achievements")
    public ResponseEntity<ApiResponse<AchievementDto>> createAchievement(@Valid @RequestBody AchievementRequest request) {
        log.info("Admin creating achievement: {}", request.getTitle());
        Achievement achievement = Achievement.builder()
                .title(request.getTitle().trim())
                .description(request.getDescription())
                .yearAwarded(request.getYearAwarded())
                .organization(request.getOrganization())
                .badgeIconUrl(request.getBadgeIconUrl())
                .build();

        Achievement saved = achievementRepository.save(achievement);
        return new ResponseEntity<>(ApiResponse.ok("Achievement added successfully", mapAchievementToDto(saved)), HttpStatus.CREATED);
    }

    @PutMapping("/achievements/{id}")
    public ResponseEntity<ApiResponse<AchievementDto>> updateAchievement(
            @PathVariable Long id,
            @Valid @RequestBody AchievementRequest request) {
        Achievement achievement = achievementRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Achievement", "id", id));

        achievement.setTitle(request.getTitle().trim());
        achievement.setDescription(request.getDescription());
        achievement.setYearAwarded(request.getYearAwarded());
        achievement.setOrganization(request.getOrganization());
        achievement.setBadgeIconUrl(request.getBadgeIconUrl());

        Achievement saved = achievementRepository.save(achievement);
        return ResponseEntity.ok(ApiResponse.ok("Achievement updated successfully", mapAchievementToDto(saved)));
    }

    @DeleteMapping("/achievements/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteAchievement(@PathVariable Long id) {
        if (!achievementRepository.existsById(id)) {
            throw new ResourceNotFoundException("Achievement", "id", id);
        }
        achievementRepository.deleteById(id);
        return ResponseEntity.ok(ApiResponse.ok("Achievement deleted successfully"));
    }

    // =========================================================================
    // 3. TESTIMONIALS CMS
    // =========================================================================

    @GetMapping("/testimonials")
    public ResponseEntity<ApiResponse<List<TestimonialDto>>> getAllTestimonials() {
        List<TestimonialDto> list = testimonialRepository.findAll().stream()
                .map(this::mapTestimonialToDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.ok("All testimonials retrieved", list));
    }

    @PostMapping("/testimonials")
    public ResponseEntity<ApiResponse<TestimonialDto>> createTestimonial(@Valid @RequestBody TestimonialRequest request) {
        Testimonial testimonial = Testimonial.builder()
                .memberName(request.getMemberName().trim())
                .roleOrPlan(request.getRoleOrPlan())
                .rating(request.getRating())
                .reviewText(request.getReviewText())
                .avatarUrl(request.getAvatarUrl())
                .approved(request.getApproved() != null ? request.getApproved() : true)
                .build();

        Testimonial saved = testimonialRepository.save(testimonial);
        return new ResponseEntity<>(ApiResponse.ok("Testimonial added successfully", mapTestimonialToDto(saved)), HttpStatus.CREATED);
    }

    @RequestMapping(value = {"/testimonials/{id}/approve", "/testimonials/{id}/status"}, method = {RequestMethod.PUT, RequestMethod.PATCH})
    public ResponseEntity<ApiResponse<TestimonialDto>> approveTestimonial(
            @PathVariable Long id,
            @RequestParam(required = false, defaultValue = "true") Boolean approved) {
        Testimonial testimonial = testimonialRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Testimonial", "id", id));

        testimonial.setApproved(approved);
        Testimonial saved = testimonialRepository.save(testimonial);
        return ResponseEntity.ok(ApiResponse.ok("Testimonial approval status updated", mapTestimonialToDto(saved)));
    }

    @DeleteMapping("/testimonials/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteTestimonial(@PathVariable Long id) {
        if (!testimonialRepository.existsById(id)) {
            throw new ResourceNotFoundException("Testimonial", "id", id);
        }
        testimonialRepository.deleteById(id);
        return ResponseEntity.ok(ApiResponse.ok("Testimonial deleted successfully"));
    }

    // =========================================================================
    // 4. SCHEDULE CMS
    // =========================================================================

    @GetMapping("/schedules")
    public ResponseEntity<ApiResponse<List<ClassScheduleDto>>> getAllSchedules() {
        List<ClassScheduleDto> list = classScheduleRepository.findAll().stream()
                .map(this::mapScheduleToDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.ok("All class schedules retrieved", list));
    }

    @PostMapping("/schedules")
    public ResponseEntity<ApiResponse<ClassScheduleDto>> createSchedule(@Valid @RequestBody ClassScheduleRequest request) {
        User trainer = null;
        if (request.getTrainerId() != null) {
            trainer = userRepository.findById(request.getTrainerId()).orElse(null);
        }

        ClassSchedule schedule = ClassSchedule.builder()
                .title(request.getTitle().trim())
                .trainer(trainer)
                .dayOfWeek(request.getDayOfWeek().toUpperCase())
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .capacity(request.getCapacity())
                .bookedSlots(request.getBookedSlots() != null ? request.getBookedSlots() : 0)
                .room(request.getRoom())
                .build();

        ClassSchedule saved = classScheduleRepository.save(schedule);
        return new ResponseEntity<>(ApiResponse.ok("Class schedule slot added successfully", mapScheduleToDto(saved)), HttpStatus.CREATED);
    }

    @PutMapping("/schedules/{id}")
    public ResponseEntity<ApiResponse<ClassScheduleDto>> updateSchedule(
            @PathVariable Long id,
            @Valid @RequestBody ClassScheduleRequest request) {
        ClassSchedule schedule = classScheduleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ClassSchedule", "id", id));

        if (request.getTrainerId() != null) {
            User trainer = userRepository.findById(request.getTrainerId()).orElse(null);
            schedule.setTrainer(trainer);
        }

        schedule.setTitle(request.getTitle().trim());
        schedule.setDayOfWeek(request.getDayOfWeek().toUpperCase());
        schedule.setStartTime(request.getStartTime());
        schedule.setEndTime(request.getEndTime());
        schedule.setCapacity(request.getCapacity());
        if (request.getBookedSlots() != null) {
            schedule.setBookedSlots(request.getBookedSlots());
        }
        schedule.setRoom(request.getRoom());

        ClassSchedule saved = classScheduleRepository.save(schedule);
        return ResponseEntity.ok(ApiResponse.ok("Class schedule updated successfully", mapScheduleToDto(saved)));
    }

    @DeleteMapping("/schedules/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteSchedule(@PathVariable Long id) {
        if (!classScheduleRepository.existsById(id)) {
            throw new ResourceNotFoundException("ClassSchedule", "id", id);
        }
        classScheduleRepository.deleteById(id);
        return ResponseEntity.ok(ApiResponse.ok("Class schedule slot deleted successfully"));
    }

    // =========================================================================
    // 5. FAQS CMS
    // =========================================================================

    @GetMapping("/faqs")
    public ResponseEntity<ApiResponse<List<FaqDto>>> getAllFaqs() {
        List<FaqDto> list = faqRepository.findAll().stream()
                .map(this::mapFaqToDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.ok("All FAQs retrieved", list));
    }

    @PostMapping("/faqs")
    public ResponseEntity<ApiResponse<FaqDto>> createFaq(@Valid @RequestBody FaqRequest request) {
        Faq faq = Faq.builder()
                .question(request.getQuestion().trim())
                .answer(request.getAnswer().trim())
                .category(request.getCategory() != null ? request.getCategory().toUpperCase() : "GENERAL")
                .displayOrder(request.getDisplayOrder() != null ? request.getDisplayOrder() : 0)
                .active(request.getActive() != null ? request.getActive() : true)
                .build();

        Faq saved = faqRepository.save(faq);
        return new ResponseEntity<>(ApiResponse.ok("FAQ created successfully", mapFaqToDto(saved)), HttpStatus.CREATED);
    }

    @PutMapping("/faqs/{id}")
    public ResponseEntity<ApiResponse<FaqDto>> updateFaq(
            @PathVariable Long id,
            @Valid @RequestBody FaqRequest request) {
        Faq faq = faqRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Faq", "id", id));

        faq.setQuestion(request.getQuestion().trim());
        faq.setAnswer(request.getAnswer().trim());
        if (request.getCategory() != null) {
            faq.setCategory(request.getCategory().toUpperCase());
        }
        if (request.getDisplayOrder() != null) {
            faq.setDisplayOrder(request.getDisplayOrder());
        }
        if (request.getActive() != null) {
            faq.setActive(request.getActive());
        }

        Faq saved = faqRepository.save(faq);
        return ResponseEntity.ok(ApiResponse.ok("FAQ updated successfully", mapFaqToDto(saved)));
    }

    @DeleteMapping("/faqs/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteFaq(@PathVariable Long id) {
        if (!faqRepository.existsById(id)) {
            throw new ResourceNotFoundException("Faq", "id", id);
        }
        faqRepository.deleteById(id);
        return ResponseEntity.ok(ApiResponse.ok("FAQ deleted successfully"));
    }

    // =========================================================================
    // MAPPERS
    // =========================================================================

    private FacilityDto mapFacilityToDto(Facility f) {
        return FacilityDto.builder()
                .id(f.getId())
                .name(f.getName())
                .category(f.getCategory())
                .description(f.getDescription())
                .rules(f.getRules())
                .capacity(f.getCapacity())
                .imageUrl(f.getImageUrl())
                .operationalHours(f.getOperationalHours())
                .active(f.isActive())
                .build();
    }

    private AchievementDto mapAchievementToDto(Achievement a) {
        return AchievementDto.builder()
                .id(a.getId())
                .title(a.getTitle())
                .description(a.getDescription())
                .yearAwarded(a.getYearAwarded())
                .organization(a.getOrganization())
                .badgeIconUrl(a.getBadgeIconUrl())
                .build();
    }

    private TestimonialDto mapTestimonialToDto(Testimonial t) {
        return TestimonialDto.builder()
                .id(t.getId())
                .memberName(t.getMemberName())
                .roleOrPlan(t.getRoleOrPlan())
                .rating(t.getRating())
                .reviewText(t.getReviewText())
                .avatarUrl(t.getAvatarUrl())
                .approved(t.isApproved())
                .build();
    }

    private ClassScheduleDto mapScheduleToDto(ClassSchedule s) {
        String trainerName = s.getTrainer() != null ? s.getTrainer().getFullName() : "Specialist";
        Long trainerId = s.getTrainer() != null ? s.getTrainer().getId() : null;
        int booked = s.getBookedSlots() != null ? s.getBookedSlots() : 0;
        return ClassScheduleDto.builder()
                .id(s.getId())
                .title(s.getTitle())
                .trainerId(trainerId)
                .trainerName(trainerName)
                .dayOfWeek(s.getDayOfWeek())
                .startTime(s.getStartTime())
                .endTime(s.getEndTime())
                .capacity(s.getCapacity())
                .bookedSlots(booked)
                .remainingSlots(Math.max(0, s.getCapacity() - booked))
                .room(s.getRoom())
                .build();
    }

    private FaqDto mapFaqToDto(Faq f) {
        return FaqDto.builder()
                .id(f.getId())
                .question(f.getQuestion())
                .answer(f.getAnswer())
                .category(f.getCategory())
                .displayOrder(f.getDisplayOrder())
                .active(f.isActive())
                .build();
    }
}
