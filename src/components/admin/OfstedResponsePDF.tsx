import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";
import { format } from "date-fns";

// Professional teal color palette
const colors = {
  primary: '#0f766e',
  primaryLight: '#14b8a6',
  primaryDark: '#134e4a',
  accent: '#0d9488',
  success: '#059669',
  successLight: '#d1fae5',
  warning: '#d97706',
  warningLight: '#fef3c7',
  danger: '#dc2626',
  dangerLight: '#fee2e2',
  info: '#0284c7',
  infoLight: '#e0f2fe',
  text: '#1e293b',
  textMuted: '#64748b',
  textLight: '#94a3b8',
  border: '#e2e8f0',
  borderLight: '#f1f5f9',
  background: '#ffffff',
  backgroundAlt: '#f8fafc',
};

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 9,
    fontFamily: "Helvetica",
    backgroundColor: colors.background,
  },
  // Premium Header
  header: {
    marginBottom: 24,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  brandSection: {
    flexDirection: "column",
  },
  logo: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.primary,
    letterSpacing: 0.5,
  },
  tagline: {
    fontSize: 8,
    color: colors.textMuted,
    marginTop: 2,
  },
  confidentialBadge: {
    backgroundColor: colors.primary,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 4,
  },
  confidentialText: {
    color: colors.background,
    fontSize: 7,
    fontWeight: "bold",
    letterSpacing: 1,
  },
  titleSection: {
    backgroundColor: colors.primary,
    padding: 16,
    borderRadius: 6,
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.background,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 9,
    color: colors.backgroundAlt,
    opacity: 0.9,
  },
  referenceGrid: {
    flexDirection: "row",
    gap: 12,
  },
  referenceCard: {
    flex: 1,
    backgroundColor: colors.backgroundAlt,
    padding: 10,
    borderRadius: 4,
    borderLeft: `3px solid ${colors.primary}`,
  },
  referenceLabel: {
    fontSize: 7,
    color: colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  referenceValue: {
    fontSize: 10,
    color: colors.text,
    fontWeight: "bold",
  },
  // Section styling
  section: {
    marginBottom: 16,
    borderRadius: 6,
    overflow: "hidden",
    border: `1px solid ${colors.border}`,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    backgroundColor: colors.backgroundAlt,
    borderBottom: `1px solid ${colors.border}`,
  },
  sectionNumber: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  sectionNumberText: {
    color: colors.background,
    fontSize: 11,
    fontWeight: "bold",
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "bold",
    color: colors.text,
  },
  sectionContent: {
    padding: 14,
    backgroundColor: colors.background,
  },
  // Row styles
  infoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 12,
  },
  infoItem: {
    width: "48%",
    backgroundColor: colors.backgroundAlt,
    padding: 8,
    borderRadius: 4,
  },
  infoItemFull: {
    width: "100%",
    backgroundColor: colors.backgroundAlt,
    padding: 8,
    borderRadius: 4,
  },
  infoLabel: {
    fontSize: 7,
    color: colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.3,
    marginBottom: 3,
  },
  infoValue: {
    fontSize: 9,
    color: colors.text,
    fontWeight: "bold",
  },
  // Subsection
  subsection: {
    marginTop: 14,
    paddingTop: 12,
    borderTop: `1px solid ${colors.border}`,
  },
  subsectionTitle: {
    fontSize: 10,
    fontWeight: "bold",
    color: colors.primary,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  subsectionIcon: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.primaryLight,
    marginRight: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  // Cards for addresses/names
  card: {
    backgroundColor: colors.backgroundAlt,
    padding: 10,
    marginBottom: 6,
    borderRadius: 4,
    borderLeft: `3px solid ${colors.accent}`,
  },
  cardTitle: {
    fontSize: 9,
    color: colors.text,
    fontWeight: "bold",
    marginBottom: 3,
  },
  cardSubtext: {
    fontSize: 8,
    color: colors.textMuted,
  },
  // Status badges
  statusContainer: {
    flexDirection: "column",
    gap: 8,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderRadius: 6,
    backgroundColor: colors.successLight,
  },
  statusRowWarning: {
    backgroundColor: colors.warningLight,
  },
  statusRowInfo: {
    backgroundColor: colors.infoLight,
  },
  statusIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.success,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  statusIconWarning: {
    backgroundColor: colors.warning,
  },
  statusIconInfo: {
    backgroundColor: colors.info,
  },
  statusCheckmark: {
    color: colors.background,
    fontSize: 11,
    fontWeight: "bold",
  },
  statusText: {
    fontSize: 10,
    fontWeight: "bold",
    color: colors.text,
  },
  statusSubtext: {
    fontSize: 8,
    color: colors.textMuted,
    marginTop: 2,
  },
  // Section C/D special headers
  sectionHeaderOrange: {
    backgroundColor: '#fff7ed',
    borderBottom: `1px solid #fed7aa`,
  },
  sectionNumberOrange: {
    backgroundColor: colors.warning,
  },
  sectionHeaderBlue: {
    backgroundColor: '#eff6ff',
    borderBottom: `1px solid #bfdbfe`,
  },
  sectionNumberBlue: {
    backgroundColor: colors.info,
  },
  // Alert boxes
  alertBox: {
    padding: 12,
    borderRadius: 6,
    marginTop: 10,
    flexDirection: "row",
    alignItems: "flex-start",
  },
  alertBoxDanger: {
    backgroundColor: colors.dangerLight,
    borderLeft: `4px solid ${colors.danger}`,
  },
  alertBoxWarning: {
    backgroundColor: colors.warningLight,
    borderLeft: `4px solid ${colors.warning}`,
  },
  alertBoxInfo: {
    backgroundColor: colors.infoLight,
    borderLeft: `4px solid ${colors.info}`,
  },
  alertIcon: {
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  alertIconDanger: {
    backgroundColor: colors.danger,
  },
  alertIconWarning: {
    backgroundColor: colors.warning,
  },
  alertContent: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 9,
    fontWeight: "bold",
    marginBottom: 3,
  },
  alertTitleDanger: {
    color: '#991b1b',
  },
  alertTitleWarning: {
    color: '#92400e',
  },
  alertText: {
    fontSize: 9,
    lineHeight: 1.4,
  },
  alertTextDanger: {
    color: '#991b1b',
  },
  alertTextWarning: {
    color: '#92400e',
  },
  // Data rows for Section C/D
  dataRow: {
    flexDirection: "row",
    paddingVertical: 6,
    borderBottom: `1px solid ${colors.borderLight}`,
  },
  dataLabel: {
    width: "35%",
    fontSize: 8,
    color: colors.textMuted,
  },
  dataValue: {
    width: "65%",
    fontSize: 9,
    color: colors.text,
  },
  // Footer
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.backgroundAlt,
    borderTop: `2px solid ${colors.primary}`,
    paddingVertical: 12,
    paddingHorizontal: 40,
  },
  footerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  footerBrand: {
    fontSize: 9,
    fontWeight: "bold",
    color: colors.primary,
  },
  footerBadge: {
    backgroundColor: colors.primary,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 3,
  },
  footerBadgeText: {
    color: colors.background,
    fontSize: 7,
    fontWeight: "bold",
  },
  footerDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginBottom: 8,
  },
  footerText: {
    fontSize: 7,
    color: colors.textMuted,
    textAlign: "center",
    lineHeight: 1.4,
  },
  footerLegal: {
    fontSize: 6,
    color: colors.textLight,
    textAlign: "center",
    marginTop: 6,
  },
  // Empty state
  emptyText: {
    fontSize: 9,
    color: colors.textMuted,
    fontStyle: "italic",
  },
});

