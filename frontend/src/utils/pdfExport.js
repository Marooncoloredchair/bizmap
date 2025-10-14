import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

export const exportToPDF = async (data, selectedLocation) => {
  try {
    // Create a new PDF document
    const pdf = new jsPDF('p', 'mm', 'a4')
    const pageWidth = pdf.internal.pageSize.getWidth()
    const pageHeight = pdf.internal.pageSize.getHeight()
    let yPosition = 20

    // Helper function to add text with word wrapping
    const addText = (text, x, y, maxWidth, fontSize = 12, color = '#000000') => {
      pdf.setFontSize(fontSize)
      pdf.setTextColor(color)
      const lines = pdf.splitTextToSize(text, maxWidth)
      pdf.text(lines, x, y)
      return y + (lines.length * fontSize * 0.4)
    }

    // Helper function to add a section header
    const addSectionHeader = (text, y) => {
      pdf.setFillColor(220, 38, 38) // Red background
      pdf.rect(10, y - 5, pageWidth - 20, 8, 'F')
      pdf.setTextColor(255, 255, 255)
      pdf.setFontSize(14)
      pdf.setFont(undefined, 'bold')
      pdf.text(text, 15, y + 2)
      pdf.setTextColor(0, 0, 0)
      pdf.setFont(undefined, 'normal')
      return y + 15
    }

    // Helper function to add a metric row
    const addMetricRow = (label, value, y, color = '#000000') => {
      const labelY = addText(label, 15, y, pageWidth - 30, 10, '#666666')
      const valueY = addText(value, 15, labelY + 2, pageWidth - 30, 12, color)
      return valueY + 5
    }

    // Title
    pdf.setFontSize(24)
    pdf.setTextColor(220, 38, 38)
    pdf.setFont(undefined, 'bold')
    pdf.text('BizMap Analysis Report', 15, yPosition)
    yPosition += 15

    // Subtitle
    pdf.setFontSize(12)
    pdf.setTextColor(100, 100, 100)
    pdf.setFont(undefined, 'normal')
    pdf.text(`Generated on ${new Date().toLocaleDateString()}`, 15, yPosition)
    yPosition += 20

    // Business Information Section
    yPosition = addSectionHeader('Business Information', yPosition)
    yPosition = addMetricRow('Business Type', data.business, yPosition)
    yPosition = addMetricRow('Location', data.location, yPosition)
    yPosition = addMetricRow('Search Radius', data.radius, yPosition)
    yPosition = addMetricRow('Price Tier', data.priceTier, yPosition)
    yPosition = addMetricRow('Daypart', data.daypart, yPosition)
    yPosition += 10

    // Location Analysis Section
    yPosition = addSectionHeader('Location Analysis', yPosition)
    yPosition = addMetricRow('Recommended Area', selectedLocation?.name || 'N/A', yPosition)
    
    const score = selectedLocation?.score || 0
    const scoreColor = score >= 70 ? '#16a34a' : score >= 50 ? '#ca8a04' : '#dc2626'
    const scoreLabel = score >= 70 ? 'Very Promising' : score >= 50 ? 'Moderate' : 'Needs Validation'
    yPosition = addMetricRow('Opportunity Score', `${score}% (${scoreLabel})`, yPosition, scoreColor)
    yPosition += 10

    // Metrics Section
    yPosition = addSectionHeader('Key Metrics', yPosition)
    const metrics = selectedLocation?.metrics || {}
    yPosition = addMetricRow('Population', metrics.population?.toLocaleString() || 'N/A', yPosition)
    yPosition = addMetricRow('Competitors', `${metrics.competitors || 0} within radius`, yPosition)
    yPosition = addMetricRow('Median Income', `$${metrics.median_income?.toLocaleString() || 'N/A'}`, yPosition)
    yPosition = addMetricRow('Foot Traffic Index', `${metrics.foot_traffic_index || 0}/100`, yPosition)
    yPosition = addMetricRow('Vacancy Index', `${metrics.vacancy_index || 0}/100`, yPosition)
    yPosition = addMetricRow('Nearest Competitor', `${metrics.nearest_competitor_miles?.toFixed(1) || 'N/A'} miles`, yPosition)
    yPosition += 10

    // Subscores Section
    if (selectedLocation?.subscores) {
      yPosition = addSectionHeader('Detailed Analysis', yPosition)
      const subscores = selectedLocation.subscores
      yPosition = addMetricRow('Competition Score', `${Math.round(subscores.competitor_penalty * 100)}%`, yPosition)
      yPosition = addMetricRow('Demand Score', `${Math.round(subscores.demand_score * 100)}%`, yPosition)
      yPosition = addMetricRow('Income Score', `${Math.round(subscores.income_score * 100)}%`, yPosition)
      yPosition = addMetricRow('Traffic Score', `${Math.round(subscores.traffic_score * 100)}%`, yPosition)
      yPosition = addMetricRow('Vacancy Score', `${Math.round(subscores.vacancy_score * 100)}%`, yPosition)
      yPosition = addMetricRow('Market Fit', `${Math.round(subscores.category_fit * 100)}%`, yPosition)
      yPosition = addMetricRow('Exclusivity Score', `${Math.round(subscores.nearest_distance_score * 100)}%`, yPosition)
      yPosition += 10
    }

    // Next Steps Section
    yPosition = addSectionHeader('Recommended Next Steps', yPosition)
    const nextSteps = [
      'Run a 2-week customer willingness-to-pay survey in the neighborhood',
      'Pull a 30-day foot traffic report (Placer.ai / SafeGraph)',
      'Contact local commercial realtor for vacant storefronts'
    ]
    
    nextSteps.forEach((step, index) => {
      yPosition = addText(`${index + 1}. ${step}`, 15, yPosition, pageWidth - 30, 10)
      yPosition += 3
    })

    // Footer
    yPosition = pageHeight - 20
    pdf.setFontSize(8)
    pdf.setTextColor(100, 100, 100)
    pdf.text('Generated by BizMap - Business Location Analysis Tool', 15, yPosition)
    pdf.text('www.bizmap.com', pageWidth - 50, yPosition)

    // Save the PDF
    const fileName = `bizmap-analysis-${data.business.replace(/\s+/g, '-')}-${data.location.replace(/\s+/g, '-')}.pdf`
    pdf.save(fileName)

    return true
  } catch (error) {
    console.error('Error generating PDF:', error)
    throw new Error('Failed to generate PDF report')
  }
}

