import {getAuth} from "@clerk/nextjs/server";
import authSeller from "@/lib/authSeller";
import {NextResponse} from "next/server";
import connectDB from "@/config/db";
import Order from "@/models/Order";
import Address from "@/models/Address";
import Product from "@/models/Product";

export async function GET(request) {
    try {
        const {userId} = getAuth(request)
        const isSeller = await authSeller(userId)
        if (!isSeller) {
            return NextResponse.json({success: false, message: "NOT AUTHOURIZED"})
        }
        Address.length
        Product.length
        await connectDB()
        const orders = await Order.find({userId}).populate('address').populate("items.product")
        console.log(orders)
        return NextResponse.json({success: true, orders})
    } catch (error) {
        console.log(error)
        return NextResponse.json({success: false, message: error.message})
    }
}