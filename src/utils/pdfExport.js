import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const DEFAULT_SCALE = 2;

const buildCanvasOptions = (useForeignObjectRendering) => ({
    scale: Math.max(window.devicePixelRatio || DEFAULT_SCALE, DEFAULT_SCALE),
    useCORS: true,
    logging: false,
    backgroundColor: '#ffffff',
    foreignObjectRendering: useForeignObjectRendering
});

const isCanvasBlank = (canvas) => {
    if (!canvas || canvas.width === 0 || canvas.height === 0) {
        return true;
    }

    const context = canvas.getContext('2d', { willReadFrequently: true });
    if (!context) {
        return true;
    }

    const sampleCountPerAxis = 10;
    const stepX = Math.max(1, Math.floor(canvas.width / sampleCountPerAxis));
    const stepY = Math.max(1, Math.floor(canvas.height / sampleCountPerAxis));

    let nonWhitePixels = 0;

    for (let y = 0; y < canvas.height; y += stepY) {
        for (let x = 0; x < canvas.width; x += stepX) {
            const pixel = context.getImageData(x, y, 1, 1).data;
            const [r, g, b, a] = pixel;

            const isVisible = a > 10;
            const isNearlyWhite = r > 245 && g > 245 && b > 245;

            if (isVisible && !isNearlyWhite) {
                nonWhitePixels += 1;
                if (nonWhitePixels >= 3) {
                    return false;
                }
            }
        }
    }

    return true;
};

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

    const renderModes = [
        { foreignObjectRendering: false, label: 'standard' },
        { foreignObjectRendering: true, label: 'foreignObject' }
    ];

    let lastError = null;

    for (const mode of renderModes) {
        try {
            const canvas = await html2canvas(element, buildCanvasOptions(mode.foreignObjectRendering));

            if (isCanvasBlank(canvas)) {
                throw new Error(`Rendered canvas is blank using ${mode.label} mode.`);
            }

            addCanvasToPdf(canvas, fileName);
            return;
        } catch (error) {
            lastError = error;
            console.warn(`PDF export failed in ${mode.label} mode:`, error);
        }
    }

    throw lastError || new Error('PDF export failed in all render modes.');
};