interface RequestData {
  currentAddress?: {
    line1: string;
    line2?: string;
    town: string;
    postcode: string;
    moveInDate: string;
  };
  previousAddresses?: Array<{
    address: string;
    dateFrom: string;
    dateTo: string;
  }>;
  previousNames?: Array<{
    name: string;
    dateFrom: string;
    dateTo: string;
  }>;
  agencyName?: string;
  requesterName?: string;
  requesterRole?: string;
  role?: string;
}

interface ResponseData {
  recordsStatus: string[];
  checkCompletedDate: string;
  sectionC?: {
    uniqueRefNumber: string;
    otherNames: string;
    addressKnown: string;
    dateOfRegistration: string;
    registeredBodyName: string;
    registrationStatus: string;
    lastInspection: string;
    provisionType: string;
    registers: string;
    telephone: string;
    emailAddress: string;
    provisionAddress: string;
    childrenInfo: string;
    conditions: string;
    suitabilityInfo: string;
    inspectionInfo: string;
    safeguardingConcerns: string;
  } | null;
  sectionD?: {
    otherNamesD: string;
    capacityKnown: string;
    relevantInfo: string;
  } | null;
}

interface OfstedResponsePDFProps {
  referenceId: string;
  applicantName: string;
  dateOfBirth: string;
  ofstedEmail: string;
  sentAt: string;
  completedAt: string;
  responseData: ResponseData;
  requestData?: RequestData;
}

