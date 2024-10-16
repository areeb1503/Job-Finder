import mongoose from "mongoose";

const dbConnect = async () => {
    try {
        const connect = await mongoose.connect(`${process.env.MONGO_URI}`)
        console.log(`Connected to MongoDB ${connect.connection.host}`);

    } catch (error) {
        console.error(`Failed to connect to MongoDB", ${error.message}`);
        process.exit(1);

    }
}

export default dbConnect;