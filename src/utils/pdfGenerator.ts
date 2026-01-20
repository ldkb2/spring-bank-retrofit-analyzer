import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { AnalysisResults } from '../types';
import { buildingTypeLabels } from '../data/ll97Data';
import { formatCurrency, formatNumber, formatRange } from './calculations';
import { retrofitOptions } from '../data/retrofitOptions';

export function generatePDFReport(results: AnalysisResults): void {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  let yPos = 20;

  const springGreen: [number, number, number] = [46, 170, 78];
  const springGray: [number, number, number] = [107, 107, 107];
  const springGrayDark: [number, number, number] = [74, 74, 74];

  // Helper functions
  const addTitle = (text: string, size: number = 16) => {
    doc.setFontSize(size);
    doc.setTextColor(...springGrayDark);
    doc.setFont('times', 'bold');
    doc.text(text, margin, yPos);
    yPos += size * 0.5;
  };

  // addSubtitle helper reserved for future use
  void springGray; // Mark as used for future subtitle styling

  const addText = (text: string, indent: number = 0) => {
    doc.setFontSize(10);
    doc.setTextColor(...springGrayDark);
    doc.setFont('helvetica', 'normal');
    const lines = doc.splitTextToSize(text, pageWidth - (margin * 2) - indent);
    doc.text(lines, margin + indent, yPos);
    yPos += lines.length * 5;
  };

  const addSpacer = (height: number = 10) => {
    yPos += height;
  };

  const checkPageBreak = (requiredSpace: number = 40) => {
    if (yPos > doc.internal.pageSize.getHeight() - requiredSpace) {
      doc.addPage();
      yPos = 20;
    }
  };

  // --- Header ---
  // Draw green header bar
  doc.setFillColor(...springGreen);
  doc.rect(0, 0, pageWidth, 35, 'F');

  // Title
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('times', 'bold');
  doc.text('spring bank', margin, 18);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text('Building Retrofit Loan Analysis Report', margin, 28);

  yPos = 45;

  // --- Building Information ---
  addTitle('Building Information');
  addSpacer(5);

  const buildingData = [
    ['Address', results.buildingInfo.address],
    ['Building Type', buildingTypeLabels[results.buildingInfo.buildingType]],
    ['Square Footage', formatNumber(results.buildingInfo.squareFootage) + ' sq ft'],
    ['Year Built', results.buildingInfo.yearBuilt.toString()],
  ];

  autoTable(doc, {
    startY: yPos,
    head: [],
    body: buildingData,
    theme: 'plain',
    margin: { left: margin },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 50 },
      1: { cellWidth: 100 },
    },
    styles: {
      fontSize: 10,
      cellPadding: 3,
    },
  });

  yPos = (doc as any).lastAutoTable.finalY + 15;

  // --- Executive Summary ---
  checkPageBreak(80);
  addTitle('Executive Summary');
  addSpacer(5);

  const { financialSummary, complianceStatus, postRetrofitCompliance } = results;

  // Draw summary box
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(margin, yPos, pageWidth - margin * 2, 50, 3, 3, 'F');
  yPos += 10;

  const summaryItems = [
    ['Total Investment:', formatRange(financialSummary.totalRetrofitCost, formatCurrency)],
    ['Annual Energy Savings:', formatRange(financialSummary.annualEnergyCostSavings, formatCurrency)],
    ['Simple Payback:', formatRange(financialSummary.simplePayback, (n) => n.toFixed(1) + ' years')],
    ['LL97 Penalty Avoided (2030):', formatCurrency(financialSummary.annualLL97PenaltyAvoidance.year2030) + '/year'],
  ];

  doc.setFontSize(10);
  let xOffset = margin + 10;
  summaryItems.forEach((item, index) => {
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...springGrayDark);
    doc.text(item[0], xOffset, yPos + (index * 10));
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...springGreen);
    doc.text(item[1], xOffset + 70, yPos + (index * 10));
  });

  yPos += 55;

  // --- LL97 Compliance Status ---
  checkPageBreak(80);
  addTitle('LL97 Compliance Status');
  addSpacer(5);

  const complianceData = [
    [
      '2024-2029',
      `${(complianceStatus.threshold2024 * 1000).toFixed(2)} kgCO₂e/sf`,
      complianceStatus.compliant2024 ? 'Compliant' : `Non-Compliant (${formatCurrency(complianceStatus.annualPenalty2024)}/yr)`,
      postRetrofitCompliance.compliant2024 ? 'Compliant' : 'Non-Compliant',
    ],
    [
      '2030-2034',
      `${(complianceStatus.threshold2030 * 1000).toFixed(2)} kgCO₂e/sf`,
      complianceStatus.compliant2030 ? 'Compliant' : `Non-Compliant (${formatCurrency(complianceStatus.annualPenalty2030)}/yr)`,
      postRetrofitCompliance.compliant2030 ? 'Compliant' : 'Non-Compliant',
    ],
    [
      '2035-2039',
      `${(complianceStatus.threshold2035 * 1000).toFixed(2)} kgCO₂e/sf`,
      complianceStatus.compliant2035 ? 'Compliant' : `Non-Compliant (${formatCurrency(complianceStatus.annualPenalty2035)}/yr)`,
      postRetrofitCompliance.compliant2035 ? 'Compliant' : 'Non-Compliant',
    ],
  ];

  autoTable(doc, {
    startY: yPos,
    head: [['Period', 'Limit', 'Current Status', 'After Retrofits']],
    body: complianceData,
    theme: 'striped',
    margin: { left: margin, right: margin },
    headStyles: {
      fillColor: springGreen,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
    },
    styles: {
      fontSize: 9,
      cellPadding: 4,
    },
    columnStyles: {
      0: { cellWidth: 30 },
      1: { cellWidth: 45 },
      2: { cellWidth: 50 },
      3: { cellWidth: 40 },
    },
  });

  yPos = (doc as any).lastAutoTable.finalY + 10;

  // Emissions comparison
  addText(`Current Emissions: ${formatNumber(complianceStatus.currentEmissions, 1)} tCO₂e/year (${(complianceStatus.emissionsIntensity * 1000).toFixed(2)} kgCO₂e/sf)`);
  addText(`After Retrofits: ${formatNumber(postRetrofitCompliance.currentEmissions, 1)} tCO₂e/year (${((complianceStatus.currentEmissions - postRetrofitCompliance.currentEmissions) / complianceStatus.currentEmissions * 100).toFixed(0)}% reduction)`);

  addSpacer(10);

  // --- Selected Retrofit Measures ---
  checkPageBreak(60);
  addTitle('Selected Retrofit Measures');
  addSpacer(5);

  const retrofitData = results.retrofitAnalysis.map((analysis) => {
    const retrofit = retrofitOptions.find((r) => r.id === analysis.retrofitId);
    return [
      retrofit?.name || analysis.retrofitName,
      formatRange(analysis.estimatedCost, formatCurrency),
      formatRange(analysis.annualEnergySavings, formatCurrency),
      formatRange(analysis.paybackPeriod, (n) => n.toFixed(1)) + ' yrs',
    ];
  });

  autoTable(doc, {
    startY: yPos,
    head: [['Measure', 'Est. Cost', 'Annual Savings', 'Payback']],
    body: retrofitData,
    theme: 'striped',
    margin: { left: margin, right: margin },
    headStyles: {
      fillColor: springGreen,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
    },
    styles: {
      fontSize: 9,
      cellPadding: 4,
    },
  });

  yPos = (doc as any).lastAutoTable.finalY + 15;

  // --- Financial Summary ---
  checkPageBreak(60);
  addTitle('Financial Summary');
  addSpacer(5);

  const financialData = [
    ['Total Project Cost', formatRange(financialSummary.totalRetrofitCost, formatCurrency)],
    ['Annual Energy Cost Savings', formatRange(financialSummary.annualEnergyCostSavings, formatCurrency)],
    ['LL97 Penalty Avoidance (2024)', formatCurrency(financialSummary.annualLL97PenaltyAvoidance.year2024) + '/yr'],
    ['LL97 Penalty Avoidance (2030)', formatCurrency(financialSummary.annualLL97PenaltyAvoidance.year2030) + '/yr'],
    ['Simple Payback Period', formatRange(financialSummary.simplePayback, (n) => n.toFixed(1)) + ' years'],
    ['10-Year Net Savings', formatRange(financialSummary.tenYearNetSavings, formatCurrency)],
    ['20-Year Net Savings', formatRange(financialSummary.twentyYearNetSavings, formatCurrency)],
  ];

  autoTable(doc, {
    startY: yPos,
    head: [],
    body: financialData,
    theme: 'plain',
    margin: { left: margin },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 70 },
      1: { cellWidth: 80 },
    },
    styles: {
      fontSize: 10,
      cellPadding: 3,
    },
  });

  yPos = (doc as any).lastAutoTable.finalY + 15;

  // --- Financing Recommendations ---
  checkPageBreak(100);
  addTitle('Financing Recommendations');
  addSpacer(5);

  results.loanRecommendations.forEach((loan, index) => {
    checkPageBreak(50);

    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...springGrayDark);
    doc.text(`${index + 1}. ${loan.loanType}${loan.suitability === 'excellent' ? ' (Recommended)' : ''}`, margin, yPos);
    yPos += 6;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...springGray);
    const descLines = doc.splitTextToSize(loan.description, pageWidth - margin * 2);
    doc.text(descLines, margin, yPos);
    yPos += descLines.length * 5 + 3;

    doc.setFont('helvetica', 'italic');
    doc.text(`Terms: ${loan.typicalTerms}`, margin, yPos);
    yPos += 10;
  });

  // --- Footer ---
  doc.addPage();
  yPos = 20;

  addTitle('Disclaimer');
  addSpacer(5);
  addText('This analysis provides estimates for informational purposes only. Actual costs, savings, and compliance outcomes may vary based on building-specific conditions, contractor pricing, utility rates, and other factors. Consult with qualified professionals for detailed assessments. Spring Bank does not guarantee any specific outcomes.');

  addSpacer(20);

  addTitle('About Spring Bank');
  addSpacer(5);
  addText('Spring Bank is a community development financial institution (CDFI) dedicated to serving underbanked communities and promoting sustainable development. We offer a range of green lending products to help building owners improve energy efficiency and comply with local environmental regulations.');

  addSpacer(10);
  addText('Contact us: www.spring.bank');

  // Add page numbers
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(...springGray);
    doc.text(
      `Page ${i} of ${pageCount}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
    doc.text(
      `Generated on ${new Date().toLocaleDateString()}`,
      pageWidth - margin,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'right' }
    );
  }

  // Save the PDF
  const fileName = `SpringBank_Retrofit_Analysis_${results.buildingInfo.address.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 30)}_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
}
