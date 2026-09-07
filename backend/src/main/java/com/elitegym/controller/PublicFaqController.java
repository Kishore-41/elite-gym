package com.elitegym.controller;

import com.elitegym.dto.common.ApiResponse;
import com.elitegym.dto.publicinfo.FaqDto;
import com.elitegym.entity.Faq;
import com.elitegym.repository.FaqRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@RestController
@RequestMapping({"/api/faq", "/api/public/faq"})
@RequiredArgsConstructor
public class PublicFaqController {

    private final FaqRepository faqRepository;

    @GetMapping
    public ResponseEntity<ApiResponse<List<FaqDto>>> getFaqs(
            @RequestParam(required = false) String category) {
        List<Faq> faqs;
        if (category != null && !category.isBlank()) {
            faqs = faqRepository.findByCategoryAndActiveTrueOrderByDisplayOrderAsc(category.toUpperCase());
        } else {
            faqs = faqRepository.findByActiveTrueOrderByDisplayOrderAsc();
        }

        List<FaqDto> dtos = faqs.stream()
                .map(f -> FaqDto.builder()
                        .id(f.getId())
                        .question(f.getQuestion())
                        .answer(f.getAnswer())
                        .category(f.getCategory())
                        .displayOrder(f.getDisplayOrder())
                        .active(f.isActive())
                        .build())
                .collect(Collectors.toList());

        return ResponseEntity.ok(ApiResponse.ok("Frequently asked questions retrieved", dtos));
    }
}
