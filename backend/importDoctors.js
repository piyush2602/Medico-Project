import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import { v2 as cloudinary } from 'cloudinary';
import doctorModel from './models/doctorModel.js';

// Load environment variables
dotenv.config();

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_SECRET_KEY
});

// MongoDB connection
const connectDB = async () => {
    try {
        const mongoUri = process.env.MONGODB_URI;
        if (!mongoUri) {
            console.log("❌ MONGODB_URI not found in .env file!");
            process.exit(1);
        }
        console.log("🔗 Connecting to MongoDB...");
        await mongoose.connect(mongoUri);
        console.log("✅ Database Connected Successfully");
    } catch (error) {
        console.log("❌ Database Connection Error:", error);
        process.exit(1);
    }
};

// Doctor image paths (relative to backend folder)
const doctorImagePaths = [
    '../frontend/src/assets/doc1.png',
    '../frontend/src/assets/doc2.png',
    '../frontend/src/assets/doc3.png',
    '../frontend/src/assets/doc4.png',
    '../frontend/src/assets/doc5.png',
    '../frontend/src/assets/doc6.png',
    '../frontend/src/assets/doc7.png',
    '../frontend/src/assets/doc8.png',
    '../frontend/src/assets/doc9.png',
    '../frontend/src/assets/doc10.png',
    '../frontend/src/assets/doc11.png',
    '../frontend/src/assets/doc12.png',
    '../frontend/src/assets/doc13.png',
    '../frontend/src/assets/doc14.png',
    '../frontend/src/assets/doc15.png',
    '../frontend/src/assets/doc16.png'
];

