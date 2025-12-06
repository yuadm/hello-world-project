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
    fontSize: 10,
    fontFamily: "Helvetica",
  },
  header: {
    marginBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: "#7C3AED",
    paddingBottom: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#7C3AED",
  },
  subtitle: {
    fontSize: 10,
    color: "#666",
    marginTop: 4,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "bold",
    backgroundColor: "#F3F4F6",
    padding: 8,
    marginBottom: 8,
  },
  row: {
    flexDirection: "row",
    marginBottom: 6,
  },
  label: {
    width: 140,
    color: "#666",
  },
  value: {
    flex: 1,
    fontWeight: "bold",
  },
  responseBox: {
    padding: 12,
    backgroundColor: "#F9FAFB",
    borderRadius: 4,
    marginBottom: 12,
  },
  responseType: {
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 8,
  },
  notKnown: {
    color: "#059669",
  },
  knownNoInfo: {
    color: "#2563EB",
  },
  knownWithInfo: {
    color: "#DC2626",
  },
  unableToProvide: {
    color: "#D97706",
  },
  relevantInfoBox: {
    padding: 12,
    backgroundColor: "#FEF2F2",
    borderLeftWidth: 3,
    borderLeftColor: "#DC2626",
    marginBottom: 12,
  },
  footer: {
    position: "absolute",
    bottom: 40,
    left: 40,
    right: 40,
    fontSize: 8,
    color: "#9CA3AF",
    textAlign: "center",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    paddingTop: 10,
  },
});

interface ResponseData {
  responseType: 'not_known' | 'known_no_info' | 'known_with_info' | 'unable_to_provide';
  relevantInformation?: string;
  expectedResponseDate?: string;
  responderName: string;
  responderRole: string;
  responderEmail?: string;
  responderPhone?: string;
  checkCompletedDate: string;
}

interface PreviousAddressObject {
  line1: string;
  line2?: string;
  town: string;
  postcode: string;
}

