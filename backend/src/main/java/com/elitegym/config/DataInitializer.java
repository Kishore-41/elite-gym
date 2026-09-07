package com.elitegym.config;

import com.elitegym.entity.*;
import com.elitegym.enums.RoleName;
import com.elitegym.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalTime;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final TrainerProfileRepository trainerProfileRepository;
    private final MembershipPlanRepository planRepository;
    private final FacilityRepository facilityRepository;
    private final AchievementRepository achievementRepository;
    private final ClassScheduleRepository classScheduleRepository;
    private final FaqRepository faqRepository;
    private final TestimonialRepository testimonialRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        seedAdminUser();
        seedTrainers();
        seedStarterPlans();
        seedFacilities();
        seedAchievements();
        seedClassSchedules();
        seedFaqs();
        seedTestimonials();
    }

    private void seedAdminUser() {
        if (!userRepository.existsByUsername("admin")) {
            log.info("Seeding default Administrator account for Madurai Flagship...");
            User admin = User.builder()
                    .email("admin@elitegym.in")
                    .username("admin")
                    .password(passwordEncoder.encode("Admin@123456"))
                    .firstName("Super")
                    .lastName("Admin")
                    .phone("+91 452 245 8890")
                    .avatarUrl("https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80")
                    .role(RoleName.ROLE_ADMIN)
                    .isActive(true)
                    .build();
            userRepository.save(admin);
            log.info("Default Admin seeded: admin@elitegym.in / Admin@123456");
        }
    }

    private void seedTrainers() {
        if (!userRepository.existsByUsername("murugan_trainer")) {
            log.info("Seeding 8 Tamil & South Indian certified coaches for Madurai Flagship...");

            // 1. K. Murugan
            User u1 = User.builder()
                    .email("murugan@elitegym.in")
                    .username("murugan_trainer")
                    .password(passwordEncoder.encode("Trainer@123456"))
                    .firstName("K.")
                    .lastName("Murugan")
                    .phone("+91 98421 77651")
                    .avatarUrl("https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80")
                    .role(RoleName.ROLE_TRAINER)
                    .isActive(true)
                    .build();
            userRepository.save(u1);
            TrainerProfile p1 = TrainerProfile.builder()
                    .user(u1)
                    .specialization("Head Strength Coach & Powerlifting Champion")
                    .experienceYears(10)
                    .bio("Decorated national powerlifting gold medalist and lead strength architect at Madurai. Specializes in barbell biomechanics, heavy platform prep, and periodized CNS loading.")
                    .certification("CSCS, IPF National Referee, FMS L2")
                    .maxStudentCapacity(25)
                    .isAvailable(true)
                    .build();
            trainerProfileRepository.save(p1);

            // 2. Karthik Raja
            User u2 = User.builder()
                    .email("karthik@elitegym.in")
                    .username("karthik_trainer")
                    .password(passwordEncoder.encode("Trainer@123456"))
                    .firstName("Karthik")
                    .lastName("Raja")
                    .phone("+91 98421 77652")
                    .avatarUrl("https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80")
                    .role(RoleName.ROLE_TRAINER)
                    .isActive(true)
                    .build();
            userRepository.save(u2);
            TrainerProfile p2 = TrainerProfile.builder()
                    .user(u2)
                    .specialization("Hypertrophy & Biomechanics Specialist")
                    .experienceYears(7)
                    .bio("Scientific physique programmer with in-depth knowledge of muscle moment arms, active tension curves, and injury-free hypertrophy splits.")
                    .certification("K11 Certified Master Trainer, ISSA Bodybuilding Specialist")
                    .maxStudentCapacity(25)
                    .isAvailable(true)
                    .build();
            trainerProfileRepository.save(p2);

            // 3. Dr. Ananya Suresh, PT
            User u3 = User.builder()
                    .email("ananya@elitegym.in")
                    .username("ananya_trainer")
                    .password(passwordEncoder.encode("Trainer@123456"))
                    .firstName("Ananya")
                    .lastName("Suresh")
                    .phone("+91 98421 77653")
                    .avatarUrl("https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80")
                    .role(RoleName.ROLE_TRAINER)
                    .isActive(true)
                    .build();
            userRepository.save(u3);
            TrainerProfile p3 = TrainerProfile.builder()
                    .user(u3)
                    .specialization("Sports Physiotherapist & Functional Rehab")
                    .experienceYears(6)
                    .bio("Master of Sports Physiotherapy specializing in dry needling, rotator cuff rehabilitation, ACL return-to-sport protocols, and kinetic chain realignment.")
                    .certification("MPT Sports, Certified Dry Needling Practitioner (CDNP)")
                    .maxStudentCapacity(20)
                    .isAvailable(true)
                    .build();
            trainerProfileRepository.save(p3);

            // 4. S. Vigneshwaran (Vicky)
            User u4 = User.builder()
                    .email("vignesh@elitegym.in")
                    .username("vicky_trainer")
                    .password(passwordEncoder.encode("Trainer@123456"))
                    .firstName("S.")
                    .lastName("Vigneshwaran (Vicky)")
                    .phone("+91 98421 77654")
                    .avatarUrl("https://images.unsplash.com/photo-1568602471122-7832951cc4c5?auto=format&fit=crop&w=400&q=80")
                    .role(RoleName.ROLE_TRAINER)
                    .isActive(true)
                    .build();
            userRepository.save(u4);
            TrainerProfile p4 = TrainerProfile.builder()
                    .user(u4)
                    .specialization("HIIT & Calisthenics Lead")
                    .experienceYears(5)
                    .bio("High-energy conditioning maestro leading Madurai's metabolic surge circuits, bodyweight gymnastics, and kettlebell ballistic power programs.")
                    .certification("CrossFit Level 2, StrongFirst SFG I Kettlebell, Animal Flow L1")
                    .maxStudentCapacity(25)
                    .isAvailable(true)
                    .build();
            trainerProfileRepository.save(p4);

            // 5. Priya Selvam
            User u5 = User.builder()
                    .email("priya@elitegym.in")
                    .username("priya_trainer")
                    .password(passwordEncoder.encode("Trainer@123456"))
                    .firstName("Priya")
                    .lastName("Selvam")
                    .phone("+91 98421 77655")
                    .avatarUrl("https://images.unsplash.com/photo-1594381898411-846e7d193883?auto=format&fit=crop&w=400&q=80")
                    .role(RoleName.ROLE_TRAINER)
                    .isActive(true)
                    .build();
            userRepository.save(u5);
            TrainerProfile p5 = TrainerProfile.builder()
                    .user(u5)
                    .specialization("Women’s Strength, Pre/Post-Natal Fitness")
                    .experienceYears(8)
                    .bio("Champion for women’s athletic empowerment across South India. Specializes in progressive barbell strength, pelvic floor conditioning, and metabolic wellness.")
                    .certification("ACE Certified Personal Trainer, Precision Nutrition PN1")
                    .maxStudentCapacity(25)
                    .isAvailable(true)
                    .build();
            trainerProfileRepository.save(p5);

            // 6. M. Dinesh Kumar
            User u6 = User.builder()
                    .email("dinesh@elitegym.in")
                    .username("dinesh_trainer")
                    .password(passwordEncoder.encode("Trainer@123456"))
                    .firstName("M.")
                    .lastName("Dinesh Kumar")
                    .phone("+91 98421 77656")
                    .avatarUrl("https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=400&q=80")
                    .role(RoleName.ROLE_TRAINER)
                    .isActive(true)
                    .build();
            userRepository.save(u6);
            TrainerProfile p6 = TrainerProfile.builder()
                    .user(u6)
                    .specialization("Olympic Weightlifting & Athletic Conditioning")
                    .experienceYears(9)
                    .bio("National Institute of Sports (NIS) certified weightlifting coach. Focuses on snatch turnover speed, clean & jerk bar path precision, and triple extension power.")
                    .certification("NIS Certified Weightlifting Coach, CSCS")
                    .maxStudentCapacity(20)
                    .isAvailable(true)
                    .build();
            trainerProfileRepository.save(p6);

            // 7. Kavitha Sundaram
            User u7 = User.builder()
                    .email("kavitha@elitegym.in")
                    .username("kavitha_trainer")
                    .password(passwordEncoder.encode("Trainer@123456"))
                    .firstName("Kavitha")
                    .lastName("Sundaram")
                    .phone("+91 98421 77657")
                    .avatarUrl("https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80")
                    .role(RoleName.ROLE_TRAINER)
                    .isActive(true)
                    .build();
            userRepository.save(u7);
            TrainerProfile p7 = TrainerProfile.builder()
                    .user(u7)
                    .specialization("Mobility, Flexibility & Power Yoga")
                    .experienceYears(6)
                    .bio("Experienced yoga teacher combining traditional Ashtanga discipline with contemporary functional range conditioning for deep hip, spine, and shoulder mobility.")
                    .certification("Yoga Alliance 500-RYT, FRCms, Pranayama Instructor")
                    .maxStudentCapacity(25)
                    .isAvailable(true)
                    .build();
            trainerProfileRepository.save(p7);

            // 8. R. Arunachalam
            User u8 = User.builder()
                    .email("arun@elitegym.in")
                    .username("arun_trainer")
                    .password(passwordEncoder.encode("Trainer@123456"))
                    .firstName("R.")
                    .lastName("Arunachalam")
                    .phone("+91 98421 77658")
                    .avatarUrl("https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=400&q=80")
                    .role(RoleName.ROLE_TRAINER)
                    .isActive(true)
                    .build();
            userRepository.save(u8);
            TrainerProfile p8 = TrainerProfile.builder()
                    .user(u8)
                    .specialization("Functional Turf, Speed & Agility")
                    .experienceYears(4)
                    .bio("Former state collegiate sprinter dedicated to acceleration mechanics, change-of-direction COD deceleration drills, and youth athletic foundations.")
                    .certification("NASM-PES, EXOS Fitness Specialist")
                    .maxStudentCapacity(20)
                    .isAvailable(true)
                    .build();
            trainerProfileRepository.save(p8);

            log.info("8 Tamil certified trainers seeded successfully for Madurai Flagship.");
        }
    }

    private void seedStarterPlans() {
        if (planRepository.count() == 0) {
            log.info("Seeding Madurai regional membership plans (INR)...");

            MembershipPlan classic = MembershipPlan.builder()
                    .name("Classic Fitness Deck")
                    .description("Full strength & cardio floor access, biometric locker room, and comprehensive fitness assessment.")
                    .durationMonths(1)
                    .price(new BigDecimal("1499.00"))
                    .features(List.of(
                            "Full Strength Floor & Free Weights Access",
                            "Functional Cardio Deck & Turf Track",
                            "Biometric Keyless Locker Room & Showers",
                            "1 Free Biometric Movement Assessment",
                            "Mobile App Check-in & Workout Tracker"
                    ))
                    .isActive(true)
                    .build();

            MembershipPlan performance = MembershipPlan.builder()
                    .name("Performance Pro")
                    .description("Classic perks plus 25m Olympic pool access, unlimited group HIIT & Yoga, and 2 sauna sessions/month.")
                    .durationMonths(1)
                    .price(new BigDecimal("2499.00"))
                    .features(List.of(
                            "All Classic Fitness Deck Perks Included",
                            "25m Olympic Regulated Swimming Pool Access",
                            "Unlimited Group HIIT, Calisthenics & Power Yoga",
                            "2 Nordic Cedar Sauna & Steam Sessions / Month",
                            "10% Pro-Shop & Recovery Bar Discount"
                    ))
                    .isActive(true)
                    .build();

            MembershipPlan elite = MembershipPlan.builder()
                    .name("Elite VIP Championship")
                    .description("All-access VIP pass with unlimited hydrotherapy spa, ice plunge, monthly InBody scan, and guest passes.")
                    .durationMonths(1)
                    .price(new BigDecimal("3999.00"))
                    .features(List.of(
                            "Unrestricted All-Access Pass Across All Zones",
                            "Unlimited Hydrotherapy Spa & 10°C Ice Plunge",
                            "Monthly InBody 570 Body Composition Analysis",
                            "2 Free Complimentary Guest Passes / Month",
                            "VIP Dedicated Locker & Fresh Towel Service"
                    ))
                    .isActive(true)
                    .build();

            planRepository.saveAll(List.of(classic, performance, elite));
            log.info("3 Indian club tiers seeded successfully.");
        }
    }

    private void seedFacilities() {
        if (facilityRepository.count() == 0) {
            log.info("Seeding gym facilities catalog...");

            Facility pool = Facility.builder()
                    .name("Olympic Swimming Pool")
                    .category("SWIMMING_POOL")
                    .description("25m x 50m competition pool with 8 regulated lanes maintained at an optimal 28°C. Features automated touch-timing boards, underwater stroke analysis lighting, and purified saline filtration.")
                    .rules("Lane booking mandatory via member portal. Swim caps and sanitized footwear required on deck. Shower before entry. Lane etiquette must be respected during peak hours.")
                    .capacity(32)
                    .imageUrl("https://images.unsplash.com/photo-1576610616656-d3aa5d1f4534?auto=format&fit=crop&w=1200&q=80")
                    .operationalHours("05:00 AM - 10:00 PM")
                    .active(true)
                    .build();

            Facility strength = Facility.builder()
                    .name("High-Performance Strength Deck")
                    .category("STRENGTH")
                    .description("World-class strength floor outfitted with competition Eleiko barbells, IPF-certified calibrated bumper plates, 6 custom power racks, dedicated deadlift platforms with acoustic drop flooring, and full dumbbell racks up to 150 lbs.")
                    .rules("Collar clips mandatory on all barbell lifts. Re-rack all plates and dumbbells after use. Chalk permitted in designated platform zones only.")
                    .capacity(75)
                    .imageUrl("https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1200&q=80")
                    .operationalHours("05:00 AM - 10:30 PM")
                    .active(true)
                    .build();

            Facility spa = Facility.builder()
                    .name("Hydrotherapy Spa & Cedar Sauna")
                    .category("SPA_RECOVERY")
                    .description("Comprehensive thermal recovery sanctuary featuring authentic Nordic cedar dry sauna, aromatherapy eucalyptus steam bath, 10°C cold plunge tub, and heated hydro-massage loungers for rapid muscular restoration.")
                    .rules("Towel required on all wooden benches. 15-minute maximum session recommended for cold plunge. Quiet zone policy strictly enforced.")
                    .capacity(25)
                    .imageUrl("https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80")
                    .operationalHours("06:00 AM - 10:00 PM")
                    .active(true)
                    .build();

            Facility cardio = Facility.builder()
                    .name("Functional Cardio Deck")
                    .category("CARDIO")
                    .description("Dynamic endurance and conditioning amphitheater featuring slat-belt Woodway treadmills, Concept2 RowErgs and SkiErgs, Rogue Echo assault bikes, and interactive StairMasters with integrated performance telemetry.")
                    .rules("Sanitize equipment console and handles after each workout. 45-minute limit on cardio machines during peak morning and evening rush hours.")
                    .capacity(60)
                    .imageUrl("https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1200&q=80")
                    .operationalHours("05:00 AM - 10:30 PM")
                    .active(true)
                    .build();

            Facility amenities = Facility.builder()
                    .name("Executive Locker Suites & Parking Complex")
                    .category("AMENITIES")
                    .description("Spacious ground and basement multi-tier parking facility with dedicated slots for 80+ cars and 200+ two-wheelers, EV charging ports, biometric keyless digital locker rooms, rain showers, and dry grooming vanity bars.")
                    .rules("Lockers are for session use only. Do not leave valuables overnight. Valid club RFID decal required for automated parking gate boom barrier access.")
                    .capacity(120)
                    .imageUrl("https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&w=1200&q=80")
                    .operationalHours("04:45 AM - 11:00 PM")
                    .active(true)
                    .build();

            facilityRepository.saveAll(List.of(pool, strength, spa, cardio, amenities));
            log.info("5 Facilities including Amenities & Parking seeded successfully.");
        }
    }

    private void seedAchievements() {
        if (achievementRepository.count() == 0) {
            log.info("Seeding gym awards and achievements...");

            Achievement a1 = Achievement.builder()
                    .title("Best Commercial Athletic Facility in South Tamil Nadu (2025)")
                    .description("Awarded for state-of-the-art training architecture, Olympic aquatic infrastructure, and exceptional member satisfaction in Madurai.")
                    .organization("Tamil Nadu Fitness & Sports Guild")
                    .yearAwarded(2025)
                    .badgeIconUrl("https://images.unsplash.com/photo-1567427017947-545c5f8d16ad?auto=format&fit=crop&w=600&q=80")
                    .build();

            Achievement a2 = Achievement.builder()
                    .title("6,500+ Member Transformations")
                    .description("Milestone celebrated for successfully guiding over 6,500 members through documented, sustainable body composition and wellness goals.")
                    .organization("Excellence in Coaching & Community Health")
                    .yearAwarded(2024)
                    .badgeIconUrl("https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=600&q=80")
                    .build();

            Achievement a3 = Achievement.builder()
                    .title("Official State Weightlifting Championship Partner 2024")
                    .description("Selected as the official training, warm-up, and recovery hub for over 40+ competitive state Olympic weightlifters and powerlifters.")
                    .organization("TN State Athletic Commission")
                    .yearAwarded(2024)
                    .badgeIconUrl("https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?auto=format&fit=crop&w=600&q=80")
                    .build();

            achievementRepository.saveAll(List.of(a1, a2, a3));
            log.info("3 Achievements seeded successfully.");
        }
    }

    private void seedClassSchedules() {
        if (classScheduleRepository.count() == 0) {
            User trainer = userRepository.findByUsername("murugan_trainer")
                    .orElseGet(() -> userRepository.findByRole(RoleName.ROLE_TRAINER).stream().findFirst().orElse(null));

            ClassSchedule cs1 = ClassSchedule.builder()
                    .title("HIIT Blitz")
                    .trainer(trainer)
                    .dayOfWeek("MONDAY")
                    .startTime(LocalTime.of(7, 0))
                    .endTime(LocalTime.of(8, 0))
                    .capacity(20)
                    .bookedSlots(8)
                    .room("Studio A - High Intensity")
                    .build();

            ClassSchedule cs2 = ClassSchedule.builder()
                    .title("Olympic Weightlifting Tech")
                    .trainer(trainer)
                    .dayOfWeek("MONDAY")
                    .startTime(LocalTime.of(18, 0))
                    .endTime(LocalTime.of(19, 30))
                    .capacity(12)
                    .bookedSlots(10)
                    .room("Main Platform Deck")
                    .build();

            ClassSchedule cs3 = ClassSchedule.builder()
                    .title("Power Yoga & Mobility Flow")
                    .trainer(trainer)
                    .dayOfWeek("WEDNESDAY")
                    .startTime(LocalTime.of(8, 30))
                    .endTime(LocalTime.of(9, 30))
                    .capacity(25)
                    .bookedSlots(14)
                    .room("Studio B - Mind & Body")
                    .build();

            ClassSchedule cs4 = ClassSchedule.builder()
                    .title("Aqua Strength & Endurance")
                    .trainer(trainer)
                    .dayOfWeek("FRIDAY")
                    .startTime(LocalTime.of(17, 30))
                    .endTime(LocalTime.of(18, 30))
                    .capacity(16)
                    .bookedSlots(9)
                    .room("Aquatic Center - Lane 1-4")
                    .build();

            ClassSchedule cs5 = ClassSchedule.builder()
                    .title("HIIT Blitz Weekend Surge")
                    .trainer(trainer)
                    .dayOfWeek("SATURDAY")
                    .startTime(LocalTime.of(9, 0))
                    .endTime(LocalTime.of(10, 0))
                    .capacity(30)
                    .bookedSlots(22)
                    .room("Studio A - High Intensity")
                    .build();

            classScheduleRepository.saveAll(List.of(cs1, cs2, cs3, cs4, cs5));
            log.info("Weekly class schedules seeded successfully.");
        }
    }

    private void seedFaqs() {
        if (faqRepository.count() == 0) {
            log.info("Seeding FAQs...");

            Faq f1 = Faq.builder()
                    .question("How do guest passes work and how can I redeem one in Madurai?")
                    .answer("Every prospective visitor is entitled to a 1-day complimentary VIP Guest Pass. Generate your pass online and present the 8-character confirmation code along with a photo ID at the front desk upon arrival.")
                    .category("GENERAL")
                    .displayOrder(1)
                    .active(true)
                    .build();

            Faq f2 = Faq.builder()
                    .question("Can I freeze or temporarily hold my membership?")
                    .answer("Yes, members on Premium and Elite tiers can freeze memberships for up to 60 days per calendar year with a 7-day advance notice through the member portal without cancellation fees.")
                    .category("MEMBERSHIP")
                    .displayOrder(2)
                    .active(true)
                    .build();

            Faq f3 = Faq.builder()
                    .question("What locker room amenities are provided at the Madurai club?")
                    .answer("All members receive access to biometric digital lockers, rainfall showers, luxury bath amenities, and hair dryers. Elite tier members also receive private locker assignments and daily laundered towel service.")
                    .category("FACILITIES")
                    .displayOrder(3)
                    .active(true)
                    .build();

            Faq f4 = Faq.builder()
                    .question("What is the cancellation policy for memberships?")
                    .answer("Monthly memberships can be cancelled at any time with 14 days notice before the next billing cycle. Annual memberships include a 30-day money-back guarantee.")
                    .category("MEMBERSHIP")
                    .displayOrder(4)
                    .active(true)
                    .build();

            Faq f5 = Faq.builder()
                    .question("Are personal trainers included with my membership?")
                    .answer("All new members receive a complimentary 60-minute fitness and movement screening. Elite tier members receive 2 dedicated personal trainer sessions monthly, while other tiers can book certified trainers at preferred member rates.")
                    .category("TRAINING")
                    .displayOrder(5)
                    .active(true)
                    .build();

            Faq f6 = Faq.builder()
                    .question("What are the rules and guidelines for Olympic Swimming Pool access?")
                    .answer("Lane reservations are recommended via the member portal during peak hours (6-9 AM, 5-8 PM). Swimmers must rinse before entry, wear standard swim caps, and observe designated fast/medium/slow lane speeds.")
                    .category("FACILITIES")
                    .displayOrder(6)
                    .active(true)
                    .build();

            faqRepository.saveAll(List.of(f1, f2, f3, f4, f5, f6));
            log.info("6 FAQs seeded successfully.");
        }
    }

    private void seedTestimonials() {
        if (testimonialRepository.count() == 0) {
            log.info("Seeding member testimonials...");

            Testimonial t1 = Testimonial.builder()
                    .memberName("Alexander Reed")
                    .roleOrPlan("Elite Tier Member • 2 Years")
                    .rating(5)
                    .reviewText("Elite Athletic Club in Madurai completely redefined my perception of fitness training. The Eleiko strength platforms, Olympic pool, and recovery cold plunge are world-class.")
                    .avatarUrl("https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80")
                    .approved(true)
                    .build();

            Testimonial t2 = Testimonial.builder()
                    .memberName("Priya Sundaram")
                    .roleOrPlan("Premium Tier Member • 8 Months")
                    .rating(5)
                    .reviewText("The personal coaching and high-intensity HIIT classes helped me shatter personal records. The cedar sauna and steam room after morning workouts are pure bliss.")
                    .avatarUrl("https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80")
                    .approved(true)
                    .build();

            Testimonial t3 = Testimonial.builder()
                    .memberName("Karthik Ramanathan")
                    .roleOrPlan("Elite Tier Member • 1 Year")
                    .rating(5)
                    .reviewText("Cleanliness, atmosphere, equipment variety, and trainer professionalism are unmatched in Madurai. Easily the finest athletic facility in South India.")
                    .avatarUrl("https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80")
                    .approved(true)
                    .build();

            testimonialRepository.saveAll(List.of(t1, t2, t3));
            log.info("Testimonials seeded successfully.");
        }
    }
}