// 16 Doctors Data (images will be uploaded to Cloudinary)
const doctorsData = [
    {
        name: 'Dr. Arvind Mehta',
        email: 'arvind.mehta@medico.com',
        password: 'Password123',
        speciality: 'General physician',
        degree: 'MBBS',
        experience: '4 Years',
        about: 'Dr. Davis has a strong commitment to delivering comprehensive medical care, focusing on preventive medicine, early diagnosis, and effective treatment strategies.',
        fees: 5000,
        address: { line1: '17th Cross, Richmond', line2: 'Circle, Ring Road, London' }
    },
    {
        name: 'Dr. Sonali Bansal',
        email: 'sonali.bansal@medico.com',
        password: 'Password123',
        speciality: 'Gynecologist',
        degree: 'MBBS',
        experience: '3 Years',
        about: 'Dr. Davis has a strong commitment to delivering comprehensive medical care, focusing on preventive medicine, early diagnosis, and effective treatment strategies.',
        fees: 500,
        address: { line1: '27th Cross, Richmond', line2: 'Circle, Ring Road, London' }
    },
    {
        name: 'Dr. Sarah Patel',
        email: 'sarah.patel@medico.com',
        password: 'Password123',
        speciality: 'Dermatologist',
        degree: 'MBBS',
        experience: '1 Years',
        about: 'Dr. Davis has a strong commitment to delivering comprehensive medical care, focusing on preventive medicine, early diagnosis, and effective treatment strategies.',
        fees: 30,
        address: { line1: '37th Cross, Richmond', line2: 'Circle, Ring Road, London' }
    },
    {
        name: 'Dr. Christopher Lee',
        email: 'christopher.lee@medico.com',
        password: 'Password123',
        speciality: 'Pediatricians',
        degree: 'MBBS',
        experience: '2 Years',
        about: 'Dr. Davis has a strong commitment to delivering comprehensive medical care, focusing on preventive medicine, early diagnosis, and effective treatment strategies.',
        fees: 40,
        address: { line1: '47th Cross, Richmond', line2: 'Circle, Ring Road, London' }
    },
    {
        name: 'Dr. Jennifer Garcia',
        email: 'jennifer.garcia@medico.com',
        password: 'Password123',
        speciality: 'Neurologist',
        degree: 'MBBS',
        experience: '4 Years',
        about: 'Dr. Davis has a strong commitment to delivering comprehensive medical care, focusing on preventive medicine, early diagnosis, and effective treatment strategies.',
        fees: 50,
        address: { line1: '57th Cross, Richmond', line2: 'Circle, Ring Road, London' }
    },
    {
        name: 'Dr. Andrew Williams',
        email: 'andrew.williams@medico.com',
        password: 'Password123',
        speciality: 'Neurologist',
        degree: 'MBBS',
        experience: '4 Years',
        about: 'Dr. Davis has a strong commitment to delivering comprehensive medical care, focusing on preventive medicine, early diagnosis, and effective treatment strategies.',
        fees: 50,
        address: { line1: '57th Cross, Richmond', line2: 'Circle, Ring Road, London' }
    },
    {
        name: 'Dr. Christopher Davis',
        email: 'christopher.davis@medico.com',
        password: 'Password123',
        speciality: 'General physician',
        degree: 'MBBS',
        experience: '4 Years',
        about: 'Dr. Davis has a strong commitment to delivering comprehensive medical care, focusing on preventive medicine, early diagnosis, and effective treatment strategies.',
        fees: 50,
        address: { line1: '17th Cross, Richmond', line2: 'Circle, Ring Road, London' }
    },
    {
        name: 'Dr. Timothy White',
        email: 'timothy.white@medico.com',
        password: 'Password123',
        speciality: 'Gynecologist',
        degree: 'MBBS',
        experience: '3 Years',
        about: 'Dr. Davis has a strong commitment to delivering comprehensive medical care, focusing on preventive medicine, early diagnosis, and effective treatment strategies.',
        fees: 60,
        address: { line1: '27th Cross, Richmond', line2: 'Circle, Ring Road, London' }
    },
    {
        name: 'Dr. Ava Mitchell',
        email: 'ava.mitchell@medico.com',
        password: 'Password123',
        speciality: 'Dermatologist',
        degree: 'MBBS',
        experience: '1 Years',
        about: 'Dr. Davis has a strong commitment to delivering comprehensive medical care, focusing on preventive medicine, early diagnosis, and effective treatment strategies.',
        fees: 30,
        address: { line1: '37th Cross, Richmond', line2: 'Circle, Ring Road, London' }
    },
    {
        name: 'Dr. Jeffrey King',
        email: 'jeffrey.king@medico.com',
        password: 'Password123',
        speciality: 'Pediatricians',
        degree: 'MBBS',
        experience: '2 Years',
        about: 'Dr. Davis has a strong commitment to delivering comprehensive medical care, focusing on preventive medicine, early diagnosis, and effective treatment strategies.',
        fees: 40,
        address: { line1: '47th Cross, Richmond', line2: 'Circle, Ring Road, London' }
    },
    {
        name: 'Dr. Zoe Kelly',
        email: 'zoe.kelly@medico.com',
        password: 'Password123',
        speciality: 'Neurologist',
        degree: 'MBBS',
        experience: '4 Years',
        about: 'Dr. Davis has a strong commitment to delivering comprehensive medical care, focusing on preventive medicine, early diagnosis, and effective treatment strategies.',
        fees: 50,
        address: { line1: '57th Cross, Richmond', line2: 'Circle, Ring Road, London' }
    },
    {
        name: 'Dr. Patrick Harris',
        email: 'patrick.harris@medico.com',
        password: 'Password123',
        speciality: 'Neurologist',
        degree: 'MBBS',
        experience: '4 Years',
        about: 'Dr. Davis has a strong commitment to delivering comprehensive medical care, focusing on preventive medicine, early diagnosis, and effective treatment strategies.',
        fees: 50,
        address: { line1: '57th Cross, Richmond', line2: 'Circle, Ring Road, London' }
    },
    {
        name: 'Dr. Chloe Evans',
        email: 'chloe.evans@medico.com',
        password: 'Password123',
        speciality: 'General physician',
        degree: 'MBBS',
        experience: '4 Years',
        about: 'Dr. Davis has a strong commitment to delivering comprehensive medical care, focusing on preventive medicine, early diagnosis, and effective treatment strategies.',
        fees: 50,
        address: { line1: '17th Cross, Richmond', line2: 'Circle, Ring Road, London' }
    },
    {
        name: 'Dr. Ryan Martinez',
        email: 'ryan.martinez@medico.com',
        password: 'Password123',
        speciality: 'Gynecologist',
        degree: 'MBBS',
        experience: '3 Years',
        about: 'Dr. Davis has a strong commitment to delivering comprehensive medical care, focusing on preventive medicine, early diagnosis, and effective treatment strategies.',
        fees: 60,
        address: { line1: '27th Cross, Richmond', line2: 'Circle, Ring Road, London' }
    },
    {
        name: 'Dr. Amelia Hill',
        email: 'amelia.hill@medico.com',
        password: 'Password123',
        speciality: 'Dermatologist',
        degree: 'MBBS',
        experience: '1 Years',
        about: 'Dr. Davis has a strong commitment to delivering comprehensive medical care, focusing on preventive medicine, early diagnosis, and effective treatment strategies.',
        fees: 30,
        address: { line1: '37th Cross, Richmond', line2: 'Circle, Ring Road, London' }
    },
    {
        name: 'Dr. Babita Agrawal',
        email: 'babita.agrawal@medico.com',
        password: 'Password123',
        speciality: 'Gastroenterologist',
        degree: 'MBBS',
        experience: '2 Years',
        about: 'Dr. Babita has a strong commitment to delivering comprehensive medical care, focusing on preventive medicine, early diagnosis, and effective treatment strategies.',
        fees: 30,
        address: { line1: '37th Cross, Richmond', line2: 'Circle, Ring Road, London' }
    }
];

