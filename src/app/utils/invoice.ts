/* eslint-disable @typescript-eslint/no-explicit-any */
import PDFDocument from "pdfkit"; 
import AppError from "../ErrorHelpers/appError";

export interface IInvoiceData {
   transactionId: string;
   bookingDate: Date;
   customerName: string;
   rideTitle: string;
   guestCount: number;
   totalAmount: number;
   
}

export const generatePdf = async (invoiceData: IInvoiceData): Promise<Buffer<ArrayBufferLike>> => {
    

    try {

        return new Promise ((resolve, reject) => {

            const doc = new PDFDocument({ size: 'A4', margin: 50 }); 

            const buffer:Uint8Array[] = [];

            doc.on("data", (chunk) => buffer.push(chunk));
            doc.on("end", () => resolve(Buffer.concat(buffer)));
            doc.on("error", (error) => reject(error));


            // PDF content 

            doc.fontSize(25).text("Invoice", { align: "center" });
            doc.moveDown();

            doc.fontSize(15).text(`Transaction ID: ${invoiceData.transactionId}`);
            doc.moveDown();

            doc.fontSize(15).text(`Booking Date : ${invoiceData.bookingDate}`);
            doc.moveDown();

            doc.fontSize(15).text(`Customer Name : ${invoiceData.customerName}`);
            doc.moveDown();

            doc.fontSize(15).text(`Ride Title : ${invoiceData.rideTitle}`);
            doc.moveDown();

            doc.fontSize(15).text(`Max Guests : ${invoiceData.guestCount}`);
            doc.moveDown();

            doc.fontSize(15).text(`Total Amount : ${invoiceData.totalAmount}`);
            doc.moveDown();

            doc.text("Thank you for using our service!", { align: "center" });
            doc.end();
            
        })
        
    } catch (error:any) {
        
        console.log(error)
        throw new AppError(500, `Failed to generate PDF ${error?.message}`)
        
    }
}
