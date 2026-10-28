import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

export interface PdfExportOptions {
  filename?: string
  onProgress?: (step: string) => void
}

/**
 * Exporta elementos HTML formatados em páginas A4 para um arquivo PDF vetorial/raster de alta definição.
 */
export async function generateEudrPdf(
  containerEl: HTMLElement,
  options: PdfExportOptions = {}
): Promise<void> {
  const filename = options.filename || `Laudo-EUDR-${Date.now().toString(36).toUpperCase()}.pdf`
  const onProgress = options.onProgress || (() => {})

  onProgress('Buscando páginas do laudo...')
  const pageElements = containerEl.querySelectorAll<HTMLElement>('.pdf-page')

  if (pageElements.length === 0) {
    throw new Error('Nenhuma página de laudo encontrada para exportação.')
  }

  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true,
  })

  // Dimensões A4 em milímetros
  const a4WidthMm = 210
  const a4HeightMm = 297

  for (let i = 0; i < pageElements.length; i++) {
    const page = pageElements[i]
    if (!page) continue

    onProgress(`Processando página ${i + 1} de ${pageElements.length}...`)

    if (i > 0) {
      pdf.addPage()
    }

    // Renderiza a página DOM em alta resolução (scale: 2 para ~200 DPI nítido)
    const canvas = await html2canvas(page, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      windowWidth: 1024,
    })

    const imgData = canvas.toDataURL('image/jpeg', 0.95)
    pdf.addImage(imgData, 'JPEG', 0, 0, a4WidthMm, a4HeightMm, undefined, 'FAST')
  }

  onProgress('Salvando arquivo PDF...')
  pdf.save(filename)
}
