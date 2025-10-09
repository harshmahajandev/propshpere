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

  const waitForCharts = async (): Promise<void> => {
    return new Promise((resolve) => {
      // Wait for charts to fully render
      setTimeout(() => {
        // Force re-render of any SVG elements
        const svgElements = document.querySelectorAll('svg')
        svgElements.forEach(svg => {
          const rect = svg.getBoundingClientRect()
          if (rect.width > 0 && rect.height > 0) {
            // Trigger a style recalculation
            svg.style.opacity = '0.99'
            setTimeout(() => {
              svg.style.opacity = '1'
            }, 50)
          }
        })
        resolve()
      }, 1000)
    })
  }

  const exportToPDF = async () => {
    if (isExporting) return
    
    setIsExporting(true)
    
    try {
      const element = document.getElementById(reportElementId)
      if (!element) {
        throw new Error('Report content not found')
      }
      
      // Wait for charts to be fully rendered
      await waitForCharts()
      
      // Hide any elements that shouldn't be in the PDF
      const elementsToHide = element.querySelectorAll('.no-print, .group:hover > *, [data-no-print="true"]')
      const originalStyles: Array<{ element: HTMLElement; display: string }> = []
      
      elementsToHide.forEach(el => {
        const htmlEl = el as HTMLElement
        originalStyles.push({ element: htmlEl, display: htmlEl.style.display })
        htmlEl.style.display = 'none'
      })
      
      // Prepare element for better PDF rendering
      const originalElementStyle = {
        transform: element.style.transform,
        transformOrigin: element.style.transformOrigin,
        position: element.style.position
      }
      
      element.style.transform = 'none'
      element.style.transformOrigin = 'top left'
      element.style.position = 'relative'
      
      const canvas = await html2canvas(element, {
        scale: 3, // Higher scale for better quality
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        foreignObjectRendering: true, // Better SVG support
        imageTimeout: 15000,
        onclone: (clonedDoc) => {
          // Ensure proper styling in cloned document
          const clonedElement = clonedDoc.getElementById(reportElementId)
          if (clonedElement) {
            clonedElement.style.fontFamily = 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
            clonedElement.style.color = '#000000'
            clonedElement.style.background = '#ffffff'
            clonedElement.style.transform = 'none'
            clonedElement.style.position = 'relative'
          }
          
          // Ensure SVG charts are properly styled
          const svgElements = clonedDoc.querySelectorAll('svg')
          svgElements.forEach(svg => {
            svg.style.background = 'transparent'
            svg.setAttribute('style', svg.getAttribute('style') + '; background: transparent;')
          })
          
          // Fix any Recharts specific styling issues
          const rechartElements = clonedDoc.querySelectorAll('.recharts-wrapper, .recharts-surface')
          rechartElements.forEach(el => {
            (el as HTMLElement).style.background = 'transparent'
          })
        }
      })
      
      // Restore original element styles
      element.style.transform = originalElementStyle.transform
      element.style.transformOrigin = originalElementStyle.transformOrigin
      element.style.position = originalElementStyle.position
      
      const pdf = new jsPDF('p', 'mm', 'a4')
      const imgData = canvas.toDataURL('image/png', 1.0)
      const imgWidth = 210 // A4 width in mm
      const pageHeight = 295 // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width
      const maxHeightPerPage = pageHeight - 50 // Leave space for header/footer
      
      // Add header
      pdf.setFontSize(24)
      pdf.setTextColor(30, 58, 138) // Blue color
      pdf.text(reportTitle, 20, 25)
      
      pdf.setFontSize(11)
      pdf.setTextColor(100, 100, 100)
      pdf.text(`Generated on: ${format(new Date(), 'PPPP')}`, 20, 35)
      
      // Draw a line under header
      pdf.setDrawColor(200, 200, 200)
      pdf.line(20, 40, 190, 40)
      
      // Calculate how to split the image across pages
      let currentHeight = 0
      let pageCount = 1
      
      while (currentHeight < imgHeight) {
        if (pageCount > 1) {
          pdf.addPage()
          
          // Add header to subsequent pages
          pdf.setFontSize(16)
          pdf.setTextColor(30, 58, 138)
          pdf.text(`${reportTitle} (continued)`, 20, 20)
          
          pdf.setDrawColor(200, 200, 200)
          pdf.line(20, 25, 190, 25)
        }
        
        const sourceY = currentHeight
        const sourceHeight = Math.min(maxHeightPerPage * (canvas.width / imgWidth), imgHeight - currentHeight)
        const destHeight = sourceHeight * (imgWidth / canvas.width)
        
        // Create a temporary canvas for this page section
        const tempCanvas = document.createElement('canvas')
        tempCanvas.width = canvas.width
        tempCanvas.height = sourceHeight
        const tempCtx = tempCanvas.getContext('2d')
        
        if (tempCtx) {
          tempCtx.fillStyle = '#ffffff'
          tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height)
          tempCtx.drawImage(canvas, 0, -sourceY)
          
          const tempImgData = tempCanvas.toDataURL('image/png', 1.0)
          pdf.addImage(tempImgData, 'PNG', 0, pageCount === 1 ? 45 : 30, imgWidth, destHeight)
        }
        
        currentHeight += sourceHeight
        pageCount++
      }
      
      // Add footer to all pages
      const totalPages = pdf.internal.getNumberOfPages()
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i)
        pdf.setFontSize(9)
        pdf.setTextColor(150, 150, 150)
        
        // Footer line
        pdf.setDrawColor(200, 200, 200)
        pdf.line(20, pageHeight - 15, 190, pageHeight - 15)
        
        pdf.text(
          `Page ${i} of ${totalPages}`,
          imgWidth - 30,
          pageHeight - 8
        )
        pdf.text(
          'Diyar Property Management System | Confidential',
          20,
          pageHeight - 8
        )
        pdf.text(
          format(new Date(), 'dd/MM/yyyy HH:mm'),
          imgWidth / 2 - 15,
          pageHeight - 8
        )
      }
      
      // Restore hidden elements
      originalStyles.forEach(({ element, display }) => {
        element.style.display = display
      })
      
      const fileName = `${reportTitle.toLowerCase().replace(/\s+/g, '-')}-${format(new Date(), 'yyyy-MM-dd-HHmm')}.pdf`
      pdf.save(fileName)
      
      toast.success(`${reportTitle} exported successfully!`)
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