const getStatusLabel = (status: string) => {
  switch (status) {
    case "notKnown":
      return "Not known to Ofsted";
    case "currentProvider":
      return "Currently known as registered provider";
    case "formerOrOther":
      return "Known as former/other capacity";
    default:
      return status;
  }
};

const getStatusDescription = (status: string) => {
  switch (status) {
    case "notKnown":
      return "No records found matching this individual";
    case "currentProvider":
      return "Individual is currently registered with Ofsted";
    case "formerOrOther":
      return "Historical records exist for this individual";
    default:
      return "";
  }
};

const getStatusStyles = (status: string) => {
  switch (status) {
    case "notKnown":
      return { row: styles.statusRow, icon: styles.statusIcon };
    case "currentProvider":
      return { row: [styles.statusRow, styles.statusRowWarning], icon: [styles.statusIcon, styles.statusIconWarning] };
    case "formerOrOther":
      return { row: [styles.statusRow, styles.statusRowInfo], icon: [styles.statusIcon, styles.statusIconInfo] };
    default:
      return { row: styles.statusRow, icon: styles.statusIcon };
  }
};

const roleLabels: Record<string, string> = {
  childminder: 'Childminder / Sole Proprietor',
  household_member: 'Household member over the age of 16',
  assistant: 'Assistant',
  manager: 'Manager',
  nominated_individual: 'Nominated individual representing an organisation providing childcare',
};

