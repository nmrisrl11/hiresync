-- Enforce only one primary document per applicant per document type
CREATE UNIQUE INDEX "ApplicantDocument_applicantId_type_isPrimary_key"
ON "ApplicantDocument"("applicantId", "type")
WHERE "isPrimary" = true;
