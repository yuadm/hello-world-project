import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";
import { ChildminderApplication } from "@/types/childminder";

// Modern color palette matching web design
const colors = {
  primary: "#3B82F6",
  background: "#FFFFFF",
  cardBg: "#F5F5F5",
  textPrimary: "#000000",
  textMuted: "#666666",
  textSubtle: "#999999",
  border: "#DDDDDD",
  borderAccent: "#3B82F6",
};

// Create modern styles matching web view
const styles = StyleSheet.create({
  page: {
    paddingTop: 50,
    paddingBottom: 40,
    paddingHorizontal: 40,
    fontSize: 10,
    fontFamily: "Helvetica",
    backgroundColor: colors.background,
    color: colors.textPrimary,
  },
  header: {
    marginBottom: 30,
  },
  brandName: {
    fontSize: 10,
    color: colors.textMuted,
    marginBottom: 8,
  },
  applicantName: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 6,
    color: colors.textPrimary,
  },
  headerMeta: {
    fontSize: 9,
    color: colors.textMuted,
    marginBottom: 3,
  },
  statusBadge: {
    marginTop: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: colors.cardBg,
    borderRadius: 4,
    fontSize: 9,
    alignSelf: "flex-start",
    textTransform: "capitalize",
  },
  
  // Section styles with left accent
  section: {
    marginBottom: 20,
    borderLeft: "3 solid #3B82F6",
    paddingLeft: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 12,
    color: colors.textPrimary,
  },
  
  // Data layout
  dataRow: {
    marginBottom: 8,
  },
  dataGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 8,
  },
  dataGridItem: {
    width: "50%",
    marginBottom: 8,
  },
  dataLabel: {
    fontSize: 9,
    color: colors.textMuted,
    marginBottom: 2,
  },
  dataValue: {
    fontSize: 10,
    color: colors.textPrimary,
  },
  
  // Card styles for repeated items
  card: {
    backgroundColor: colors.cardBg,
    padding: 10,
    marginBottom: 8,
    borderRadius: 4,
  },
  cardTitle: {
    fontSize: 10,
    fontWeight: "bold",
    marginBottom: 6,
    color: colors.textPrimary,
  },
  cardSubtitle: {
    fontSize: 9,
    color: colors.textMuted,
    marginBottom: 4,
  },
  cardText: {
    fontSize: 9,
    color: colors.textPrimary,
    marginBottom: 3,
  },
  
  // Subsection styles
  subsection: {
    marginTop: 12,
    marginBottom: 8,
  },
  subsectionTitle: {
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 8,
    color: colors.textPrimary,
  },
  
  // Footer
  footer: {
    position: "absolute",
    bottom: 20,
    left: 40,
    right: 40,
    textAlign: "center",
    fontSize: 8,
    color: colors.textSubtle,
    borderTop: "1 solid #DDDDDD",
    paddingTop: 8,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  
  // Declaration styles
  checkboxRow: {
    flexDirection: "row",
    marginBottom: 6,
    alignItems: "flex-start",
  },
  checkbox: {
    width: 10,
    height: 10,
    border: "1 solid #666666",
    marginRight: 6,
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
  },
  checkboxText: {
    fontSize: 9,
    flex: 1,
    color: colors.textPrimary,
  },
  
  // Qualification grid
  qualGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  qualGridItem: {
    width: "48%",
  },
});

interface ApplicationPDFProps {
  application: Partial<ChildminderApplication>;
  applicationId: string;
  submittedDate: string;
  status: string;
}

