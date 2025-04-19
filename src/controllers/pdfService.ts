import fs from 'fs';
import PDFDocument from 'pdfkit';
import { prepFeedbackInterface } from '@/models/prepFeedback.model';


export const generateFeedbackPDF = (feedback: prepFeedbackInterface, logoPath?: string): Promise<Buffer> => {
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument({ margin: 50 });
        const buffers: Uint8Array[] = [];

        const primaryColor = "#0d2d77";
        const secondryColor = '#2cd5f6';

        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => {
            const pdfData = Buffer.concat(buffers);
            resolve(pdfData);
        });
        doc.on('error', reject);

        // Add header with logo
        if (logoPath && fs.existsSync(logoPath)) {
            doc.image(logoPath, 50, 35, { width: 50, });
        }

        doc
            .fillColor(primaryColor) // Brand color
            .fontSize(20)
            .text(`SavyPrep ${feedback.prepType} Feedback Report`, { align: 'center' })
            .fillColor(secondryColor)
            .fontSize(12)
            .text('AI-Powered Preparation for Exams & Interviews', { align: 'center' })
            .moveDown(0.5);

        // Preparation metadata
        doc
            .fillColor('#333333')
            .fontSize(12)
            .text(`Preparation Type: `, { continued: true })
            .text(`${feedback.prepType}`)
            .text(`Session Title: ${feedback.prepTitle}`)
            .text(`Difficulty Level: ${feedback.difficultyLevel}`)
            .text(`Date: ${new Date(feedback.createdAt).toLocaleString()}`)
            .moveDown();

        // Performance summary
        doc
            .fillColor('#333333')
            .fontSize(14)
            .text('Performance Summary', { underline: true })
            .moveDown(0.5);

        doc
            .fillColor(primaryColor)
            .text(`Overall Score: ${feedback.totalScore.toFixed(1)}/100`, { continued: true })
            .fillColor('#666666')
            .text(` (${feedback.answeredQuestions} of ${feedback.totalQuestions} questions answered)`)
            .moveDown(0.5);


        // Score breakdown chart
        if (feedback.feedbackBreakdowns) {
            doc
                .fillColor('#333333')
                .fontSize(12)
                .text('Score Breakdown:', { underline: true })
                .moveDown(0.3);

            feedback.feedbackBreakdowns.forEach(item => {
                const scoreWidth = (item.score / 100) * 200;

                doc
                    .fillColor('#333333')
                    .text(`${item.title}:`)
                    .moveDown(0.1);

                // Score bar
                doc
                    .rect(50, doc.y, 200, 10)
                    .fill('#e0e0e0')
                    .rect(50, doc.y, scoreWidth, 10)
                    .fill(secondryColor)
                    .moveDown(1.3);

                // Comments
                item.comment.forEach(comment => {
                    doc
                        .fillColor(comment.isPositive ? '#4CAF50' : '#F44336')
                        .text(`• ${comment.feedback}`)
                        .moveDown(0.3);
                });
                doc.moveDown(0.5);
            });
        }

        // Questions and Answers section
        doc
            .addPage()
            .fillColor('#333333')
            .fontSize(16)
            .text('Question Review', { align: 'center', underline: true })
            .moveDown(1);

        feedback.questionReviews.forEach((q, i) => {
            doc
                .fillColor('#333333')
                .fontSize(14)
                .text(`Question ${i + 1}: ${q.question}`)
                .moveDown(0.5);

            if (q.options && q.options.length) {
                doc
                    .fillColor('#666666')
                    .fontSize(10)
                    .text('Options: ' + q.options.join(', '))
                    .moveDown(0.5);
            }

            doc
                .fillColor('#333333')
                .fontSize(13)
                .text('Your Answer:')
                .fillColor('#6200ee')
                .text(q.userAnswer)
                .moveDown(0.5);

            doc
                .fillColor('#333333')
                .text(feedback.prepType == "Exam" ? 'Answer:' : 'Suggested Answer:')
                .fillColor(primaryColor) //'#666666'
                .text(q.aiAnswer)
                .moveDown(0.5);

            if (q.explanation) {
                doc
                    .fillColor('#333333')
                    .fontSize(12)
                    .text('Explanation:')
                    .fillColor('#666666')
                    .text(q.explanation)
                    .moveDown(0.5);
            }

            if (q.reference) {
                doc
                    .fillColor('#333333')
                    .fontSize(12)
                    .text('Reference:')
                    .fillColor('#666666')
                    .text(q.reference)
                    .moveDown(0.5);
            }

            doc.moveDown(1);
        });

        // Feedback summary
        doc
            .addPage()
            .fillColor('#333333')
            .fontSize(16)
            .text('Feedback Summary', { align: 'center', underline: true })
            .moveDown(1);

        if (feedback.strengths.length) {
            doc
                .fillColor('#333333')
                .fontSize(15)
                .text('Strengths:')
                .moveDown(0.3);
            
            feedback.strengths.forEach(strength => {
                doc
                    .fillColor('#6200ee') // #4CAF50
                    .fontSize(14)
                    .text(`• ${strength}`)
                    .moveDown(0.2);
            });
            
            doc.moveDown(0.5);
        }

        if (feedback.areasForImprovement.length) {
            doc
                .moveDown(0.5)
                .fillColor('#333333')
                .fontSize(15)
                .text('Areas for Improvement:')
                .moveDown(0.3);
    
            feedback.areasForImprovement.forEach(area => {
                doc
                    .fillColor('#FF4D00')
                    .fontSize(14)
                    .text(`• ${area}`)
                    .moveDown(0.2);
            });

            doc.moveDown(0.5);
        }


        doc
            .moveDown(0.5)
            .fillColor('#333333')
            .fontSize(15)
            .text('Final Assessment:')
            .moveDown(0.3)
            .fillColor(primaryColor)
            .fontSize(14)
            .text(feedback.finalAssessment)
            .moveDown(1);

        doc.moveDown(2);

        // Footer with branding
        doc
            .fillColor(secondryColor) // #6200ee
            .fontSize(14)
            .text('Powered by SavyPrep', { align: 'center' })
            .fillColor(primaryColor)
            .fontSize(12)
            .text('Your AI-Powered Preparation for Exams & Interviews', { align: 'center' })
            .fontSize(10)
            .fillColor("#333333")
            .text('Join thousands of students and professionals who have achieved their goals with SavyPrep.', { align: 'center' })
            // .fillColor('#999999')
            .text('Visit our app for more details & analysis: ', { align: 'center' })
            .fillColor("#6200ee")
            .text('https://app.savyprep.com', { align: 'center', link: "https://play.google.com/store/apps/details?id=com.savyprep.app", underline: true,  });

        doc.end();
    });
};
