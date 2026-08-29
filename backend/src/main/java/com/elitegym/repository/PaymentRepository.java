package com.elitegym.repository;

import com.elitegym.entity.Payment;
import com.elitegym.enums.PaymentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {

    @Query("SELECT p FROM Payment p JOIN FETCH p.student s JOIN FETCH s.user JOIN FETCH p.membership m JOIN FETCH m.plan WHERE s.id = :studentId ORDER BY p.paidAt DESC")
    List<Payment> findByStudentIdWithDetails(@Param("studentId") Long studentId);

    @Query("SELECT p FROM Payment p JOIN FETCH p.student s JOIN FETCH s.user JOIN FETCH p.membership m JOIN FETCH m.plan WHERE m.id = :membershipId ORDER BY p.paidAt DESC")
    List<Payment> findByMembershipIdWithDetails(@Param("membershipId") Long membershipId);

    @Query("SELECT p FROM Payment p JOIN FETCH p.student s JOIN FETCH s.user JOIN FETCH p.membership m JOIN FETCH m.plan WHERE p.id = :id")
    Optional<Payment> findByIdWithDetails(@Param("id") Long id);

    @Query("SELECT p FROM Payment p JOIN FETCH p.student s JOIN FETCH s.user JOIN FETCH p.membership m JOIN FETCH m.plan ORDER BY p.paidAt DESC")
    List<Payment> findAllWithDetails();

    @Query("SELECT p FROM Payment p JOIN FETCH p.student s JOIN FETCH s.user JOIN FETCH p.membership m JOIN FETCH m.plan WHERE p.paymentStatus = :status ORDER BY p.paidAt DESC")
    List<Payment> findByStatusWithDetails(@Param("status") PaymentStatus status);

    @Query("SELECT COUNT(p) > 0 FROM Payment p WHERE p.transactionId = :transactionId")
    boolean existsByTransactionId(@Param("transactionId") String transactionId);

    @Query("SELECT COUNT(p) > 0 FROM Payment p WHERE p.invoiceNumber = :invoiceNumber")
    boolean existsByInvoiceNumber(@Param("invoiceNumber") String invoiceNumber);
}
