import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Download, FileText, Calendar } from 'lucide-react'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import toast from 'react-hot-toast'
import { format } from 'date-fns'
import 'jspdf-autotable'

interface PdfExportButtonProps {
  reportTitle?: string
  reportElementId?: string
  className?: string
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'sm' | 'default' | 'lg'
}

export const PdfExportButton: React.FC<PdfExportButtonProps> = ({
  reportTitle = 'Financial Report',
  reportElementId = 'financial-report-content',
  className = '',
  variant = 'default',
  size = 'default'
}) => {
  const [isExporting, setIsExporting] = useState(false)
  const [exportFormat, setExportFormat] = useState('pdf')

  const exportToPDF = async () => {
    if (isExporting) return
    
    setIsExporting(true)
    
    try {
      const element = document.getElementById(reportElementId)
      if (!element) {
        throw new Error('Report content not found')
      }
      
      // Hide any elements that shouldn't be in the PDF
      const elementsToHide = element.querySelectorAll('.no-print')
      elementsToHide.forEach(el => {
        (el as HTMLElement).style.display = 'none'
      })
      
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        onclone: (clonedDoc) => {
          // Ensure proper styling in cloned document
          const clonedElement = clonedDoc.getElementById(reportElementId)
          if (clonedElement) {
            clonedElement.style.fontFamily = 'Arial, sans-serif'
            clonedElement.style.color = '#000000'
          }
        }
      })
      
      const pdf = new jsPDF('p', 'mm', 'a4')
      const imgData = canvas.toDataURL('image/png')
      const imgWidth = 210 // A4 width in mm
      const pageHeight = 295 // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width
      let heightLeft = imgHeight
      
      let position = 0
      
      // Add header
      pdf.setFontSize(20)
      pdf.setTextColor(40, 40, 40)
      pdf.text(reportTitle, 20, 20)
      
      pdf.setFontSize(12)
      pdf.setTextColor(100, 100, 100)
      pdf.text(`Generated on: ${format(new Date(), 'PPP')}`, 20, 30)
      
      // Add the main content
      position = 40
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
      heightLeft -= (pageHeight - position)
      
      // Add additional pages if needed
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight + 40
        pdf.addPage()
        
        // Add header to subsequent pages
        pdf.setFontSize(14)
        pdf.setTextColor(40, 40, 40)
        pdf.text(`${reportTitle} (continued)`, 20, 20)
        
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
        heightLeft -= pageHeight
      }
      
      // Add footer to all pages
      const totalPages = pdf.internal.getNumberOfPages()
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i)
        pdf.setFontSize(10)
        pdf.setTextColor(150, 150, 150)
        pdf.text(
          `Page ${i} of ${totalPages}`,
          imgWidth - 30,
          pageHeight - 10
        )
        pdf.text(
          'Diyar Property Management System',
          20,
          pageHeight - 10
        )
      }
      
      // Restore hidden elements
      elementsToHide.forEach(el => {
        (el as HTMLElement).style.display = ''
      })
      
      const fileName = `${reportTitle.toLowerCase().replace(/\s+/g, '-')}-${format(new Date(), 'yyyy-MM-dd')}.pdf`
      pdf.save(fileName)
      
      toast.success('Report exported successfully!')
    } catch (error) {
      console.error('Export error:', error)
      toast.error('Failed to export report. Please try again.')
    } finally {
      setIsExporting(false)
    }
  }

  const exportToCSV = async () => {
    try {
      // This would extract table data and convert to CSV
      // For now, we'll show a placeholder
      toast('CSV export feature coming soon!', { icon: 'ℹ️' })
    } catch (error) {
      toast.error('Failed to export CSV')
    }
  }

  const handleExport = async () => {
    switch (exportFormat) {
      case 'pdf':
        await exportToPDF()
        break
      case 'csv':
        await exportToCSV()
        break
      default:
        await exportToPDF()
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Select value={exportFormat} onValueChange={setExportFormat}>
        <SelectTrigger className="w-24">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="pdf">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              PDF
            </div>
          </SelectItem>
          <SelectItem value="csv">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              CSV
            </div>
          </SelectItem>
        </SelectContent>
      </Select>
      
      <Button
        onClick={handleExport}
        disabled={isExporting}
        variant={variant}
        size={size}
        className={`bg-blue-600 hover:bg-blue-700 ${className}`}
      >
        {isExporting ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
            Exporting...
          </>
        ) : (
          <>
            <Download className="h-4 w-4 mr-2" />
            Export {exportFormat.toUpperCase()}
          </>
        )}
      </Button>
    </div>
  )
}

export default PdfExportButton