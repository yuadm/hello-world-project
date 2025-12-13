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
    borderBottom: "2pt solid #d97706",
    paddingBottom: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#d97706",
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 11,
    color: "#666",
  },
  section: {
    marginBottom: 20,
    borderLeft: "3pt solid #d97706",
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
    color: "#d97706",
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
    backgroundColor: "#d97706",
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
  outside_uk_details?: string;
  
  // Section 3
  premises_address?: any;
  local_authority?: string;
  premises_type?: string;
  
  // Section 4
  service_age_groups?: any;
  service_hours?: any;
  
  // Section 5
  first_aid_completed?: string;
  first_aid_provider?: string;
  first_aid_date?: string;
  safeguarding_completed?: string;
  safeguarding_provider?: string;
  safeguarding_date?: string;
  pfa_completed?: string;
  level_2_qualification?: string;
  level_2_provider?: string;
  level_2_date?: string;
  eyfs_completed?: string;
  eyfs_provider?: string;
  eyfs_date?: string;
  other_qualifications?: string;
  has_dbs?: string;
  dbs_number?: string;
  dbs_update_service?: string;
  
  // Section 6
  employment_history?: any;
  employment_gaps?: string;
  
  // Section 7
  reference_1_name?: string;
  reference_1_relationship?: string;
  reference_1_email?: string;
  reference_1_phone?: string;
  reference_1_childcare?: boolean;
  reference_2_name?: string;
  reference_2_relationship?: string;
  reference_2_email?: string;
  reference_2_phone?: string;
  reference_2_childcare?: boolean;
  
  // Section 8
  previous_registration?: string;
  previous_registration_details?: any;
  criminal_history?: string;
  criminal_history_details?: string;
  disqualified?: string;
  social_services?: string;
  social_services_details?: string;
  health_conditions?: string;
  health_conditions_details?: string;
  smoker?: string;
  
  // Section 9
  consent_checks?: boolean;
  declaration_truth?: boolean;
  declaration_notify?: boolean;
  signature_name?: string;
  signature_date?: string;
  
  submitted_at?: string;
}

interface CochildminderFormPDFProps {
  formData: FormData;
  cochildminderName: string;
  applicantName: string;
}

