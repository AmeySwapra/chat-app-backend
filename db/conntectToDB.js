import mongoose from "mongoose";
import dotenv from 'dotenv';
dotenv.config()

const connectToDB = async () => {
    try {
        await mongoose.connect(process.env.MONOGO_DB_URL)
        console.log("Connected to monogoDB")
    } catch (error) {
        console.log("error to connect with the DB", error.message)
    }
}

export default connectToDB;