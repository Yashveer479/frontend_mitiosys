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

const waitForAssets = async (element) => {
    if (typeof document !== 'undefined' && document.fonts?.ready) {
        try {
            await document.fonts.ready;
        } catch {
            // Ignore font loading failures and proceed with best effort.
        }
    }

    const images = Array.from(element.querySelectorAll('img'));
    await Promise.all(
        images.map(async (img) => {
            if (img.complete && img.naturalWidth > 0) {
                return;
            }

            try {
                if (img.decode) {
                    await img.decode();
                }
            } catch {
                await new Promise((resolve) => {
                    const onDone = () => resolve();
                    img.addEventListener('load', onDone, { once: true });
                    img.addEventListener('error', onDone, { once: true });
                });
            }
        })
    );
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

const addHtmlToPdf = (element, fileName) =>
    new Promise((resolve, reject) => {
        try {
            const pdf = new jsPDF('p', 'mm', 'a4');
            pdf.html(element, {
                margin: [8, 8, 8, 8],
                autoPaging: 'text',
                html2canvas: {
                    useCORS: true,
                    scale: 1,
                    logging: false,
                    backgroundColor: '#ffffff'
                },
                callback: (doc) => {
                    try {
                        doc.save(fileName);
                        resolve();
                    } catch (saveErr) {
                        reject(saveErr);
                    }
                }
            });
        } catch (err) {
            reject(err);
        }
    });

export const exportElementToPdf = async (element, fileName) => {
    if (!element) {
        throw new Error('No printable element found.');
    }

    await waitForAssets(element);

    const renderModes = [
        { foreignObjectRendering: false, label: 'standard' },
        { foreignObjectRendering: true, label: 'foreignObject' }
    ];

    let lastError = null;

    for (const mode of renderModes) {
        try {
            const canvas = await html2canvas(element, buildCanvasOptions(mode.foreignObjectRendering));

            if (!canvas || canvas.width === 0 || canvas.height === 0) {
                throw new Error(`Rendered canvas is empty using ${mode.label} mode.`);
            }

            addCanvasToPdf(canvas, fileName);
            return;
        } catch (error) {
            lastError = error;
            console.warn(`PDF export failed in ${mode.label} mode:`, error);
        }
    }

    try {
        await addHtmlToPdf(element, fileName);
        return;
    } catch (htmlError) {
        console.warn('PDF export failed in jsPDF.html fallback mode:', htmlError);
    }

    throw lastError || new Error('PDF export failed in all render modes.');
};