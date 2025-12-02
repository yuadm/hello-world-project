import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { format } from 'date-fns';

interface OfstedFormData {
  applicantName: string;
  previousNames?: Array<{
    name: string;
    dateFrom: string;
    dateTo: string;
  }>;
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
  requesterName: string;
  requesterRole: string;
  requireChildInfo: boolean;
  agencyName: string;
}

// Coordinates for Section A fields on page 4 (0-indexed page 3)
// Y coordinates are from bottom of page, X places text in white data cells
const SECTION_A_COORDS = {
  // Applicant's full name field
  applicantName: { x: 170, y: 715 },
  
  // Previous surnames (row below applicant name)
  previousSurnames: { x: 170, y: 690 },
  
  // Date of birth (separate row below previous surnames)
  dateOfBirth: { x: 170, y: 660 },
  
  // Full address (including postcode and date from)
  currentAddress: { x: 170, y: 610 },
  currentAddressDate: { x: 170, y: 585 },
  
  // Previous address(es) - large box area
  previousAddress1: { x: 170, y: 520 },
  previousAddress1DateFrom: { x: 170, y: 490 },
  previousAddress1DateTo: { x: 280, y: 490 },
  
  previousAddress2: { x: 170, y: 460 },
  previousAddress2DateFrom: { x: 170, y: 430 },
  previousAddress2DateTo: { x: 280, y: 430 },
  
  // Date of request to Ofsted
  requestDate: { x: 170, y: 350 },
  
  // Applicant's role(s) - role indicator text
  roleChildminder: { x: 170, y: 305 },
  roleHouseholdMember: { x: 170, y: 290 },
  roleAssistant: { x: 170, y: 275 },
  roleManager: { x: 170, y: 260 },
  roleNominatedIndividual: { x: 170, y: 245 },
  
  // Child information checkboxes (Yes/No)
  childInfoYes: { x: 235, y: 210 },
  childInfoNo: { x: 235, y: 190 },
  
  // Requester details (Name of requester and role at childminder agency)
  requesterName: { x: 170, y: 155 },
  requesterRole: { x: 170, y: 135 },
  agencyName: { x: 170, y: 115 },
};

