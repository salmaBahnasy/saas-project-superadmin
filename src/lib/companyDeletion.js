export function canReviewDeletion(company, typedSlug, loading) {
  return company?.account_status === "suspended" &&
    typeof company.slug === "string" && company.slug.length > 0 &&
    typedSlug === company.slug && !loading;
}

export const deletionBlockerMessages = {
  FEATURE_DISABLED: "The deletion foundation feature is disabled on the server.",
  COMPANY_NOT_SUSPENDED: "Only a suspended company may be considered for deletion.",
  PROTECTED_UUIDS_UNVERIFIED: "The protected company UUIDs have not been verified.",
  PROTECTED_COMPANY: "This company is protected by its permanent UUID.",
  WRITE_FENCE_COVERAGE_UNPROVEN: "Database write protection coverage has not been verified.",
  BACKUP_READINESS_UNVERIFIED: "Backup and recovery readiness has not been verified.",
  PERMANENT_DELETION_DISABLED: "Permanent deletion and fence activation are disabled in this phase.",
};
