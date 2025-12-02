import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 20,
    borderBottom: 2,
    borderColor: '#000',
    paddingBottom: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 11,
    color: '#666',
  },
  section: {
    marginTop: 20,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 10,
    backgroundColor: '#f0f0f0',
    padding: 5,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  label: {
    width: '40%',
    fontWeight: 'bold',
  },
  value: {
    width: '60%',
  },
  addressBox: {
    border: 1,
    borderColor: '#000',
    padding: 10,
    marginBottom: 10,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  checkbox: {
    width: 12,
    height: 12,
    border: 1,
    borderColor: '#000',
    marginRight: 8,
  },
  checkboxChecked: {
    backgroundColor: '#000',
  },
  emptySection: {
    border: 1,
    borderColor: '#ccc',
    padding: 20,
    marginTop: 10,
    backgroundColor: '#fafafa',
  },
  emptySectionText: {
    color: '#999',
    fontSize: 9,
    fontStyle: 'italic',
  },
  footer: {
    marginTop: 30,
    fontSize: 8,
    color: '#666',
    borderTop: 1,
    borderColor: '#ccc',
    paddingTop: 10,
  },
});

interface KnownToOfstedPDFProps {
  applicantName: string;
  previousNames?: Array<{ name: string; dateFrom: string; dateTo: string }>;
  dateOfBirth: string;
  currentAddress: {
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
  role: 'childminder' | 'household_member' | 'assistant' | 'manager' | 'nominated_individual';
  requestDate: string;
  requesterName: string;
  requesterRole: string;
  requireChildInfo: boolean;
  agencyName?: string;
}

export const KnownToOfstedPDF = ({
  applicantName,
  previousNames,
  dateOfBirth,
  currentAddress,
  previousAddresses,
  role,
  requestDate,
  requesterName,
  requesterRole,
  requireChildInfo,
  agencyName = 'Childminder Agency',
}: KnownToOfstedPDFProps) => {
  const roleLabels = {
    childminder: 'Childminder/Sole Proprietor',
    household_member: 'Household Member over 16',
    assistant: 'Assistant',
    manager: 'Manager',
    nominated_individual: 'Nominated Individual',
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Ofsted</Text>
          <Text style={styles.subtitle}>Raising standards, improving lives</Text>
        </View>

        <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 20 }}>
          'Known to Ofsted' Application Form
        </Text>

        {/* Section A: Applicant's Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Section A: Applicant's Details (To be completed by agency)</Text>

          <View style={styles.row}>
            <Text style={styles.label}>Applicant's full name:</Text>
            <Text style={styles.value}>{applicantName}</Text>
          </View>

          {previousNames && previousNames.length > 0 && (
            <View style={styles.row}>
              <Text style={styles.label}>Previous surname(s):</Text>
              <View style={styles.value}>
                {previousNames.map((prev, idx) => (
                  <Text key={idx}>{prev.name} ({prev.dateFrom} to {prev.dateTo})</Text>
                ))}
              </View>
            </View>
          )}

          <View style={styles.row}>
            <Text style={styles.label}>Date of birth:</Text>
            <Text style={styles.value}>{dateOfBirth}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Current address:</Text>
            <View style={styles.addressBox}>
              <Text>{currentAddress.line1}</Text>
              {currentAddress.line2 && <Text>{currentAddress.line2}</Text>}
              <Text>{currentAddress.town}</Text>
              <Text>{currentAddress.postcode}</Text>
              <Text style={{ marginTop: 5, fontSize: 9 }}>Date from: {currentAddress.moveInDate}</Text>
            </View>
          </View>

          {previousAddresses && previousAddresses.length > 0 && (
            <View style={styles.row}>
              <Text style={styles.label}>Previous addresses (last 5 years):</Text>
              <View style={styles.value}>
                {previousAddresses.map((addr, idx) => (
                  <View key={idx} style={styles.addressBox}>
                    <Text>{addr.address}</Text>
                    <Text style={{ fontSize: 9, marginTop: 3 }}>
                      {addr.dateFrom} to {addr.dateTo}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          <View style={styles.row}>
            <Text style={styles.label}>Date of request to Ofsted:</Text>
            <Text style={styles.value}>{requestDate}</Text>
          </View>

          <View style={{ marginTop: 15, marginBottom: 10 }}>
            <Text style={{ fontWeight: 'bold', marginBottom: 8 }}>Applicant's role (please tick):</Text>
            {Object.entries(roleLabels).map(([key, label]) => (
              <View key={key} style={styles.checkboxRow}>
                <View style={[styles.checkbox, role === key && styles.checkboxChecked]} />
                <Text>{label}</Text>
              </View>
            ))}
          </View>

          <View style={{ marginTop: 15, marginBottom: 10 }}>
            <Text style={{ fontWeight: 'bold', marginBottom: 8 }}>
              Is information required on the number and ages of children involved in any past Ofsted judgement?
            </Text>
            <View style={styles.checkboxRow}>
              <View style={[styles.checkbox, requireChildInfo && styles.checkboxChecked]} />
              <Text>Yes</Text>
            </View>
            <View style={styles.checkboxRow}>
              <View style={[styles.checkbox, !requireChildInfo && styles.checkboxChecked]} />
              <Text>No</Text>
            </View>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Name of requester:</Text>
            <Text style={styles.value}>{requesterName}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Role at childminder agency:</Text>
            <Text style={styles.value}>{requesterRole}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Agency name:</Text>
            <Text style={styles.value}>{agencyName}</Text>
          </View>
        </View>

        {/* Section B: For Ofsted to complete */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Section B: For Ofsted to Complete</Text>
          <View style={styles.emptySection}>
            <Text style={styles.emptySectionText}>
              This section will be completed by Ofsted to indicate whether the applicant is known to them.
            </Text>
          </View>
        </View>

        {/* Section C: Additional Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Section C: Additional Information (If applicable)</Text>
          <View style={styles.emptySection}>
            <Text style={styles.emptySectionText}>
              Ofsted will provide relevant information here if the applicant is known to them.
            </Text>
          </View>
        </View>

        {/* Section D: Data Protection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Section D: Data Protection Statement</Text>
          <View style={styles.emptySection}>
            <Text style={styles.emptySectionText}>
              Ofsted will complete this section with relevant data protection information.
            </Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text>Generated: {new Date().toLocaleDateString('en-GB')}</Text>
          <Text>Form version: May 2022</Text>
          <Text style={{ marginTop: 5 }}>
            This form should be sent to: childminder.agencies@ofsted.gov.uk
          </Text>
        </View>
      </Page>
    </Document>
  );
};
