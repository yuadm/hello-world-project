import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: "Helvetica",
    fontSize: 10,
    lineHeight: 1.5,
  },
  header: {
    marginBottom: 20,
    borderBottom: "2pt solid #9333ea",
    paddingBottom: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#9333ea",
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 11,
    color: "#666",
  },
  section: {
    marginBottom: 20,
    borderLeft: "3pt solid #9333ea",
    paddingLeft: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#1a1a1a",
  },
  fieldRow: {
    flexDirection: "row",
    marginBottom: 8,
  },
  label: {
    width: "35%",
    fontWeight: "bold",
    color: "#333",
  },
  value: {
    width: "65%",
    color: "#1a1a1a",
  },
  card: {
    backgroundColor: "#f5f5f5",
    padding: 12,
    marginBottom: 10,
    borderRadius: 4,
  },
  cardTitle: {
    fontSize: 11,
    fontWeight: "bold",
    marginBottom: 6,
    color: "#9333ea",
  },
  checkbox: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  checkboxBox: {
    width: 12,
    height: 12,
    border: "1pt solid #333",
    marginRight: 6,
    backgroundColor: "#fff",
  },
  checkboxChecked: {
    backgroundColor: "#9333ea",
  },
  checkboxLabel: {
    flex: 1,
    fontSize: 9,
  },
  footer: {
    marginTop: 30,
    paddingTop: 15,
    borderTop: "1pt solid #ccc",
    fontSize: 8,
    color: "#666",
    textAlign: "center",
  },
});

interface FormData {
  // Section 1
  title?: string;
  first_name?: string;
  middle_names?: string;
  last_name?: string;
  previous_names?: any;
  date_of_birth?: string;
  birth_town?: string;
  sex?: string;
  ni_number?: string;
  
  // Section 2
  current_address?: any;
  address_history?: any;
  lived_outside_uk?: string;
  
  // Section 3
  employment_history?: any;
  employment_gaps?: string;
  
  // Section 4
  previous_registration?: string;
  previous_registration_details?: any;
  has_dbs?: string;
  dbs_number?: string;
  dbs_update_service?: string;
  pfa_completed?: string;
  safeguarding_completed?: string;
  criminal_history?: string;
  criminal_history_details?: string;
  disqualified?: string;
  social_services?: string;
  social_services_details?: string;
  
  // Section 5
  health_conditions?: string;
  health_conditions_details?: string;
  smoker?: string;
  
  // Section 6
  consent_checks?: boolean;
  declaration_truth?: boolean;
  declaration_notify?: boolean;
  signature_name?: string;
  signature_date?: string;
  
  submitted_at?: string;
}

interface AssistantFormPDFProps {
  formData: FormData;
  assistantName: string;
  assistantRole: string;
  applicantName: string;
}