export const exportMapToPDF = async (mapElementId) => {
  try {
    const mapElement = document.getElementById(mapElementId)
    if (!mapElement) {
      throw new Error('Map element not found')
    }

    const canvas = await html2canvas(mapElement, {
      backgroundColor: '#ffffff',
      scale: 2,
      useCORS: true
    })

    const imgData = canvas.toDataURL('image/png')
    const pdf = new jsPDF('l', 'mm', 'a4')
    const pageWidth = pdf.internal.pageSize.getWidth()
    const pageHeight = pdf.internal.pageSize.getHeight()
    
    const imgWidth = pageWidth - 20
    const imgHeight = (canvas.height * imgWidth) / canvas.width
    
    if (imgHeight > pageHeight - 20) {
      const ratio = (pageHeight - 20) / imgHeight
      const finalWidth = imgWidth * ratio
      const finalHeight = imgHeight * ratio
      pdf.addImage(imgData, 'PNG', 10, 10, finalWidth, finalHeight)
    } else {
      pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight)
    }

    const fileName = `bizmap-map-${new Date().toISOString().split('T')[0]}.pdf`
    pdf.save(fileName)

    return true
  } catch (error) {
    console.error('Error exporting map to PDF:', error)
    throw new Error('Failed to export map to PDF')
  }
}