// Import doctors with image upload
const importDoctors = async () => {
    try {
        // Hash passwords
        console.log("🔒 Hashing passwords...");
        const salt = await bcrypt.genSalt(10);
        
        // Clear existing doctors
        console.log("🗑️  Clearing existing doctors...");
        await doctorModel.deleteMany({});

        // Upload images and create doctors
        console.log("📤 Uploading doctor images to Cloudinary and inserting data...");
        const doctorsWithImages = [];

        for (let i = 0; i < doctorsData.length; i++) {
            const doctor = doctorsData[i];
            const imagePath = doctorImagePaths[i];

            try {
                // Upload image to Cloudinary
                console.log(`  ${i + 1}/16: Uploading ${doctor.name}...`);
                const imageUpload = await cloudinary.uploader.upload(imagePath, { resource_type: "image" });
                
                // Hash password and add image URL
                const hashedPassword = await bcrypt.hash(doctor.password, salt);
                
                doctorsWithImages.push({
                    ...doctor,
                    password: hashedPassword,
                    image: imageUpload.secure_url,
                    available: true,
                    slots_booked: {},
                    date: Date.now()
                });
            } catch (uploadError) {
                console.log(`  ⚠️  Error uploading image for ${doctor.name}:`, uploadError.message);
                // Use fallback placeholder if image upload fails
                const hashedPassword = await bcrypt.hash(doctor.password, salt);
                doctorsWithImages.push({
                    ...doctor,
                    password: hashedPassword,
                    image: 'https://res.cloudinary.com/demo/image/upload/sample.jpg',
                    available: true,
                    slots_booked: {},
                    date: Date.now()
                });
            }
        }

        // Insert all doctors
        const result = await doctorModel.insertMany(doctorsWithImages);
        
        console.log(`\n✅ Successfully imported ${result.length} doctors with images!`);
        console.log("\n📋 Imported Doctors:");
        result.forEach((doc, index) => {
            console.log(`${index + 1}. ${doc.name} (${doc.speciality}) - ID: ${doc._id}`);
        });

        process.exit(0);
    } catch (error) {
        console.error("❌ Error importing doctors:", error);
        process.exit(1);
    }
};

// Run the import
connectDB().then(() => {
    importDoctors();
});