export const ApplicationPDF = ({ application, applicationId, submittedDate, status }: ApplicationPDFProps) => {
  // Helper function to format dates in MMMM dd, yyyy format
  const formatDate = (dateString: string | undefined): string => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "N/A";
      
      const months = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"];
      
      return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
    } catch {
      return "N/A";
    }
  };

  const formatDateTime = (dateString: string | undefined): string => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "N/A";
      
      const months = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"];
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      
      return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()} at ${hours}:${minutes}`;
    } catch {
      return "N/A";
    }
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Modern Header */}
        <View style={styles.header}>
          <Text style={styles.brandName}>Ready Kids</Text>
          <Text style={styles.applicantName}>
            {application.title} {application.firstName} {application.middleNames || ""} {application.lastName}
          </Text>
          <Text style={styles.headerMeta}>
            Submitted on {formatDateTime(submittedDate)}
          </Text>
          <Text style={styles.headerMeta}>Application ID: {applicationId}</Text>
          <View style={styles.statusBadge}>
            <Text>{status}</Text>
          </View>
        </View>

        {/* Section 1: Personal Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. Personal Details</Text>
          
          <View style={styles.dataGrid}>
            <View style={styles.dataGridItem}>
              <Text style={styles.dataLabel}>Title</Text>
              <Text style={styles.dataValue}>{application.title || "N/A"}</Text>
            </View>
            
            <View style={styles.dataGridItem}>
              <Text style={styles.dataLabel}>First Name</Text>
              <Text style={styles.dataValue}>{application.firstName || "N/A"}</Text>
            </View>
            
            <View style={styles.dataGridItem}>
              <Text style={styles.dataLabel}>Middle Names</Text>
              <Text style={styles.dataValue}>{application.middleNames || "N/A"}</Text>
            </View>
            
            <View style={styles.dataGridItem}>
              <Text style={styles.dataLabel}>Last Name</Text>
              <Text style={styles.dataValue}>{application.lastName || "N/A"}</Text>
            </View>
            
            <View style={styles.dataGridItem}>
              <Text style={styles.dataLabel}>Gender</Text>
              <Text style={styles.dataValue}>{application.gender || "N/A"}</Text>
            </View>
            
            <View style={styles.dataGridItem}>
              <Text style={styles.dataLabel}>Date of Birth</Text>
              <Text style={styles.dataValue}>{formatDate(application.dob)}</Text>
            </View>
            
            <View style={styles.dataGridItem}>
              <Text style={styles.dataLabel}>Right to Work</Text>
              <Text style={styles.dataValue}>{application.rightToWork || "N/A"}</Text>
            </View>
            
            <View style={styles.dataGridItem}>
              <Text style={styles.dataLabel}>National Insurance Number</Text>
              <Text style={styles.dataValue}>{application.niNumber || "N/A"}</Text>
            </View>
            
            <View style={styles.dataGridItem}>
              <Text style={styles.dataLabel}>Email</Text>
              <Text style={styles.dataValue}>{application.email || "N/A"}</Text>
            </View>
            
            <View style={styles.dataGridItem}>
              <Text style={styles.dataLabel}>Mobile Phone</Text>
              <Text style={styles.dataValue}>{application.phone || "N/A"}</Text>
            </View>
          </View>

          {application.previousNames && application.previousNames.length > 0 && (
            <View style={styles.subsection}>
              <Text style={styles.dataLabel}>Previous Names</Text>
              {application.previousNames.map((name, index) => (
                <Text key={index} style={styles.dataValue}>
                  {name.fullName} <Text style={styles.dataLabel}>({name.dateFrom} to {name.dateTo})</Text>
                </Text>
              ))}
            </View>
          )}
        </View>

        {/* Section 2: Address History */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. Address History</Text>
          
          <View style={styles.dataRow}>
            <Text style={styles.dataLabel}>Current Address</Text>
            <Text style={styles.dataValue}>
              {application.homeAddress?.line1 || "N/A"}
              {application.homeAddress?.line2 && `, ${application.homeAddress.line2}`}
              {"\n"}{application.homeAddress?.town || ""}
              {"\n"}{application.homeAddress?.postcode || ""}
            </Text>
          </View>
          
          <View style={styles.dataRow}>
            <Text style={styles.dataLabel}>Moved in</Text>
            <Text style={styles.dataValue}>{application.homeMoveIn || "N/A"}</Text>
          </View>

          {application.addressHistory && application.addressHistory.length > 0 && (
            <View style={styles.subsection}>
              <Text style={styles.dataLabel}>Previous Addresses (5 Year History)</Text>
              {application.addressHistory.map((addr, index) => (
                <View key={index} style={styles.card}>
                  <Text style={styles.cardTitle}>
                    {addr.address?.line1}, {addr.address?.town}, {addr.address?.postcode}
                  </Text>
                  <Text style={styles.cardSubtitle}>
                    Moved in: {addr.moveIn} | Moved out: {addr.moveOut}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {application.addressGaps && (
            <View style={styles.dataRow}>
              <Text style={styles.dataLabel}>Explanation for Address Gaps</Text>
              <Text style={styles.dataValue}>{application.addressGaps}</Text>
            </View>
          )}

          <View style={styles.dataGrid}>
            <View style={styles.dataGridItem}>
              <Text style={styles.dataLabel}>Lived Outside UK</Text>
              <Text style={styles.dataValue}>{application.livedOutsideUK || "N/A"}</Text>
            </View>
            
            <View style={styles.dataGridItem}>
              <Text style={styles.dataLabel}>Lived on Military Base</Text>
              <Text style={styles.dataValue}>{application.militaryBase || "N/A"}</Text>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text>Application ID: {applicationId}</Text>
          <Text>Ready Kids</Text>
          <Text render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} />
        </View>
      </Page>

      <Page size="A4" style={styles.page}>
        {/* Section 3: Premises */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. Premises</Text>
          
          <View style={styles.dataGrid}>
            <View style={styles.dataGridItem}>
              <Text style={styles.dataLabel}>Local Authority</Text>
              <Text style={styles.dataValue}>{application.localAuthority || "N/A"}</Text>
            </View>
            
            <View style={styles.dataGridItem}>
              <Text style={styles.dataLabel}>Premises Type</Text>
              <Text style={styles.dataValue}>{application.premisesType || "N/A"}</Text>
            </View>
            
            <View style={styles.dataGridItem}>
              <Text style={styles.dataLabel}>Same as Home Address</Text>
              <Text style={styles.dataValue}>{application.sameAddress || "N/A"}</Text>
            </View>
          </View>

          {application.childcareAddress && application.sameAddress === "No" && (
            <View style={styles.dataRow}>
              <Text style={styles.dataLabel}>Childcare Address</Text>
              <Text style={styles.dataValue}>
                {application.childcareAddress?.line1 || "N/A"}
                {application.childcareAddress?.line2 && `, ${application.childcareAddress.line2}`}
                {"\n"}{application.childcareAddress?.town || ""}
                {"\n"}{application.childcareAddress?.postcode || ""}
              </Text>
            </View>
          )}

          <View style={styles.dataGrid}>
            <View style={styles.dataGridItem}>
              <Text style={styles.dataLabel}>Additional Premises</Text>
              <Text style={styles.dataValue}>{application.useAdditionalPremises || "N/A"}</Text>
            </View>
            
            <View style={styles.dataGridItem}>
              <Text style={styles.dataLabel}>Outdoor Space</Text>
              <Text style={styles.dataValue}>{application.outdoorSpace || "N/A"}</Text>
            </View>
            
            <View style={styles.dataGridItem}>
              <Text style={styles.dataLabel}>Pets</Text>
              <Text style={styles.dataValue}>{application.pets || "N/A"}</Text>
            </View>
          </View>

          {application.petsDetails && (
            <View style={styles.dataRow}>
              <Text style={styles.dataLabel}>Pet Details</Text>
              <Text style={styles.dataValue}>{application.petsDetails}</Text>
            </View>
          )}
        </View>

        {/* Section 4: Service Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>4. Service Details</Text>
          
          <View style={styles.dataRow}>
            <Text style={styles.dataLabel}>Age Groups</Text>
            <Text style={styles.dataValue}>{application.ageGroups?.join(", ") || "N/A"}</Text>
          </View>
          
          <View style={styles.dataRow}>
            <Text style={styles.dataLabel}>Work With Others</Text>
            <Text style={styles.dataValue}>{application.workWithOthers || "N/A"}</Text>
          </View>

          {application.workWithOthers === "Yes" && (
            <View style={styles.dataRow}>
              <Text style={styles.dataLabel}>Number of Assistants</Text>
              <Text style={styles.dataValue}>{application.numberOfAssistants || 0}</Text>
            </View>
          )}
          
          <View style={styles.dataRow}>
            <Text style={styles.dataLabel}>Proposed Capacity</Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 4 }}>
              <Text style={styles.dataValue}>Under 1: {application.proposedUnder1 || 0}</Text>
              <Text style={styles.dataValue}>Under 5: {application.proposedUnder5 || 0}</Text>
              <Text style={styles.dataValue}>5-8 years: {application.proposed5to8 || 0}</Text>
              <Text style={styles.dataValue}>8+ years: {application.proposed8plus || 0}</Text>
            </View>
          </View>

          {application.childcareTimes && application.childcareTimes.length > 0 && (
            <View style={styles.dataRow}>
              <Text style={styles.dataLabel}>Childcare Times</Text>
              <Text style={styles.dataValue}>{application.childcareTimes.join(", ")}</Text>
            </View>
          )}
          
          <View style={styles.dataRow}>
            <Text style={styles.dataLabel}>Overnight Care</Text>
            <Text style={styles.dataValue}>{application.overnightCare || "N/A"}</Text>
          </View>

          {application.assistants && application.assistants.length > 0 && (
            <View style={styles.subsection}>
              <Text style={styles.subsectionTitle}>Assistants & Co-childminders</Text>
              {application.assistants.map((person, index) => (
                <View key={index} style={styles.card}>
                  <Text style={styles.cardTitle}>{person.firstName} {person.lastName}</Text>
                  <View style={styles.qualGrid}>
                    <View style={styles.qualGridItem}>
                      <Text style={styles.cardSubtitle}>Role</Text>
                      <Text style={styles.cardText}>Assistant</Text>
                    </View>
                    <View style={styles.qualGridItem}>
                      <Text style={styles.cardSubtitle}>Date of Birth</Text>
                      <Text style={styles.cardText}>{formatDate(person.dob)}</Text>
                    </View>
                    <View style={styles.qualGridItem}>
                      <Text style={styles.cardSubtitle}>Email</Text>
                      <Text style={styles.cardText}>{person.email || "N/A"}</Text>
                    </View>
                    <View style={styles.qualGridItem}>
                      <Text style={styles.cardSubtitle}>Mobile</Text>
                      <Text style={styles.cardText}>{person.phone || "N/A"}</Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Section 5: Qualifications & Training */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>5. Qualifications & Training</Text>

          <View style={styles.subsection}>
            <Text style={styles.dataLabel}>First Aid Training</Text>
            <View style={styles.card}>
              <View style={styles.qualGrid}>
                <View style={styles.qualGridItem}>
                  <Text style={[styles.cardSubtitle, { marginBottom: 2 }]}>Completed</Text>
                  <Text style={styles.cardText}>{application.firstAid?.completed || "No"}</Text>
                </View>
                
                {application.firstAid?.completed === "Yes" && (
                  <>
                    <View style={styles.qualGridItem}>
                      <Text style={[styles.cardSubtitle, { marginBottom: 2 }]}>Provider</Text>
                      <Text style={styles.cardText}>{application.firstAid.provider || "N/A"}</Text>
                    </View>
                    <View style={styles.qualGridItem}>
                      <Text style={[styles.cardSubtitle, { marginBottom: 2 }]}>Completion Date</Text>
                      <Text style={styles.cardText}>{application.firstAid.completionDate || "N/A"}</Text>
                    </View>
                    <View style={styles.qualGridItem}>
                      <Text style={[styles.cardSubtitle, { marginBottom: 2 }]}>Certificate Number</Text>
                      <Text style={styles.cardText}>{application.firstAid.certificateNumber || "N/A"}</Text>
                    </View>
                  </>
                )}
              </View>
            </View>
          </View>

          {application.safeguarding && (
            <View style={styles.subsection}>
              <Text style={styles.dataLabel}>Safeguarding Training</Text>
              <View style={styles.card}>
                <View style={styles.qualGrid}>
                  <View style={styles.qualGridItem}>
                    <Text style={[styles.cardSubtitle, { marginBottom: 2 }]}>Completed</Text>
                    <Text style={styles.cardText}>{application.safeguarding.completed || "No"}</Text>
                  </View>
                  
                  {application.safeguarding.completed === "Yes" && (
                    <>
                      <View style={styles.qualGridItem}>
                        <Text style={[styles.cardSubtitle, { marginBottom: 2 }]}>Provider</Text>
                        <Text style={styles.cardText}>{application.safeguarding.provider || "N/A"}</Text>
                      </View>
                      <View style={styles.qualGridItem}>
                        <Text style={[styles.cardSubtitle, { marginBottom: 2 }]}>Completion Date</Text>
                        <Text style={styles.cardText}>{application.safeguarding.completionDate || "N/A"}</Text>
                      </View>
                      <View style={styles.qualGridItem}>
                        <Text style={[styles.cardSubtitle, { marginBottom: 2 }]}>Certificate Number</Text>
                        <Text style={styles.cardText}>{application.safeguarding.certificateNumber || "N/A"}</Text>
                      </View>
                    </>
                  )}
                </View>
              </View>
            </View>
          )}

          {application.eyfsChildminding && (
            <View style={styles.subsection}>
              <Text style={styles.dataLabel}>EYFS Childminding Training</Text>
              <View style={styles.card}>
                <View style={styles.qualGrid}>
                  <View style={styles.qualGridItem}>
                    <Text style={[styles.cardSubtitle, { marginBottom: 2 }]}>Completed</Text>
                    <Text style={styles.cardText}>{application.eyfsChildminding.completed || "No"}</Text>
                  </View>
                  
                  {application.eyfsChildminding.completed === "Yes" && (
                    <>
                      <View style={styles.qualGridItem}>
                        <Text style={[styles.cardSubtitle, { marginBottom: 2 }]}>Provider</Text>
                        <Text style={styles.cardText}>{application.eyfsChildminding.provider || "N/A"}</Text>
                      </View>
                      <View style={styles.qualGridItem}>
                        <Text style={[styles.cardSubtitle, { marginBottom: 2 }]}>Completion Date</Text>
                        <Text style={styles.cardText}>{application.eyfsChildminding.completionDate || "N/A"}</Text>
                      </View>
                      <View style={styles.qualGridItem}>
                        <Text style={[styles.cardSubtitle, { marginBottom: 2 }]}>Certificate Number</Text>
                        <Text style={styles.cardText}>{application.eyfsChildminding.certificateNumber || "N/A"}</Text>
                      </View>
                    </>
                  )}
                </View>
              </View>
            </View>
          )}

          {application.level2Qual && (
            <View style={styles.subsection}>
              <Text style={styles.dataLabel}>Level 2 Qualification</Text>
              <View style={styles.card}>
                <View style={styles.qualGrid}>
                  <View style={styles.qualGridItem}>
                    <Text style={[styles.cardSubtitle, { marginBottom: 2 }]}>Completed</Text>
                    <Text style={styles.cardText}>{application.level2Qual.completed || "No"}</Text>
                  </View>
                  
                  {application.level2Qual.completed === "Yes" && (
                    <>
                      <View style={styles.qualGridItem}>
                        <Text style={[styles.cardSubtitle, { marginBottom: 2 }]}>Provider</Text>
                        <Text style={styles.cardText}>{application.level2Qual.provider || "N/A"}</Text>
                      </View>
                      <View style={styles.qualGridItem}>
                        <Text style={[styles.cardSubtitle, { marginBottom: 2 }]}>Completion Date</Text>
                        <Text style={styles.cardText}>{application.level2Qual.completionDate || "N/A"}</Text>
                      </View>
                      <View style={styles.qualGridItem}>
                        <Text style={[styles.cardSubtitle, { marginBottom: 2 }]}>Certificate Number</Text>
                        <Text style={styles.cardText}>{application.level2Qual.certificateNumber || "N/A"}</Text>
                      </View>
                    </>
                  )}
                </View>
              </View>
            </View>
          )}
        </View>

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text>Application ID: {applicationId}</Text>
          <Text>Ready Kids</Text>
          <Text render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} />
        </View>
      </Page>

      <Page size="A4" style={styles.page}>
        {/* Section 6: Employment History */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>6. Employment History</Text>
          {application.employmentHistory && application.employmentHistory.length > 0 ? (
            application.employmentHistory.map((job, index) => (
              <View key={index} style={styles.card}>
                <Text style={styles.cardTitle}>{job.role} at {job.employer}</Text>
                <Text style={styles.cardSubtitle}>
                  {job.startDate} - {job.endDate}
                </Text>
                <Text style={styles.cardText}>
                  Reason for leaving: {job.reasonForLeaving}
                </Text>
              </View>
            ))
          ) : (
            <Text style={styles.dataValue}>No employment history provided</Text>
          )}

          {application.employmentGaps && (
            <View style={styles.dataRow}>
              <Text style={styles.dataLabel}>Explanation for Employment Gaps</Text>
              <Text style={styles.dataValue}>{application.employmentGaps}</Text>
            </View>
          )}

          <View style={styles.dataRow}>
            <Text style={styles.dataLabel}>Volunteered with Children</Text>
            <Text style={styles.dataValue}>{application.childVolunteered || "N/A"}</Text>
          </View>

          <View style={styles.subsection}>
            <Text style={styles.subsectionTitle}>References</Text>
            
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Reference 1</Text>
              <View style={styles.qualGrid}>
                <View style={styles.qualGridItem}>
                  <Text style={styles.cardSubtitle}>Name</Text>
                  <Text style={styles.cardText}>{application.reference1Name || "N/A"}</Text>
                </View>
                <View style={styles.qualGridItem}>
                  <Text style={styles.cardSubtitle}>Relationship</Text>
                  <Text style={styles.cardText}>{application.reference1Relationship || "N/A"}</Text>
                </View>
                <View style={styles.qualGridItem}>
                  <Text style={styles.cardSubtitle}>Contact</Text>
                  <Text style={styles.cardText}>{application.reference1Contact || "N/A"}</Text>
                </View>
                <View style={styles.qualGridItem}>
                  <Text style={styles.cardSubtitle}>Childcare Related</Text>
                  <Text style={styles.cardText}>{application.reference1ChildcareRole || "N/A"}</Text>
                </View>
              </View>
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Reference 2</Text>
              <View style={styles.qualGrid}>
                <View style={styles.qualGridItem}>
                  <Text style={styles.cardSubtitle}>Name</Text>
                  <Text style={styles.cardText}>{application.reference2Name || "N/A"}</Text>
                </View>
                <View style={styles.qualGridItem}>
                  <Text style={styles.cardSubtitle}>Relationship</Text>
                  <Text style={styles.cardText}>{application.reference2Relationship || "N/A"}</Text>
                </View>
                <View style={styles.qualGridItem}>
                  <Text style={styles.cardSubtitle}>Contact</Text>
                  <Text style={styles.cardText}>{application.reference2Contact || "N/A"}</Text>
                </View>
                <View style={styles.qualGridItem}>
                  <Text style={styles.cardSubtitle}>Childcare Related</Text>
                  <Text style={styles.cardText}>{application.reference2ChildcareRole || "N/A"}</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Section 7: Household Members */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>7. Household Members</Text>

          <View style={styles.dataRow}>
            <Text style={styles.dataLabel}>Adults in Home</Text>
            <Text style={styles.dataValue}>{application.adultsInHome || "N/A"}</Text>
          </View>

          {application.adults && application.adults.length > 0 && (
            <View style={styles.subsection}>
              <Text style={styles.subsectionTitle}>Adults in Household</Text>
              {application.adults.map((person, index) => (
                <View key={index} style={styles.card}>
                  <Text style={styles.cardTitle}>{person.fullName}</Text>
                  <Text style={styles.cardSubtitle}>Relationship: {person.relationship}</Text>
                  <Text style={styles.cardText}>Date of Birth: {formatDate(person.dob)}</Text>
                </View>
              ))}
            </View>
          )}

          <View style={styles.dataRow}>
            <Text style={styles.dataLabel}>Children in Home</Text>
            <Text style={styles.dataValue}>{application.childrenInHome || "N/A"}</Text>
          </View>

          {application.children && application.children.length > 0 && (
            <View style={styles.subsection}>
              <Text style={styles.subsectionTitle}>Children in Household</Text>
              {application.children.map((child, index) => (
                <View key={index} style={styles.card}>
                  <Text style={styles.cardTitle}>{child.fullName}</Text>
                  <Text style={styles.cardText}>Date of Birth: {formatDate(child.dob)}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text>Application ID: {applicationId}</Text>
          <Text>Ready Kids</Text>
          <Text render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} />
        </View>
      </Page>

      <Page size="A4" style={styles.page}>
        {/* Section 8: Suitability & Background */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>8. Suitability & Background</Text>
          
          <View style={styles.subsection}>
            <Text style={styles.subsectionTitle}>Previous Registrations</Text>
            
            <View style={styles.dataGrid}>
              <View style={styles.dataGridItem}>
                <Text style={styles.dataLabel}>Previously Registered with Ofsted</Text>
                <Text style={styles.dataValue}>{application.prevRegOfsted || "N/A"}</Text>
              </View>
              
              <View style={styles.dataGridItem}>
                <Text style={styles.dataLabel}>Previously Registered with Agency</Text>
                <Text style={styles.dataValue}>{application.prevRegAgency || "N/A"}</Text>
              </View>
              
              <View style={styles.dataGridItem}>
                <Text style={styles.dataLabel}>Other UK Registration</Text>
                <Text style={styles.dataValue}>{application.prevRegOtherUK || "N/A"}</Text>
              </View>
              
              <View style={styles.dataGridItem}>
                <Text style={styles.dataLabel}>EU Registration</Text>
                <Text style={styles.dataValue}>{application.prevRegEU || "N/A"}</Text>
              </View>
            </View>

            {application.prevRegOfstedDetails && application.prevRegOfstedDetails.length > 0 && (
              <View style={styles.subsection}>
                <Text style={styles.dataLabel}>Ofsted Registration Details</Text>
                {application.prevRegOfstedDetails.map((reg, index) => (
                  <View key={index} style={styles.card}>
                    <Text style={styles.cardText}>Regulator: {reg.regulator}</Text>
                    <Text style={styles.cardText}>Registration Number: {reg.registrationNumber}</Text>
                    <Text style={styles.cardText}>Start Date: {reg.startDate}</Text>
                    <Text style={styles.cardText}>End Date: {reg.endDate || "Still registered"}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>

          <View style={styles.dataGrid}>
            <View style={styles.dataGridItem}>
              <Text style={styles.dataLabel}>Health Condition</Text>
              <Text style={styles.dataValue}>{application.healthCondition || "N/A"}</Text>
            </View>
            
            <View style={styles.dataGridItem}>
              <Text style={styles.dataLabel}>Smoker</Text>
              <Text style={styles.dataValue}>{application.smoker || "N/A"}</Text>
            </View>
          </View>

          {application.healthConditionDetails && (
            <View style={styles.dataRow}>
              <Text style={styles.dataLabel}>Health Condition Details</Text>
              <Text style={styles.dataValue}>{application.healthConditionDetails}</Text>
            </View>
          )}

          <View style={styles.dataGrid}>
            <View style={styles.dataGridItem}>
              <Text style={styles.dataLabel}>Disqualified from Childcare</Text>
              <Text style={styles.dataValue}>{application.disqualified || "N/A"}</Text>
            </View>
            
            <View style={styles.dataGridItem}>
              <Text style={styles.dataLabel}>Social Services Involvement</Text>
              <Text style={styles.dataValue}>{application.socialServices || "N/A"}</Text>
            </View>
          </View>

          {application.socialServicesDetails && (
            <View style={styles.dataRow}>
              <Text style={styles.dataLabel}>Social Services Details</Text>
              <Text style={styles.dataValue}>{application.socialServicesDetails}</Text>
            </View>
          )}

          {application.otherCircumstances === "Yes" && application.otherCircumstancesDetails && (
            <View style={styles.dataRow}>
              <Text style={styles.dataLabel}>Other Circumstances</Text>
              <Text style={styles.dataValue}>{application.otherCircumstancesDetails}</Text>
            </View>
          )}

          <View style={styles.subsection}>
            <Text style={styles.subsectionTitle}>DBS Information</Text>
            
            <View style={styles.dataGrid}>
              <View style={styles.dataGridItem}>
                <Text style={styles.dataLabel}>Has DBS Certificate</Text>
                <Text style={styles.dataValue}>{application.hasDBS || "N/A"}</Text>
              </View>
              
              {application.dbsNumber && (
                <View style={styles.dataGridItem}>
                  <Text style={styles.dataLabel}>DBS Number</Text>
                  <Text style={styles.dataValue}>{application.dbsNumber}</Text>
                </View>
              )}
              
              <View style={styles.dataGridItem}>
                <Text style={styles.dataLabel}>Enhanced DBS</Text>
                <Text style={styles.dataValue}>{application.dbsEnhanced || "N/A"}</Text>
              </View>
              
              <View style={styles.dataGridItem}>
                <Text style={styles.dataLabel}>DBS Update Service</Text>
                <Text style={styles.dataValue}>{application.dbsUpdate || "N/A"}</Text>
              </View>
            </View>
          </View>

          <View style={styles.dataRow}>
            <Text style={styles.dataLabel}>Criminal Offence History</Text>
            <Text style={styles.dataValue}>{application.offenceHistory || "N/A"}</Text>
          </View>

          {application.offenceDetails && application.offenceDetails.length > 0 && (
            <View style={styles.subsection}>
              <Text style={styles.dataLabel}>Offence Details</Text>
              {application.offenceDetails.map((offence, index) => (
                <View key={index} style={styles.card}>
                  <Text style={styles.cardTitle}>Offence {index + 1}</Text>
                  <Text style={styles.cardText}>Date: {offence.date}</Text>
                  <Text style={styles.cardText}>Details: {offence.details}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Section 9: Declaration */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>9. Consent & Declaration</Text>
          
          <View style={styles.subsection}>
            <Text style={styles.dataLabel}>A. Consent to Background Checks</Text>
            
            <View style={styles.checkboxRow}>
              <View style={[styles.checkbox, application.consentDBSChecks && styles.checkboxChecked]} />
              <Text style={styles.checkboxText}>
                Consent to DBS, local authority, referees, and GP checks.
              </Text>
            </View>
            
            <View style={styles.checkboxRow}>
              <View style={[styles.checkbox, application.consentLAContact && styles.checkboxChecked]} />
              <Text style={styles.checkboxText}>
                Authorise Ready Kids to contact children's services departments.
              </Text>
            </View>
            
            <View style={styles.checkboxRow}>
              <View style={[styles.checkbox, application.consentLAShare && styles.checkboxChecked]} />
              <Text style={styles.checkboxText}>
                Authorise local authorities to share relevant information.
              </Text>
            </View>
          </View>
          
          <View style={styles.subsection}>
            <Text style={styles.dataLabel}>B. Data Sharing & Use</Text>
            
            <View style={styles.checkboxRow}>
              <View style={[styles.checkbox, application.consentOfstedSharing && styles.checkboxChecked]} />
              <Text style={styles.checkboxText}>
                Data shared with Ofsted and statutory bodies as required.
              </Text>
            </View>
            
            <View style={styles.checkboxRow}>
              <View style={[styles.checkbox, application.consentDataUse && styles.checkboxChecked]} />
              <Text style={styles.checkboxText}>
                Information used for suitability assessment only.
              </Text>
            </View>
            
            <View style={styles.checkboxRow}>
              <View style={[styles.checkbox, application.consentDataProtection && styles.checkboxChecked]} />
              <Text style={styles.checkboxText}>
                Data handled per data protection law and privacy notice.
              </Text>
            </View>
          </View>
          
          <View style={styles.subsection}>
            <Text style={styles.dataLabel}>C. Declarations</Text>
            
            <View style={styles.checkboxRow}>
              <View style={[styles.checkbox, application.declarationTruth && styles.checkboxChecked]} />
              <Text style={styles.checkboxText}>
                Information provided is true, accurate, and complete.
              </Text>
            </View>
            
            <View style={styles.checkboxRow}>
              <View style={[styles.checkbox, application.declarationNotify && styles.checkboxChecked]} />
              <Text style={styles.checkboxText}>
                Will notify Ready Kids of changes within 14 days.
              </Text>
            </View>
          </View>

          <View style={styles.subsection}>
            <Text style={styles.subsectionTitle}>Electronic Signature</Text>
            <View style={styles.card}>
              <View style={styles.qualGrid}>
                <View style={styles.qualGridItem}>
                  <Text style={styles.cardSubtitle}>Full Legal Name</Text>
                  <Text style={styles.cardText}>{application.signatureFullName || "N/A"}</Text>
                </View>
                
                <View style={styles.qualGridItem}>
                  <Text style={styles.cardSubtitle}>Date</Text>
                  <Text style={styles.cardText}>{formatDate(application.signatureDate)}</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text>Application ID: {applicationId}</Text>
          <Text>Ready Kids</Text>
          <Text render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} />
        </View>
      </Page>
    </Document>
  );
};
