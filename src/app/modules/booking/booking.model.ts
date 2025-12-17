import { model, Schema } from "mongoose";
import { BookingStatus, IBooking } from "./booking.interface";


const BookingSchema = new Schema<IBooking>({
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    ride: {
        type: Schema.Types.ObjectId,
        ref: "Ride",
        required: true
    },
    payment: {
        type: Schema.Types.ObjectId,
        ref: "Payment"

    },
    status: {
        type: String,
        enum: Object.values(BookingStatus),
        default: BookingStatus.PENDING
    },
    guestCount: {
        type: Number,
        required: true
    },
    


    
}, {
    timestamps: true
})

export const Booking = model<IBooking> ("Booking", BookingSchema);