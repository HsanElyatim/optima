import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import connectDB from "@/config/db";
import Product from "@/models/Product";
import authSeller from "@/lib/authSeller";

import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function PATCH(request, { params }) {
    try {
        const { userId } = getAuth(request);
        const isSeller = await authSeller(userId);
        if (!isSeller) {
            return NextResponse.json({ success: false, message: "Not authorized" }, { status: 403 });
        }

        const formData = await request.formData();
        const p = await params
        const id = await p.id;

        const name = formData.get('name');
        const description = formData.get('description');
        const category = formData.get('category');
        const price = formData.get('price');
        const offerPrice = formData.get('offerPrice');
        const files = formData.getAll('images'); // File objects

        await connectDB();

        const product = await Product.findOne({ _id: id, userId });
        if (!product) {
            return NextResponse.json({ success: false, message: "Product not found or unauthorized" }, { status: 404 });
        }

        // Handle image uploads
        const newImageUrls = [];

        for (const file of files) {
            if (file && typeof file === "object") {
                const buffer = Buffer.from(await file.arrayBuffer());
                const base64Image = `data:${file.type};base64,${buffer.toString("base64")}`;

                const uploadResult = await cloudinary.uploader.upload(base64Image, {
                    folder: "products"
                });

                newImageUrls.push(uploadResult.secure_url);
            }
        }

        // Update fields
        product.name = name;
        product.description = description;
        product.category = category;
        product.price = price;
        product.offerPrice = offerPrice;
        product.images = [...product.image, ...newImageUrls]; // merge

        await product.save();

        return NextResponse.json({ success: true, message: "Product updated", product });

    } catch (error) {
        console.error("Update error:", error);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
