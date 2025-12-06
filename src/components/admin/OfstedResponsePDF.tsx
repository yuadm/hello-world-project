import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";
import { format } from "date-fns";

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 9,
    fontFamily: "Helvetica",
    backgroundColor: "#ffffff",
  },
  // GOV.UK inspired header
  header: {
    marginBottom: 20,
    paddingBottom: 15,
    borderBottom: "3px solid #1d70b8",
  },
  headerBrand: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  logo: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#0b0c0c",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#0b0c0c",
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 10,
    color: "#505a5f",
  },
  referenceBox: {
    backgroundColor: "#f3f2f1",
    padding: 8,
    marginTop: 10,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  refText: {
    fontSize: 9,
    color: "#0b0c0c",
  },
  // Section styling
  section: {
    marginBottom: 15,
    border: "1px solid #b1b4b6",
  },
  sectionHeader: {
    backgroundColor: "#1d70b8",
    padding: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  sectionLetter: {
    backgroundColor: "#ffffff",
    color: "#1d70b8",
    width: 24,
    height: 24,
    borderRadius: 12,
    textAlign: "center",
    lineHeight: 24,
    fontSize: 12,
    fontWeight: "bold",
    marginRight: 10,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#ffffff",
  },
  sectionContent: {
    padding: 12,
    backgroundColor: "#ffffff",
  },
  // Row styles
  row: {
    flexDirection: "row",
    marginBottom: 6,
    paddingBottom: 6,
    borderBottom: "1px solid #f3f2f1",
  },
  rowNoBorder: {
    flexDirection: "row",
    marginBottom: 6,
  },
  label: {
    width: "35%",
    fontSize: 9,
    color: "#505a5f",
    fontWeight: "bold",
  },
  value: {
    width: "65%",
    fontSize: 9,
    color: "#0b0c0c",
  },
  // Status badges
  statusRow: {
    flexDirection: "row",
    marginBottom: 8,
    alignItems: "center",
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 3,
    marginRight: 8,
  },
  notKnownBadge: {
    backgroundColor: "#cce2d8",
  },
  currentProviderBadge: {
    backgroundColor: "#fcd6c3",
  },
  formerProviderBadge: {
    backgroundColor: "#f9e1ac",
  },
  statusText: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#0b0c0c",
  },
  checkMark: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#00703c",
    marginRight: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  checkText: {
    color: "#ffffff",
    fontSize: 10,
    fontWeight: "bold",
  },
  // Subsection
  subsection: {
    marginTop: 10,
    paddingTop: 10,
    borderTop: "1px dashed #b1b4b6",
  },
  subsectionTitle: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#0b0c0c",
    marginBottom: 8,
  },
  // Address list
  addressItem: {
    backgroundColor: "#f3f2f1",
    padding: 8,
    marginBottom: 6,
    borderLeft: "3px solid #1d70b8",
  },
  addressText: {
    fontSize: 9,
    color: "#0b0c0c",
    marginBottom: 2,
  },
  addressDates: {
    fontSize: 8,
    color: "#505a5f",
    fontStyle: "italic",
  },
  // Warning box
  warningBox: {
    backgroundColor: "#fef3c7",
    border: "1px solid #f59e0b",
    padding: 10,
    marginTop: 10,
    borderLeft: "4px solid #f59e0b",
  },
  warningTitle: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#92400e",
    marginBottom: 4,
  },
  warningText: {
    fontSize: 9,
    color: "#92400e",
  },
  // Alert box for safeguarding
  alertBox: {
    backgroundColor: "#fee2e2",
    border: "1px solid #dc2626",
    padding: 10,
    marginTop: 10,
    borderLeft: "4px solid #dc2626",
  },
  alertTitle: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#991b1b",
    marginBottom: 4,
  },
  alertText: {
    fontSize: 9,
    color: "#991b1b",
  },
  // Footer
  footer: {
    position: "absolute",
    bottom: 25,
    left: 40,
    right: 40,
    borderTop: "2px solid #1d70b8",
    paddingTop: 10,
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  footerText: {
    fontSize: 7,
    color: "#505a5f",
  },
  footerBrand: {
    fontSize: 8,
    fontWeight: "bold",
    color: "#0b0c0c",
  },
  confidential: {
    backgroundColor: "#d4351c",
    color: "#ffffff",
    fontSize: 7,
    fontWeight: "bold",
    padding: "3px 6px",
    borderRadius: 2,
  },
  // Empty state
  emptyText: {
    fontSize: 9,
    color: "#505a5f",
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

const getStatusBadgeStyle = (status: string) => {
  switch (status) {
    case "notKnown":
      return styles.notKnownBadge;
    case "currentProvider":
      return styles.currentProviderBadge;
    case "formerOrOther":
      return styles.formerProviderBadge;
    default:
      return {};
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
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerBrand}>
            <Text style={styles.logo}>ReadyKids Childminder Agency</Text>
          </View>
          <Text style={styles.title}>Known to Ofsted Response</Text>
          <Text style={styles.subtitle}>
            Completed check under the Childcare Act 2006 & Childcare (Childminder Agencies) Regulations 2014
          </Text>
          <View style={styles.referenceBox}>
            <Text style={styles.refText}>Reference: {referenceId}</Text>
            <Text style={styles.refText}>Generated: {format(new Date(), "dd MMMM yyyy 'at' HH:mm")}</Text>
          </View>
        </View>

        {/* Section A - Request Details */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionLetter}>A</Text>
            <Text style={styles.sectionTitle}>Request Details (Pre-filled by Agency)</Text>
          </View>
          <View style={styles.sectionContent}>
            {/* Applicant Details */}
            <View style={styles.row}>
              <Text style={styles.label}>Full Name:</Text>
              <Text style={styles.value}>{applicantName}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Date of Birth:</Text>
              <Text style={styles.value}>{formatDate(dateOfBirth)}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Applicant's Role:</Text>
              <Text style={styles.value}>{roleLabels[requestData?.role || ''] || requestData?.role || 'N/A'}</Text>
            </View>

            {/* Previous Names */}
            {requestData?.previousNames && requestData.previousNames.length > 0 && (
              <View style={styles.subsection}>
                <Text style={styles.subsectionTitle}>Previous Names/Surnames</Text>
                {requestData.previousNames.map((name, idx) => (
                  <View key={idx} style={styles.addressItem}>
                    <Text style={styles.addressText}>{name.name}</Text>
                    <Text style={styles.addressDates}>
                      From: {formatShortDate(name.dateFrom)} — To: {formatShortDate(name.dateTo)}
                    </Text>
                  </View>
                ))}
              </View>
            )}

            {/* Current Address */}
            {requestData?.currentAddress && (
              <View style={styles.subsection}>
                <Text style={styles.subsectionTitle}>Current Address</Text>
                <View style={styles.addressItem}>
                  <Text style={styles.addressText}>
                    {requestData.currentAddress.line1}
                    {requestData.currentAddress.line2 ? `, ${requestData.currentAddress.line2}` : ''}
                  </Text>
                  <Text style={styles.addressText}>
                    {requestData.currentAddress.town}, {requestData.currentAddress.postcode}
                  </Text>
                  <Text style={styles.addressDates}>
                    Move-in Date: {formatShortDate(requestData.currentAddress.moveInDate)}
                  </Text>
                </View>
              </View>
            )}

            {/* Previous Addresses */}
            {requestData?.previousAddresses && requestData.previousAddresses.length > 0 && (
              <View style={styles.subsection}>
                <Text style={styles.subsectionTitle}>Previous Addresses (Last 5 Years)</Text>
                {requestData.previousAddresses.map((addr, idx) => (
                  <View key={idx} style={styles.addressItem}>
                    <Text style={styles.addressText}>{addr.address}</Text>
                    <Text style={styles.addressDates}>
                      From: {formatShortDate(addr.dateFrom)} — To: {formatShortDate(addr.dateTo)}
                    </Text>
                  </View>
                ))}
              </View>
            )}

            {/* Request Timeline */}
            <View style={styles.subsection}>
              <Text style={styles.subsectionTitle}>Request Information</Text>
              <View style={styles.row}>
                <Text style={styles.label}>Agency Name:</Text>
                <Text style={styles.value}>{requestData?.agencyName || 'ReadyKids Childminder Agency'}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Requester Name:</Text>
                <Text style={styles.value}>{requestData?.requesterName || 'N/A'}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Requester Role:</Text>
                <Text style={styles.value}>{requestData?.requesterRole || 'N/A'}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Request Sent:</Text>
                <Text style={styles.value}>{formatDate(sentAt)}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Ofsted Email:</Text>
                <Text style={styles.value}>{ofstedEmail}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Section B - Ofsted Findings */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionLetter}>B</Text>
            <Text style={styles.sectionTitle}>Ofsted Findings</Text>
          </View>
          <View style={styles.sectionContent}>
            <View style={styles.row}>
              <Text style={styles.label}>Response Received:</Text>
              <Text style={styles.value}>{formatDate(completedAt)}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Check Completed:</Text>
              <Text style={styles.value}>{formatDate(responseData.checkCompletedDate)}</Text>
            </View>
            
            <View style={styles.subsection}>
              <Text style={styles.subsectionTitle}>Ofsted Records Status</Text>
              {responseData.recordsStatus.map((status, idx) => (
                <View key={idx} style={styles.statusRow}>
                  <View style={styles.checkMark}>
                    <Text style={styles.checkText}>✓</Text>
                  </View>
                  <View style={[styles.statusBadge, getStatusBadgeStyle(status)]}>
                    <Text style={styles.statusText}>{getStatusLabel(status)}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Section C - Current Registered Provider Details */}
        {responseData.sectionC && (
          <View style={styles.section}>
            <View style={[styles.sectionHeader, { backgroundColor: '#f47738' }]}>
              <Text style={[styles.sectionLetter, { color: '#f47738' }]}>C</Text>
              <Text style={styles.sectionTitle}>Current Registered Provider Details</Text>
            </View>
            <View style={styles.sectionContent}>
              {responseData.sectionC.uniqueRefNumber && (
                <View style={styles.row}>
                  <Text style={styles.label}>Unique Reference Number:</Text>
                  <Text style={styles.value}>{responseData.sectionC.uniqueRefNumber}</Text>
                </View>
              )}
              {responseData.sectionC.otherNames && (
                <View style={styles.row}>
                  <Text style={styles.label}>Other Names on Record:</Text>
                  <Text style={styles.value}>{responseData.sectionC.otherNames}</Text>
                </View>
              )}
              {responseData.sectionC.addressKnown && (
                <View style={styles.row}>
                  <Text style={styles.label}>Address Known to Ofsted:</Text>
                  <Text style={styles.value}>{responseData.sectionC.addressKnown}</Text>
                </View>
              )}
              {responseData.sectionC.registeredBodyName && (
                <View style={styles.row}>
                  <Text style={styles.label}>Registered Body Name:</Text>
                  <Text style={styles.value}>{responseData.sectionC.registeredBodyName}</Text>
                </View>
              )}
              {responseData.sectionC.registrationStatus && (
                <View style={styles.row}>
                  <Text style={styles.label}>Registration Status:</Text>
                  <Text style={styles.value}>{responseData.sectionC.registrationStatus}</Text>
                </View>
              )}
              {responseData.sectionC.dateOfRegistration && (
                <View style={styles.row}>
                  <Text style={styles.label}>Date of Registration:</Text>
                  <Text style={styles.value}>{formatDate(responseData.sectionC.dateOfRegistration)}</Text>
                </View>
              )}
              {responseData.sectionC.provisionType && (
                <View style={styles.row}>
                  <Text style={styles.label}>Provision Type:</Text>
                  <Text style={styles.value}>{responseData.sectionC.provisionType}</Text>
                </View>
              )}
              {responseData.sectionC.registers && (
                <View style={styles.row}>
                  <Text style={styles.label}>Registers & Chapters:</Text>
                  <Text style={styles.value}>{responseData.sectionC.registers}</Text>
                </View>
              )}
              {responseData.sectionC.lastInspection && (
                <View style={styles.row}>
                  <Text style={styles.label}>Last Inspection:</Text>
                  <Text style={styles.value}>{responseData.sectionC.lastInspection}</Text>
                </View>
              )}
              {responseData.sectionC.telephone && (
                <View style={styles.row}>
                  <Text style={styles.label}>Telephone:</Text>
                  <Text style={styles.value}>{responseData.sectionC.telephone}</Text>
                </View>
              )}
              {responseData.sectionC.emailAddress && (
                <View style={styles.row}>
                  <Text style={styles.label}>Email Address:</Text>
                  <Text style={styles.value}>{responseData.sectionC.emailAddress}</Text>
                </View>
              )}
              {responseData.sectionC.provisionAddress && (
                <View style={styles.row}>
                  <Text style={styles.label}>Provision Address:</Text>
                  <Text style={styles.value}>{responseData.sectionC.provisionAddress}</Text>
                </View>
              )}
              {responseData.sectionC.childrenInfo && (
                <View style={styles.row}>
                  <Text style={styles.label}>Children Information:</Text>
                  <Text style={styles.value}>{responseData.sectionC.childrenInfo}</Text>
                </View>
              )}
              {responseData.sectionC.conditions && (
                <View style={styles.warningBox}>
                  <Text style={styles.warningTitle}>Conditions on Registration:</Text>
                  <Text style={styles.warningText}>{responseData.sectionC.conditions}</Text>
                </View>
              )}
              {responseData.sectionC.suitabilityInfo && (
                <View style={styles.warningBox}>
                  <Text style={styles.warningTitle}>Suitability Information:</Text>
                  <Text style={styles.warningText}>{responseData.sectionC.suitabilityInfo}</Text>
                </View>
              )}
              {responseData.sectionC.inspectionInfo && (
                <View style={styles.warningBox}>
                  <Text style={styles.warningTitle}>Inspection/Enforcement Information:</Text>
                  <Text style={styles.warningText}>{responseData.sectionC.inspectionInfo}</Text>
                </View>
              )}
              {responseData.sectionC.safeguardingConcerns && (
                <View style={styles.alertBox}>
                  <Text style={styles.alertTitle}>⚠ Safeguarding Concerns:</Text>
                  <Text style={styles.alertText}>{responseData.sectionC.safeguardingConcerns}</Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Section D - Former/Other Capacity Details */}
        {responseData.sectionD && (
          <View style={styles.section}>
            <View style={[styles.sectionHeader, { backgroundColor: '#4c6ef5' }]}>
              <Text style={[styles.sectionLetter, { color: '#4c6ef5' }]}>D</Text>
              <Text style={styles.sectionTitle}>Former / Other Capacity Details</Text>
            </View>
            <View style={styles.sectionContent}>
              {responseData.sectionD.otherNamesD && (
                <View style={styles.row}>
                  <Text style={styles.label}>Other Names on Record:</Text>
                  <Text style={styles.value}>{responseData.sectionD.otherNamesD}</Text>
                </View>
              )}
              {responseData.sectionD.capacityKnown && (
                <View style={styles.row}>
                  <Text style={styles.label}>Capacity Known:</Text>
                  <Text style={styles.value}>{responseData.sectionD.capacityKnown}</Text>
                </View>
              )}
              {responseData.sectionD.relevantInfo && (
                <View style={styles.warningBox}>
                  <Text style={styles.warningTitle}>Relevant Information:</Text>
                  <Text style={styles.warningText}>{responseData.sectionD.relevantInfo}</Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.footerRow}>
            <View>
              <Text style={styles.footerBrand}>ReadyKids Childminder Agency</Text>
              <Text style={styles.footerText}>Operating under the Childcare Act 2006 | Registered with Ofsted</Text>
            </View>
            <Text style={styles.confidential}>CONFIDENTIAL</Text>
          </View>
          <Text style={[styles.footerText, { marginTop: 6 }]}>
            This document contains sensitive information and should be handled in accordance with data protection regulations.
          </Text>
        </View>
      </Page>
    </Document>
  );
};
