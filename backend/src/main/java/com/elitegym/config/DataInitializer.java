package com.elitegym.config;

import com.elitegym.entity.MembershipPlan;
import com.elitegym.entity.User;
import com.elitegym.enums.RoleName;
import com.elitegym.repository.MembershipPlanRepository;
import com.elitegym.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final MembershipPlanRepository planRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        seedAdminUser();
        seedStarterPlans();
    }

    private void seedAdminUser() {
        if (!userRepository.existsByUsername("admin")) {
            log.info("Seeding default Administrator account...");
            User admin = User.builder()
                    .email("admin@elitegym.com")
                    .username("admin")
                    .password(passwordEncoder.encode("Admin@123456"))
                    .firstName("Super")
                    .lastName("Admin")
                    .phone("+1 555-0001")
                    .role(RoleName.ROLE_ADMIN)
                    .isActive(true)
                    .build();
            userRepository.save(admin);
            log.info("Default Admin seeded: admin@elitegym.com / Admin@123456");
        }
    }

    private void seedStarterPlans() {
        if (planRepository.count() == 0) {
            log.info("Seeding starter membership plans catalog...");

            MembershipPlan basic = MembershipPlan.builder()
                    .name("Basic Monthly")
                    .description("Essential gym access with all foundational equipment and cardio floor.")
                    .durationMonths(1)
                    .price(new BigDecimal("29.99"))
                    .features(List.of(
                            "Full Gym Floor & Free Weights Access",
                            "Standard Locker Room & Showers",
                            "1 Free Fitness Assessment Consultation",
                            "Mobile App Self Check-in"
                    ))
                    .isActive(true)
                    .build();

            MembershipPlan pro = MembershipPlan.builder()
                    .name("Pro Quarterly")
                    .description("Accelerated fitness tier with personalized splits and recovery amenities.")
                    .durationMonths(3)
                    .price(new BigDecimal("79.99"))
                    .features(List.of(
                            "Everything in Basic Monthly",
                            "Sauna, Steam Room & Hydro-massage",
                            "Custom Weekly Workout Split from Certified Trainer",
                            "Group HIIT & Functional Fitness Classes",
                            "10% Supplement Store Discount"
                    ))
                    .isActive(true)
                    .build();

            MembershipPlan elite = MembershipPlan.builder()
                    .name("Elite Annual")
                    .description("The ultimate VIP experience with dedicated coaching, biometric body scans, and premium perks.")
                    .durationMonths(12)
                    .price(new BigDecimal("249.99"))
                    .features(List.of(
                            "Everything in Pro Quarterly",
                            "Dedicated Personal Trainer Assignment",
                            "VIP Private Locker & Towel Service",
                            "Monthly InBody 570 Composition Scans",
                            "Unlimited Guest Passes (2 per month)",
                            "20% Supplement & Apparel Discount"
                    ))
                    .isActive(true)
                    .build();

            planRepository.saveAll(List.of(basic, pro, elite));
            log.info("3 Starter membership plans seeded successfully.");
        }
    }
}