export function CochildminderFormPDF({ formData, cochildminderName, applicantName }: CochildminderFormPDFProps) {
  const formatDate = (date?: string) => {
    if (!date) return "Not provided";
    return new Date(date).toLocaleDateString("en-GB");
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Co-childminder Registration Form</Text>
          <Text style={styles.subtitle}>Co-childminder for: {applicantName}</Text>
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
                  <Text>{addr.line1}</Text>
                  {addr.line2 && <Text>{addr.line2}</Text>}
                  <Text>{addr.town}, {addr.postcode}</Text>
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
          {formData.outside_uk_details && (
            <View style={styles.card}>
              <Text>{formData.outside_uk_details}</Text>
            </View>
          )}
        </View>

        {/* Section 3: Premises */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. Premises Information</Text>
          
          {formData.premises_address && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Childminding Premises</Text>
              <Text>{formData.premises_address.line1}</Text>
              {formData.premises_address.line2 && <Text>{formData.premises_address.line2}</Text>}
              <Text>{formData.premises_address.town}</Text>
              <Text>{formData.premises_address.postcode}</Text>
            </View>
          )}

          <View style={styles.fieldRow}>
            <Text style={styles.label}>Local Authority:</Text>
            <Text style={styles.value}>{formData.local_authority || "Not provided"}</Text>
          </View>
          <View style={styles.fieldRow}>
            <Text style={styles.label}>Premises Type:</Text>
            <Text style={styles.value}>{formData.premises_type || "Not provided"}</Text>
          </View>
        </View>
      </Page>

      <Page size="A4" style={styles.page}>
        {/* Section 5: Qualifications */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>5. Qualifications & Training</Text>
          
          <View style={{ marginTop: 10 }}>
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
            <Text style={{ fontWeight: "bold", marginBottom: 6 }}>Training</Text>
            <View style={styles.fieldRow}>
              <Text style={styles.label}>First Aid:</Text>
              <Text style={styles.value}>
                {formData.first_aid_completed?.toLowerCase() === "yes" 
                  ? `Completed - ${formData.first_aid_provider || ""} (${formatDate(formData.first_aid_date)})`
                  : "Not completed"}
              </Text>
            </View>
            <View style={styles.fieldRow}>
              <Text style={styles.label}>Safeguarding:</Text>
              <Text style={styles.value}>
                {formData.safeguarding_completed?.toLowerCase() === "yes"
                  ? `Completed - ${formData.safeguarding_provider || ""} (${formatDate(formData.safeguarding_date)})`
                  : "Not completed"}
              </Text>
            </View>
            <View style={styles.fieldRow}>
              <Text style={styles.label}>PFA Training:</Text>
              <Text style={styles.value}>{formData.pfa_completed === "Yes" ? "Yes" : "No"}</Text>
            </View>
            <View style={styles.fieldRow}>
              <Text style={styles.label}>Level 2 Qualification:</Text>
              <Text style={styles.value}>
                {formData.level_2_qualification?.toLowerCase() === "yes"
                  ? `Completed - ${formData.level_2_provider || ""} (${formatDate(formData.level_2_date)})`
                  : "Not completed"}
              </Text>
            </View>
            <View style={styles.fieldRow}>
              <Text style={styles.label}>EYFS Training:</Text>
              <Text style={styles.value}>
                {formData.eyfs_completed?.toLowerCase() === "yes"
                  ? `Completed - ${formData.eyfs_provider || ""} (${formatDate(formData.eyfs_date)})`
                  : "Not completed"}
              </Text>
            </View>
          </View>

          {formData.other_qualifications && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Other Qualifications</Text>
              <Text>{formData.other_qualifications}</Text>
            </View>
          )}
        </View>

        {/* Section 6: Employment History */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>6. Employment History</Text>
          
          {formData.employment_history && Array.isArray(formData.employment_history) && formData.employment_history.length > 0 ? (
            formData.employment_history.map((job: any, idx: number) => (
              <View key={idx} style={styles.card}>
                <Text style={styles.cardTitle}>{job.employer}</Text>
                <Text>{job.role}</Text>
                <Text style={{ fontSize: 8, color: "#666" }}>
                  {formatDate(job.startDate)} to {formatDate(job.endDate)}
                </Text>
                {job.reasonForLeaving && (
                  <Text style={{ fontSize: 9, marginTop: 4 }}>Reason: {job.reasonForLeaving}</Text>
                )}
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

        {/* Section 7: References */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>7. References</Text>
          
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Reference 1</Text>
            <View style={styles.fieldRow}>
              <Text style={styles.label}>Name:</Text>
              <Text style={styles.value}>{formData.reference_1_name || "Not provided"}</Text>
            </View>
            <View style={styles.fieldRow}>
              <Text style={styles.label}>Relationship:</Text>
              <Text style={styles.value}>{formData.reference_1_relationship || "Not provided"}</Text>
            </View>
            <View style={styles.fieldRow}>
              <Text style={styles.label}>Email:</Text>
              <Text style={styles.value}>{formData.reference_1_email || "Not provided"}</Text>
            </View>
            <View style={styles.fieldRow}>
              <Text style={styles.label}>Childcare Reference:</Text>
              <Text style={styles.value}>{formData.reference_1_childcare ? "Yes" : "No"}</Text>
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Reference 2</Text>
            <View style={styles.fieldRow}>
              <Text style={styles.label}>Name:</Text>
              <Text style={styles.value}>{formData.reference_2_name || "Not provided"}</Text>
            </View>
            <View style={styles.fieldRow}>
              <Text style={styles.label}>Relationship:</Text>
              <Text style={styles.value}>{formData.reference_2_relationship || "Not provided"}</Text>
            </View>
            <View style={styles.fieldRow}>
              <Text style={styles.label}>Email:</Text>
              <Text style={styles.value}>{formData.reference_2_email || "Not provided"}</Text>
            </View>
            <View style={styles.fieldRow}>
              <Text style={styles.label}>Childcare Reference:</Text>
              <Text style={styles.value}>{formData.reference_2_childcare ? "Yes" : "No"}</Text>
            </View>
          </View>
        </View>
      </Page>

      <Page size="A4" style={styles.page}>
        {/* Section 8: Suitability */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>8. Suitability Checks</Text>
          
          <View style={styles.fieldRow}>
            <Text style={styles.label}>Previous Registration:</Text>
            <Text style={styles.value}>{formData.previous_registration || "No"}</Text>
          </View>

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

        {/* Section 9: Declaration */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>9. Declaration</Text>
          
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
          <Text>Co-childminder Registration Form: {cochildminderName}</Text>
          <Text>Generated: {new Date().toLocaleDateString("en-GB")} at {new Date().toLocaleTimeString("en-GB")}</Text>
        </View>
      </Page>
    </Document>
  );
}
