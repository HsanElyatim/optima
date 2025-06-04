import mongoose from 'mongoose'

const OrderSchema = new mongoose.Schema({
    userId: { type: String, required: true, ref: 'user' },
    items: [{
        product: { type: String, required: true, ref: 'product' },
        quantity: { type: Number, required: true },
    }],
    amount: { type: Number, required: true },
    address: { type: String, required: true },
    status: { type: String, required: true, default: 'Order Placed' },
    date: { type: Date, required: true },
});

const Order = mongoose.models.Order || mongoose.model('Order', OrderSchema);

export default Order;