export const OfstedResponsePDF = ({
  referenceId,
  applicantName,
  dateOfBirth,
  ofstedEmail,
  sentAt,
  completedAt,
  responseData,
  requestData,
}: OfstedResponsePDFProps) => {
  const formatDate = (dateStr: string) => {
    try {
      if (!dateStr) return "N/A";
      return format(new Date(dateStr), "dd MMMM yyyy");
    } catch {
      return dateStr || "N/A";
    }
  };

  const formatShortDate = (dateStr: string) => {
    try {
      if (!dateStr) return "N/A";
      return format(new Date(dateStr), "dd/MM/yyyy");
    } catch {
      return dateStr || "N/A";
    }
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Premium Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View style={styles.brandSection}>
              <Text style={styles.logo}>ReadyKids</Text>
              <Text style={styles.tagline}>Childminder Agency</Text>
            </View>
            <View style={styles.confidentialBadge}>
              <Text style={styles.confidentialText}>CONFIDENTIAL</Text>
            </View>
          </View>

          <View style={styles.titleSection}>
            <Text style={styles.title}>Known to Ofsted Response</Text>
            <Text style={styles.subtitle}>
              Statutory check under the Childcare Act 2006 & Childcare (Childminder Agencies) Regulations 2014
            </Text>
          </View>

          <View style={styles.referenceGrid}>
            <View style={styles.referenceCard}>
              <Text style={styles.referenceLabel}>Reference Number</Text>
              <Text style={styles.referenceValue}>{referenceId}</Text>
            </View>
            <View style={styles.referenceCard}>
              <Text style={styles.referenceLabel}>Applicant Name</Text>
              <Text style={styles.referenceValue}>{applicantName}</Text>
            </View>
            <View style={styles.referenceCard}>
              <Text style={styles.referenceLabel}>Generated</Text>
              <Text style={styles.referenceValue}>{format(new Date(), "dd MMM yyyy")}</Text>
            </View>
          </View>
        </View>

        {/* Section A - Request Details */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionNumber}>
              <Text style={styles.sectionNumberText}>A</Text>
            </View>
            <Text style={styles.sectionTitle}>Request Details</Text>
          </View>
          <View style={styles.sectionContent}>
            <View style={styles.infoGrid}>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Full Name</Text>
                <Text style={styles.infoValue}>{applicantName}</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Date of Birth</Text>
                <Text style={styles.infoValue}>{formatDate(dateOfBirth)}</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Applicant Role</Text>
                <Text style={styles.infoValue}>{roleLabels[requestData?.role || ''] || requestData?.role || 'N/A'}</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Request Sent</Text>
                <Text style={styles.infoValue}>{formatDate(sentAt)}</Text>
              </View>
            </View>

            {/* Previous Names */}
            {requestData?.previousNames && requestData.previousNames.length > 0 && (
              <View style={styles.subsection}>
                <Text style={styles.subsectionTitle}>Previous Names/Surnames</Text>
                {requestData.previousNames.map((name, idx) => (
                  <View key={idx} style={styles.card}>
                    <Text style={styles.cardTitle}>{name.name}</Text>
                    <Text style={styles.cardSubtext}>
                      {formatShortDate(name.dateFrom)} — {formatShortDate(name.dateTo)}
                    </Text>
                  </View>
                ))}
              </View>
            )}

            {/* Current Address */}
            {requestData?.currentAddress && (
              <View style={styles.subsection}>
                <Text style={styles.subsectionTitle}>Current Address</Text>
                <View style={styles.card}>
                  <Text style={styles.cardTitle}>
                    {requestData.currentAddress.line1}
                    {requestData.currentAddress.line2 ? `, ${requestData.currentAddress.line2}` : ''}
                  </Text>
                  <Text style={styles.cardTitle}>
                    {requestData.currentAddress.town}, {requestData.currentAddress.postcode}
                  </Text>
                  <Text style={styles.cardSubtext}>
                    Resident since {formatShortDate(requestData.currentAddress.moveInDate)}
                  </Text>
                </View>
              </View>
            )}

            {/* Previous Addresses */}
            {requestData?.previousAddresses && requestData.previousAddresses.length > 0 && (
              <View style={styles.subsection}>
                <Text style={styles.subsectionTitle}>Previous Addresses (Last 5 Years)</Text>
                {requestData.previousAddresses.map((addr, idx) => (
                  <View key={idx} style={styles.card}>
                    <Text style={styles.cardTitle}>{addr.address}</Text>
                    <Text style={styles.cardSubtext}>
                      {formatShortDate(addr.dateFrom)} — {formatShortDate(addr.dateTo)}
                    </Text>
                  </View>
                ))}
              </View>
            )}

            {/* Agency Information */}
            <View style={styles.subsection}>
              <Text style={styles.subsectionTitle}>Agency Information</Text>
              <View style={styles.infoGrid}>
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Agency Name</Text>
                  <Text style={styles.infoValue}>{requestData?.agencyName || 'ReadyKids Childminder Agency'}</Text>
                </View>
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Ofsted Email</Text>
                  <Text style={styles.infoValue}>{ofstedEmail}</Text>
                </View>
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Requester Name</Text>
                  <Text style={styles.infoValue}>{requestData?.requesterName || 'N/A'}</Text>
                </View>
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Requester Role</Text>
                  <Text style={styles.infoValue}>{requestData?.requesterRole || 'N/A'}</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Section B - Ofsted Findings */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionNumber}>
              <Text style={styles.sectionNumberText}>B</Text>
            </View>
            <Text style={styles.sectionTitle}>Ofsted Findings</Text>
          </View>
          <View style={styles.sectionContent}>
            <View style={styles.infoGrid}>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Response Received</Text>
                <Text style={styles.infoValue}>{formatDate(completedAt)}</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Check Completed</Text>
                <Text style={styles.infoValue}>{formatDate(responseData.checkCompletedDate)}</Text>
              </View>
            </View>

            <View style={styles.subsection}>
              <Text style={styles.subsectionTitle}>Records Status</Text>
              <View style={styles.statusContainer}>
                {responseData.recordsStatus.map((status, idx) => {
                  const statusStyles = getStatusStyles(status);
                  return (
                    <View key={idx} style={statusStyles.row}>
                      <View style={statusStyles.icon}>
                        <Text style={styles.statusCheckmark}>✓</Text>
                      </View>
                      <View>
                        <Text style={styles.statusText}>{getStatusLabel(status)}</Text>
                        <Text style={styles.statusSubtext}>{getStatusDescription(status)}</Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>
          </View>
        </View>

        {/* Section C - Current Registered Provider Details */}
        {responseData.sectionC && (
          <View style={styles.section}>
            <View style={[styles.sectionHeader, styles.sectionHeaderOrange]}>
              <View style={[styles.sectionNumber, styles.sectionNumberOrange]}>
                <Text style={styles.sectionNumberText}>C</Text>
              </View>
              <Text style={styles.sectionTitle}>Current Registered Provider Details</Text>
            </View>
            <View style={styles.sectionContent}>
              {responseData.sectionC.uniqueRefNumber && (
                <View style={styles.dataRow}>
                  <Text style={styles.dataLabel}>Unique Reference Number</Text>
                  <Text style={styles.dataValue}>{responseData.sectionC.uniqueRefNumber}</Text>
                </View>
              )}
              {responseData.sectionC.otherNames && (
                <View style={styles.dataRow}>
                  <Text style={styles.dataLabel}>Other Names on Record</Text>
                  <Text style={styles.dataValue}>{responseData.sectionC.otherNames}</Text>
                </View>
              )}
              {responseData.sectionC.addressKnown && (
                <View style={styles.dataRow}>
                  <Text style={styles.dataLabel}>Address Known to Ofsted</Text>
                  <Text style={styles.dataValue}>{responseData.sectionC.addressKnown}</Text>
                </View>
              )}
              {responseData.sectionC.registeredBodyName && (
                <View style={styles.dataRow}>
                  <Text style={styles.dataLabel}>Registered Body Name</Text>
                  <Text style={styles.dataValue}>{responseData.sectionC.registeredBodyName}</Text>
                </View>
              )}
              {responseData.sectionC.registrationStatus && (
                <View style={styles.dataRow}>
                  <Text style={styles.dataLabel}>Registration Status</Text>
                  <Text style={styles.dataValue}>{responseData.sectionC.registrationStatus}</Text>
                </View>
              )}
              {responseData.sectionC.dateOfRegistration && (
                <View style={styles.dataRow}>
                  <Text style={styles.dataLabel}>Date of Registration</Text>
                  <Text style={styles.dataValue}>{formatDate(responseData.sectionC.dateOfRegistration)}</Text>
                </View>
              )}
              {responseData.sectionC.provisionType && (
                <View style={styles.dataRow}>
                  <Text style={styles.dataLabel}>Provision Type</Text>
                  <Text style={styles.dataValue}>{responseData.sectionC.provisionType}</Text>
                </View>
              )}
              {responseData.sectionC.registers && (
                <View style={styles.dataRow}>
                  <Text style={styles.dataLabel}>Registers & Chapters</Text>
                  <Text style={styles.dataValue}>{responseData.sectionC.registers}</Text>
                </View>
              )}
              {responseData.sectionC.lastInspection && (
                <View style={styles.dataRow}>
                  <Text style={styles.dataLabel}>Last Inspection</Text>
                  <Text style={styles.dataValue}>{responseData.sectionC.lastInspection}</Text>
                </View>
              )}
              {responseData.sectionC.telephone && (
                <View style={styles.dataRow}>
                  <Text style={styles.dataLabel}>Telephone</Text>
                  <Text style={styles.dataValue}>{responseData.sectionC.telephone}</Text>
                </View>
              )}
              {responseData.sectionC.emailAddress && (
                <View style={styles.dataRow}>
                  <Text style={styles.dataLabel}>Email Address</Text>
                  <Text style={styles.dataValue}>{responseData.sectionC.emailAddress}</Text>
                </View>
              )}
              {responseData.sectionC.provisionAddress && (
                <View style={styles.dataRow}>
                  <Text style={styles.dataLabel}>Provision Address</Text>
                  <Text style={styles.dataValue}>{responseData.sectionC.provisionAddress}</Text>
                </View>
              )}
              {responseData.sectionC.childrenInfo && (
                <View style={styles.dataRow}>
                  <Text style={styles.dataLabel}>Children Information</Text>
                  <Text style={styles.dataValue}>{responseData.sectionC.childrenInfo}</Text>
                </View>
              )}

              {responseData.sectionC.conditions && (
                <View style={[styles.alertBox, styles.alertBoxWarning]}>
                  <View style={[styles.alertIcon, styles.alertIconWarning]}>
                    <Text style={{ color: '#fff', fontSize: 10, fontWeight: 'bold' }}>!</Text>
                  </View>
                  <View style={styles.alertContent}>
                    <Text style={[styles.alertTitle, styles.alertTitleWarning]}>Conditions on Registration</Text>
                    <Text style={[styles.alertText, styles.alertTextWarning]}>{responseData.sectionC.conditions}</Text>
                  </View>
                </View>
              )}
              {responseData.sectionC.suitabilityInfo && (
                <View style={[styles.alertBox, styles.alertBoxWarning]}>
                  <View style={[styles.alertIcon, styles.alertIconWarning]}>
                    <Text style={{ color: '#fff', fontSize: 10, fontWeight: 'bold' }}>!</Text>
                  </View>
                  <View style={styles.alertContent}>
                    <Text style={[styles.alertTitle, styles.alertTitleWarning]}>Suitability Information</Text>
                    <Text style={[styles.alertText, styles.alertTextWarning]}>{responseData.sectionC.suitabilityInfo}</Text>
                  </View>
                </View>
              )}
              {responseData.sectionC.inspectionInfo && (
                <View style={[styles.alertBox, styles.alertBoxWarning]}>
                  <View style={[styles.alertIcon, styles.alertIconWarning]}>
                    <Text style={{ color: '#fff', fontSize: 10, fontWeight: 'bold' }}>!</Text>
                  </View>
                  <View style={styles.alertContent}>
                    <Text style={[styles.alertTitle, styles.alertTitleWarning]}>Inspection/Enforcement Information</Text>
                    <Text style={[styles.alertText, styles.alertTextWarning]}>{responseData.sectionC.inspectionInfo}</Text>
                  </View>
                </View>
              )}
              {responseData.sectionC.safeguardingConcerns && (
                <View style={[styles.alertBox, styles.alertBoxDanger]}>
                  <View style={[styles.alertIcon, styles.alertIconDanger]}>
                    <Text style={{ color: '#fff', fontSize: 10, fontWeight: 'bold' }}>⚠</Text>
                  </View>
                  <View style={styles.alertContent}>
                    <Text style={[styles.alertTitle, styles.alertTitleDanger]}>Safeguarding Concerns</Text>
                    <Text style={[styles.alertText, styles.alertTextDanger]}>{responseData.sectionC.safeguardingConcerns}</Text>
                  </View>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Section D - Former/Other Capacity Details */}
        {responseData.sectionD && (
          <View style={styles.section}>
            <View style={[styles.sectionHeader, styles.sectionHeaderBlue]}>
              <View style={[styles.sectionNumber, styles.sectionNumberBlue]}>
                <Text style={styles.sectionNumberText}>D</Text>
              </View>
              <Text style={styles.sectionTitle}>Former / Other Capacity Details</Text>
            </View>
            <View style={styles.sectionContent}>
              {responseData.sectionD.otherNamesD && (
                <View style={styles.dataRow}>
                  <Text style={styles.dataLabel}>Other Names on Record</Text>
                  <Text style={styles.dataValue}>{responseData.sectionD.otherNamesD}</Text>
                </View>
              )}
              {responseData.sectionD.capacityKnown && (
                <View style={styles.dataRow}>
                  <Text style={styles.dataLabel}>Capacity Known</Text>
                  <Text style={styles.dataValue}>{responseData.sectionD.capacityKnown}</Text>
                </View>
              )}
              {responseData.sectionD.relevantInfo && (
                <View style={[styles.alertBox, styles.alertBoxInfo]}>
                  <View style={styles.alertContent}>
                    <Text style={[styles.alertTitle, { color: '#0369a1' }]}>Relevant Information</Text>
                    <Text style={[styles.alertText, { color: '#0369a1' }]}>{responseData.sectionD.relevantInfo}</Text>
                  </View>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Premium Footer */}
        <View style={styles.footer}>
          <View style={styles.footerTop}>
            <Text style={styles.footerBrand}>ReadyKids Childminder Agency</Text>
            <View style={styles.footerBadge}>
              <Text style={styles.footerBadgeText}>OFFICIAL DOCUMENT</Text>
            </View>
          </View>
          <View style={styles.footerDivider} />
          <Text style={styles.footerText}>
            This document confirms the outcome of a statutory check conducted under the Childcare Act 2006.
            Operating as a registered Childminder Agency under the Childcare (Childminder Agencies) Regulations 2014.
          </Text>
          <Text style={styles.footerLegal}>
            This document contains sensitive personal information and must be handled in accordance with UK GDPR and Data Protection Act 2018.
            For authorised personnel only. Unauthorised disclosure may result in legal action.
          </Text>
        </View>
      </Page>
    </Document>
  );
};