interface RequestData {
  currentAddress?: {
    line1: string;
    line2?: string;
    town: string;
    postcode: string;
    moveInDate: string;
  };
  previousAddresses?: Array<{
    address: string | PreviousAddressObject;
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
  localAuthority?: string;
}

// Helper to format previous address (handles both string and object formats)
const formatPreviousAddress = (address: string | PreviousAddressObject): string => {
  if (typeof address === 'string') {
    return address;
  }
  const parts = [
    address.line1,
    address.line2,
    address.town,
    address.postcode
  ].filter(Boolean);
  return parts.join(', ');
};

interface LAResponsePDFProps {
  referenceId: string;
  applicantName: string;
  dateOfBirth: string;
  localAuthority: string;
  laEmail: string;
  sentAt: string;
  completedAt: string;
  responseData: ResponseData;
  requestData?: RequestData;
}

const formatDate = (dateStr: string) => {
  if (!dateStr) return "N/A";
  try {
    return format(new Date(dateStr), "dd/MM/yyyy");
  } catch {
    return dateStr;
  }
};

const getResponseTypeLabel = (responseType: string) => {
  switch (responseType) {
    case "not_known":
      return "NOT KNOWN to Children's Services";
    case "known_no_info":
      return "KNOWN - No relevant information held";
    case "known_with_info":
      return "KNOWN - Relevant information held";
    case "unable_to_provide":
      return "Information held but unable to provide at this time";
    default:
      return responseType;
  }
};

const getResponseStyle = (responseType: string) => {
  switch (responseType) {
    case "not_known":
      return styles.notKnown;
    case "known_no_info":
      return styles.knownNoInfo;
    case "known_with_info":
      return styles.knownWithInfo;
    case "unable_to_provide":
      return styles.unableToProvide;
    default:
      return {};
  }
};

export const LAResponsePDF = ({
  referenceId,
  applicantName,
  dateOfBirth,
  localAuthority,
  laEmail,
  sentAt,
  completedAt,
  responseData,
  requestData,
}: LAResponsePDFProps) => {
  const roleLabels: Record<string, string> = {
    childminder: "Childminder",
    household_member: "Household Member",
    assistant: "Assistant",
    manager: "Manager",
    nominated_individual: "Nominated Individual",
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Local Authority Children's Services Check Response</Text>
          <Text style={styles.subtitle}>Reference: {referenceId}</Text>
        </View>

        {/* Request Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Request Information</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Local Authority:</Text>
            <Text style={styles.value}>{localAuthority}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>LA Email:</Text>
            <Text style={styles.value}>{laEmail}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Request Sent:</Text>
            <Text style={styles.value}>{formatDate(sentAt)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Response Received:</Text>
            <Text style={styles.value}>{formatDate(completedAt)}</Text>
          </View>
        </View>

        {/* Applicant Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Applicant Details</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Full Name:</Text>
            <Text style={styles.value}>{applicantName}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Date of Birth:</Text>
            <Text style={styles.value}>{formatDate(dateOfBirth)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Role Applied For:</Text>
            <Text style={styles.value}>{roleLabels[requestData?.role || ''] || requestData?.role || 'N/A'}</Text>
          </View>
          {requestData?.currentAddress && (
            <View style={styles.row}>
              <Text style={styles.label}>Current Address:</Text>
              <Text style={styles.value}>
                {requestData.currentAddress.line1}
                {requestData.currentAddress.line2 ? `, ${requestData.currentAddress.line2}` : ''}
                , {requestData.currentAddress.town}, {requestData.currentAddress.postcode}
              </Text>
            </View>
          )}
        </View>

        {/* LA Response */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Local Authority Response</Text>
          <View style={styles.responseBox}>
            <Text style={[styles.responseType, getResponseStyle(responseData.responseType)]}>
              {getResponseTypeLabel(responseData.responseType)}
            </Text>
            <View style={styles.row}>
              <Text style={styles.label}>Check Completed:</Text>
              <Text style={styles.value}>{formatDate(responseData.checkCompletedDate)}</Text>
            </View>
          </View>

          {/* Relevant Information (if applicable) */}
          {responseData.responseType === 'known_with_info' && responseData.relevantInformation && (
            <View style={styles.relevantInfoBox}>
              <Text style={{ fontWeight: 'bold', marginBottom: 6, color: '#DC2626' }}>
                Relevant Information:
              </Text>
              <Text>{responseData.relevantInformation}</Text>
            </View>
          )}

          {/* Expected Response Date (if applicable) */}
          {responseData.responseType === 'unable_to_provide' && responseData.expectedResponseDate && (
            <View style={{ ...styles.responseBox, backgroundColor: '#FFFBEB' }}>
              <Text style={{ fontWeight: 'bold', marginBottom: 4 }}>
                Expected Full Response Date:
              </Text>
              <Text>{formatDate(responseData.expectedResponseDate)}</Text>
            </View>
          )}
        </View>

        {/* Responder Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Completed By</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Name:</Text>
            <Text style={styles.value}>{responseData.responderName}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Role/Title:</Text>
            <Text style={styles.value}>{responseData.responderRole}</Text>
          </View>
          {responseData.responderEmail && (
            <View style={styles.row}>
              <Text style={styles.label}>Email:</Text>
              <Text style={styles.value}>{responseData.responderEmail}</Text>
            </View>
          )}
          {responseData.responderPhone && (
            <View style={styles.row}>
              <Text style={styles.label}>Phone:</Text>
              <Text style={styles.value}>{responseData.responderPhone}</Text>
            </View>
          )}
        </View>

        {/* Footer */}
        <Text style={styles.footer}>
          This document was generated by ReadyKids Childminder Agency • Reference: {referenceId} • Generated: {formatDate(new Date().toISOString())}
        </Text>
      </Page>
    </Document>
  );
};
