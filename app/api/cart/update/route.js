import {getAuth} from "@clerk/nextjs/server";
import connectDB from "@/config/db";
import {NextResponse} from "next/server";
import User from "@/models/User";

export async function POST(request) {
    try {
        const { userId } = getAuth(request)
        const { cartData } = await request.json()

        await connectDB()
        const user = await User.findById(userId);
        user.cartItems = cartData;
        await user.save()
        return NextResponse.json({ success: true, message: "Item added to cart" });
    } catch (error) {
        NextResponse.json({ success: false, message: "Item added to cart" });
    }
}