export async function fillOfstedForm(data: OfstedFormData): Promise<Blob> {
  // Load the original PDF template
  const templateUrl = '/forms/ofsted-known-to-form.pdf';
  const templateBytes = await fetch(templateUrl).then(res => {
    if (!res.ok) throw new Error('Failed to load Ofsted form template');
    return res.arrayBuffer();
  });
  
  const pdfDoc = await PDFDocument.load(templateBytes);
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  
  // Get page 4 (0-indexed = 3) - this is Section A
  const pages = pdfDoc.getPages();
  if (pages.length < 4) {
    throw new Error('PDF template does not have expected pages');
  }
  
  const sectionAPage = pages[3]; // Page 4
  const fontSize = 10;
  const smallFontSize = 9;
  const textColor = rgb(0, 0, 0);
  
  // Helper to draw text
  const drawText = (text: string, x: number, y: number, size = fontSize) => {
    sectionAPage.drawText(text, {
      x,
      y,
      size,
      font,
      color: textColor,
    });
  };
  
  // Helper to draw a checkmark using lines (avoids WinAnsi encoding issues)
  const drawCheckmark = (x: number, y: number) => {
    const checkColor = rgb(0, 0, 0);
    const lineWidth = 1.5;
    
    // Draw a checkmark shape using two lines
    // First line: short downward stroke (left part of check)
    sectionAPage.drawLine({
      start: { x: x + 2, y: y + 4 },
      end: { x: x + 5, y: y + 1 },
      thickness: lineWidth,
      color: checkColor,
    });
    
    // Second line: longer upward stroke (right part of check)
    sectionAPage.drawLine({
      start: { x: x + 5, y: y + 1 },
      end: { x: x + 11, y: y + 8 },
      thickness: lineWidth,
      color: checkColor,
    });
  };
  
  // Format date helper
  const formatDate = (dateStr: string): string => {
    if (!dateStr || dateStr === 'N/A') return '';
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr;
      return format(date, 'dd/MM/yyyy');
    } catch {
      return dateStr;
    }
  };
  
  // Fill in Section A fields
  
  // 1. Applicant's full name
  drawText(data.applicantName, SECTION_A_COORDS.applicantName.x, SECTION_A_COORDS.applicantName.y);
  
  // 2. Previous surnames
  if (data.previousNames && data.previousNames.length > 0) {
    const previousSurnamesText = data.previousNames
      .map(pn => pn.name)
      .join(', ');
    drawText(previousSurnamesText, SECTION_A_COORDS.previousSurnames.x, SECTION_A_COORDS.previousSurnames.y, smallFontSize);
  }
  
  // 3. Date of birth
  drawText(formatDate(data.dateOfBirth), SECTION_A_COORDS.dateOfBirth.x, SECTION_A_COORDS.dateOfBirth.y);
  
  // 4. Current address
  const currentAddrText = [
    data.currentAddress.line1,
    data.currentAddress.line2,
    data.currentAddress.town,
    data.currentAddress.postcode,
  ].filter(Boolean).join(', ');
  
  // Split address if too long
  const maxWidth = 250;
  const addressLines = wrapText(currentAddrText, maxWidth, font, smallFontSize);
  addressLines.forEach((line, idx) => {
    drawText(line, SECTION_A_COORDS.currentAddress.x, SECTION_A_COORDS.currentAddress.y - (idx * 12), smallFontSize);
  });
  
  // Current address move-in date
  drawText(formatDate(data.currentAddress.moveInDate), SECTION_A_COORDS.currentAddressDate.x, SECTION_A_COORDS.currentAddressDate.y, smallFontSize);
  
  // 5. Previous addresses (up to 2)
  if (data.previousAddresses && data.previousAddresses.length > 0) {
    // First previous address
    const addr1 = data.previousAddresses[0];
    const addr1Lines = wrapText(addr1.address, maxWidth, font, smallFontSize);
    addr1Lines.forEach((line, idx) => {
      drawText(line, SECTION_A_COORDS.previousAddress1.x, SECTION_A_COORDS.previousAddress1.y - (idx * 12), smallFontSize);
    });
    drawText(formatDate(addr1.dateFrom), SECTION_A_COORDS.previousAddress1DateFrom.x, SECTION_A_COORDS.previousAddress1DateFrom.y, smallFontSize);
    drawText(formatDate(addr1.dateTo), SECTION_A_COORDS.previousAddress1DateTo.x, SECTION_A_COORDS.previousAddress1DateTo.y, smallFontSize);
    
    // Second previous address if exists
    if (data.previousAddresses.length > 1) {
      const addr2 = data.previousAddresses[1];
      const addr2Lines = wrapText(addr2.address, maxWidth, font, smallFontSize);
      addr2Lines.forEach((line, idx) => {
        drawText(line, SECTION_A_COORDS.previousAddress2.x, SECTION_A_COORDS.previousAddress2.y - (idx * 12), smallFontSize);
      });
      drawText(formatDate(addr2.dateFrom), SECTION_A_COORDS.previousAddress2DateFrom.x, SECTION_A_COORDS.previousAddress2DateFrom.y, smallFontSize);
      drawText(formatDate(addr2.dateTo), SECTION_A_COORDS.previousAddress2DateTo.x, SECTION_A_COORDS.previousAddress2DateTo.y, smallFontSize);
    }
  }
  
  // 6. Date of request (today)
  drawText(format(new Date(), 'dd/MM/yyyy'), SECTION_A_COORDS.requestDate.x, SECTION_A_COORDS.requestDate.y);
  
  // 7. Role checkbox
  const roleMap: Record<string, { x: number; y: number }> = {
    'childminder': SECTION_A_COORDS.roleChildminder,
    'household_member': SECTION_A_COORDS.roleHouseholdMember,
    'assistant': SECTION_A_COORDS.roleAssistant,
    'manager': SECTION_A_COORDS.roleManager,
    'nominated_individual': SECTION_A_COORDS.roleNominatedIndividual,
  };
  
  const roleCoords = roleMap[data.role];
  if (roleCoords) {
    drawCheckmark(roleCoords.x, roleCoords.y);
  }
  
  // 8. Child information Yes/No
  if (data.requireChildInfo) {
    drawCheckmark(SECTION_A_COORDS.childInfoYes.x, SECTION_A_COORDS.childInfoYes.y);
  } else {
    drawCheckmark(SECTION_A_COORDS.childInfoNo.x, SECTION_A_COORDS.childInfoNo.y);
  }
  
  // 9. Requester details
  drawText(data.requesterName, SECTION_A_COORDS.requesterName.x, SECTION_A_COORDS.requesterName.y);
  drawText(data.requesterRole, SECTION_A_COORDS.requesterRole.x, SECTION_A_COORDS.requesterRole.y);
  drawText(data.agencyName, SECTION_A_COORDS.agencyName.x, SECTION_A_COORDS.agencyName.y);
  
  // Save the modified PDF
  const pdfBytes = await pdfDoc.save();
  return new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' });
}

// Helper function to wrap text
function wrapText(text: string, maxWidth: number, font: any, fontSize: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';
  
  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const width = font.widthOfTextAtSize(testLine, fontSize);
    
    if (width > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }
  
  if (currentLine) {
    lines.push(currentLine);
  }
  
  return lines;
}
