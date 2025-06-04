import {getAuth} from "@clerk/nextjs/server";
import connectDB from "@/config/db";
import {NextResponse} from "next/server";
import User from "@/models/User";

export async function GET(request) {
    try {
        const { userId } = getAuth(request)

        await connectDB()
        const user = await User.findById(userId);

        const { cartItems } = user

        NextResponse.json({ success: true, cartItems: cartItems });
    } catch (error) {
        NextResponse.json({ success: false, message: error.message });
    }
}