export function AssistantFormPDF({ formData, assistantName, assistantRole, applicantName }: AssistantFormPDFProps) {
  const formatDate = (date?: string) => {
    if (!date) return "Not provided";
    return new Date(date).toLocaleDateString("en-GB");
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>CMA-A1 Suitability Check Form</Text>
          <Text style={styles.subtitle}>Assistant/Co-childminder for: {applicantName}</Text>
          <Text style={styles.subtitle}>Role: {assistantRole}</Text>
          <Text style={styles.subtitle}>Submitted: {formatDate(formData.submitted_at)}</Text>
        </View>

        {/* Section 1: Personal Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. Personal Details</Text>
          <View style={styles.fieldRow}>
            <Text style={styles.label}>Full Name:</Text>
            <Text style={styles.value}>
              {formData.title} {formData.first_name} {formData.middle_names} {formData.last_name}
            </Text>
          </View>
          <View style={styles.fieldRow}>
            <Text style={styles.label}>Date of Birth:</Text>
            <Text style={styles.value}>{formatDate(formData.date_of_birth)}</Text>
          </View>
          <View style={styles.fieldRow}>
            <Text style={styles.label}>Place of Birth:</Text>
            <Text style={styles.value}>{formData.birth_town || "Not provided"}</Text>
          </View>
          <View style={styles.fieldRow}>
            <Text style={styles.label}>Sex:</Text>
            <Text style={styles.value}>{formData.sex || "Not provided"}</Text>
          </View>
          <View style={styles.fieldRow}>
            <Text style={styles.label}>NI Number:</Text>
            <Text style={styles.value}>{formData.ni_number || "Not provided"}</Text>
          </View>

          {formData.previous_names && Array.isArray(formData.previous_names) && formData.previous_names.length > 0 && (
            <View style={{ marginTop: 10 }}>
              <Text style={{ fontWeight: "bold", marginBottom: 6 }}>Previous Names:</Text>
              {formData.previous_names.map((name: any, idx: number) => (
                <View key={idx} style={styles.card}>
                  <Text>{name.fullName}</Text>
                  <Text style={{ fontSize: 8, color: "#666" }}>
                    {formatDate(name.dateFrom)} to {formatDate(name.dateTo)}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Section 2: Address History */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. Address History</Text>
          
          {formData.current_address && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Current Address</Text>
              <Text>{formData.current_address.line1}</Text>
              {formData.current_address.line2 && <Text>{formData.current_address.line2}</Text>}
              <Text>{formData.current_address.town}</Text>
              <Text>{formData.current_address.postcode}</Text>
              <Text style={{ fontSize: 8, color: "#666", marginTop: 4 }}>
                Moved in: {formatDate(formData.current_address.moveIn)}
              </Text>
            </View>
          )}

          {formData.address_history && Array.isArray(formData.address_history) && formData.address_history.length > 0 && (
            <View style={{ marginTop: 10 }}>
              <Text style={{ fontWeight: "bold", marginBottom: 6 }}>Previous Addresses:</Text>
              {formData.address_history.map((addr: any, idx: number) => (
                <View key={idx} style={styles.card}>
                  <Text>{addr.address}</Text>
                  <Text style={{ fontSize: 8, color: "#666" }}>
                    {formatDate(addr.moveIn)} to {formatDate(addr.moveOut)}
                  </Text>
                </View>
              ))}
            </View>
          )}

          <View style={styles.fieldRow}>
            <Text style={styles.label}>Lived Outside UK:</Text>
            <Text style={styles.value}>{formData.lived_outside_uk || "No"}</Text>
          </View>
        </View>
      </Page>

      <Page size="A4" style={styles.page}>
        {/* Section 3: Employment History */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. Employment History</Text>
          
          {formData.employment_history && Array.isArray(formData.employment_history) && formData.employment_history.length > 0 ? (
            formData.employment_history.map((job: any, idx: number) => (
              <View key={idx} style={styles.card}>
                <Text style={styles.cardTitle}>{job.employer}</Text>
                <Text>{job.position}</Text>
                <Text style={{ fontSize: 8, color: "#666" }}>
                  {formatDate(job.startDate)} to {job.isCurrent ? "Present" : formatDate(job.endDate)}
                </Text>
              </View>
            ))
          ) : (
            <Text>No employment history provided</Text>
          )}

          <View style={styles.fieldRow}>
            <Text style={styles.label}>Employment Gaps:</Text>
            <Text style={styles.value}>{formData.employment_gaps || "None"}</Text>
          </View>
        </View>

        {/* Section 4: Vetting Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>4. Vetting & Professional Background</Text>
          
          <View style={styles.fieldRow}>
            <Text style={styles.label}>Previous Registration:</Text>
            <Text style={styles.value}>{formData.previous_registration || "No"}</Text>
          </View>

          <View style={{ marginTop: 15 }}>
            <Text style={{ fontWeight: "bold", marginBottom: 6 }}>Training</Text>
            <View style={styles.fieldRow}>
              <Text style={styles.label}>PFA Training:</Text>
              <Text style={styles.value}>{formData.pfa_completed || "Not completed"}</Text>
            </View>
            <View style={styles.fieldRow}>
              <Text style={styles.label}>Safeguarding:</Text>
              <Text style={styles.value}>{formData.safeguarding_completed || "Not completed"}</Text>
            </View>
          </View>

          <View style={{ marginTop: 15 }}>
            <Text style={{ fontWeight: "bold", marginBottom: 6 }}>DBS Certificate</Text>
            <View style={styles.fieldRow}>
              <Text style={styles.label}>Has DBS:</Text>
              <Text style={styles.value}>{formData.has_dbs || "No"}</Text>
            </View>
            {formData.dbs_number && (
              <>
                <View style={styles.fieldRow}>
                  <Text style={styles.label}>DBS Number:</Text>
                  <Text style={styles.value}>{formData.dbs_number}</Text>
                </View>
                <View style={styles.fieldRow}>
                  <Text style={styles.label}>Update Service:</Text>
                  <Text style={styles.value}>{formData.dbs_update_service || "Not subscribed"}</Text>
                </View>
              </>
            )}
          </View>

          <View style={{ marginTop: 15 }}>
            <Text style={{ fontWeight: "bold", marginBottom: 6 }}>Suitability Checks</Text>
            <View style={styles.fieldRow}>
              <Text style={styles.label}>Criminal History:</Text>
              <Text style={styles.value}>{formData.criminal_history || "No"}</Text>
            </View>
            {formData.criminal_history_details && (
              <View style={styles.card}>
                <Text>{formData.criminal_history_details}</Text>
              </View>
            )}

            <View style={styles.fieldRow}>
              <Text style={styles.label}>Disqualified:</Text>
              <Text style={styles.value}>{formData.disqualified || "No"}</Text>
            </View>

            <View style={styles.fieldRow}>
              <Text style={styles.label}>Social Services:</Text>
              <Text style={styles.value}>{formData.social_services || "No"}</Text>
            </View>
            {formData.social_services_details && (
              <View style={styles.card}>
                <Text>{formData.social_services_details}</Text>
              </View>
            )}
          </View>
        </View>
      </Page>

      <Page size="A4" style={styles.page}>
        {/* Section 5: Health & Lifestyle */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>5. Health & Lifestyle</Text>
          
          <View style={styles.fieldRow}>
            <Text style={styles.label}>Health Conditions:</Text>
            <Text style={styles.value}>{formData.health_conditions || "No"}</Text>
          </View>
          {formData.health_conditions_details && (
            <View style={styles.card}>
              <Text>{formData.health_conditions_details}</Text>
            </View>
          )}

          <View style={styles.fieldRow}>
            <Text style={styles.label}>Smoker:</Text>
            <Text style={styles.value}>{formData.smoker || "Not specified"}</Text>
          </View>
        </View>

        {/* Section 6: Declaration */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>6. Declaration</Text>
          
          <View style={styles.checkbox}>
            <View style={[styles.checkboxBox, formData.consent_checks && styles.checkboxChecked]} />
            <Text style={styles.checkboxLabel}>
              I consent to all necessary checks being carried out
            </Text>
          </View>

          <View style={styles.checkbox}>
            <View style={[styles.checkboxBox, formData.declaration_truth && styles.checkboxChecked]} />
            <Text style={styles.checkboxLabel}>
              I declare that the information provided is true, accurate, and complete
            </Text>
          </View>

          <View style={styles.checkbox}>
            <View style={[styles.checkboxBox, formData.declaration_notify && styles.checkboxChecked]} />
            <Text style={styles.checkboxLabel}>
              I understand I must notify of any changes to this information
            </Text>
          </View>

          <View style={{ marginTop: 15 }}>
            <View style={styles.fieldRow}>
              <Text style={styles.label}>Signature:</Text>
              <Text style={styles.value}>{formData.signature_name || "Not provided"}</Text>
            </View>
            <View style={styles.fieldRow}>
              <Text style={styles.label}>Date:</Text>
              <Text style={styles.value}>{formatDate(formData.signature_date)}</Text>
            </View>
          </View>
        </View>

        <View style={styles.footer}>
          <Text>CMA-A1 Suitability Check Form - {assistantRole}: {assistantName}</Text>
          <Text>Generated: {new Date().toLocaleDateString("en-GB")} at {new Date().toLocaleTimeString("en-GB")}</Text>
        </View>
      </Page>
    </Document>
  );
}
