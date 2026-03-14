import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const DEFAULT_SCALE = 2;

const buildCanvasOptions = (element, useForeignObjectRendering) => ({
    scale: Math.max(window.devicePixelRatio || DEFAULT_SCALE, DEFAULT_SCALE),
    useCORS: true,
    logging: false,
    backgroundColor: '#ffffff',
    foreignObjectRendering: useForeignObjectRendering,
    windowWidth: Math.max(element.scrollWidth, element.clientWidth),
    windowHeight: Math.max(element.scrollHeight, element.clientHeight),
    scrollX: 0,
    scrollY: -window.scrollY
});

const addCanvasToPdf = (canvas, fileName) => {
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    const imgWidth = pageWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let renderedHeight = 0;
    while (renderedHeight < imgHeight) {
        const yPosition = -renderedHeight;
        pdf.addImage(imgData, 'PNG', 0, yPosition, imgWidth, imgHeight, undefined, 'FAST');
        renderedHeight += pageHeight;
        if (renderedHeight < imgHeight) {
            pdf.addPage();
        }
    }

    pdf.save(fileName);
};

export const exportElementToPdf = async (element, fileName) => {
    if (!element) {
        throw new Error('No printable element found.');
    }

    try {
        const canvas = await html2canvas(element, buildCanvasOptions(element, true));
        addCanvasToPdf(canvas, fileName);
    } catch (primaryError) {
        // Fallback capture mode for browsers that fail foreignObject rendering.
        const fallbackCanvas = await html2canvas(element, buildCanvasOptions(element, false));
        addCanvasToPdf(fallbackCanvas, fileName);
        if (primaryError) {
            // Keep a trace in console for diagnostics without blocking users.
            console.warn('PDF export used fallback renderer:', primaryError);
        }
    }
};