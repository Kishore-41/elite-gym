package com.elitegym.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailNotificationService {

    /**
     * Dispatches official grievance resolution email.
     *
     * @param recipientEmail email address of the submitter
     * @param complaintId ID of the complaint
     * @param subject Subject of the grievance
     * @param resolutionNotes Official notes provided by administrative authority
     */
    public void sendGrievanceResolutionEmail(String recipientEmail, Long complaintId, String subject, String resolutionNotes) {
        if (recipientEmail == null || recipientEmail.isBlank()) {
            log.info("No email address provided for Grievance #{} (Anonymous / Public submission). Skipping email dispatch.", complaintId);
            return;
        }

        String referenceId = "GRIEV-" + complaintId;
        log.info("==========================================================================");
        log.info("[OFFICIAL EMAIL DISPATCH] To: {}", recipientEmail);
        log.info("Subject: [Elite Athletic Club] Resolution Update for Grievance {}", referenceId);
        log.info("Content:");
        log.info("Dear Member/Guest,");
        log.info("Your grievance regarding '{}' (Reference: {}) has been resolved.", subject, referenceId);
        log.info("Resolution Remarks from Management: {}", resolutionNotes != null ? resolutionNotes : "Addressed per club operating standards.");
        log.info("Thank you for helping us maintain championship standards across our Madurai campus.");
        log.info("Sincerely,\nClub Ownership & Executive Directorate\nElite Athletic Club, Ponmeni, Madurai");
        log.info("==========================================================================");
    }
}
