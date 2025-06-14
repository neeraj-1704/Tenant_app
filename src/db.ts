import mongoose from "mongoose";


const DBconnect = async () => {
    try {

        await mongoose.connect('mongodb://127.0.0.1:27017/tenant');
        console.log("MongoDB connected Successfully")

    } catch (error) {
        console.error("❌ MongoDB connection failed:", error);
        process.exit(1); // Optional: exit if DB connection fails
    }
}

export default DBconnect;