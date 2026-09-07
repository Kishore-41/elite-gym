package com.elitegym.controller;

import com.elitegym.dto.common.ApiResponse;
import com.elitegym.dto.publicinfo.TestimonialDto;
import com.elitegym.entity.Testimonial;
import com.elitegym.repository.TestimonialRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@RestController
@RequestMapping({"/api/testimonials", "/api/public/testimonials"})
@RequiredArgsConstructor
public class PublicTestimonialController {

    private final TestimonialRepository testimonialRepository;

    @GetMapping
    public ResponseEntity<ApiResponse<List<TestimonialDto>>> getApprovedTestimonials() {
        List<Testimonial> testimonials = testimonialRepository.findByApprovedTrue();

        List<TestimonialDto> dtos = testimonials.stream()
                .map(t -> TestimonialDto.builder()
                        .id(t.getId())
                        .memberName(t.getMemberName())
                        .roleOrPlan(t.getRoleOrPlan())
                        .rating(t.getRating())
                        .reviewText(t.getReviewText())
                        .avatarUrl(t.getAvatarUrl())
                        .approved(t.isApproved())
                        .build())
                .collect(Collectors.toList());

        return ResponseEntity.ok(ApiResponse.ok("Member testimonials retrieved successfully", dtos));
    }
}
