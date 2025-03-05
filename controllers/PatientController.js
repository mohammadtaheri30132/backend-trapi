const Patient = require('../models/Patient');
const Therapist = require('../models/Therapist');
const File = require('../models/File');
const punycode = require("punycode");

// ایجاد بیمار
exports.createPatient = async (req, res) => {
    const body = req.body;
    console.log(body)
    const patient = new Patient(body);
  
    
    await patient.save();
    res.status(201).json(patient);
};

exports.getPatients = async (req, res) => {
    try {
        const clinicId = req.params.id;

        if (!clinicId) {
            return res.status(403).json({ message: 'Access denied. Clinic ID is required.' });
        }

        const patients = await Patient.find({ clinic: clinicId })
            .populate('clinic', 'name')
            .populate('therapists');

        res.status(200).json({
            success: true,
            data: patients
        });
    } catch (error) {
        console.error('Error fetching patients:', error.message);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching patients.'
        });
    }
};
exports.getPatients = async (req, res) => {
    try {
        const clinicId = req.params.id;

    

        const patients = await Patient.find({ clinic: clinicId })
            .populate('clinic', 'name')
            .populate('therapists');

        res.status(200).json({
            success: true,
            data: patients
        });
    } catch (error) {
        console.error('Error fetching patients:', error.message);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching patients.'
        });
    }
};
exports.getPatient = async (req, res) => {
    try {
        const id = req.params.id;
        const data = await Patient.findById(id)
        res.status(200).json(data);
    } catch (error) {
        console.error('Error fetching patients:', error.message);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching patients.'
        });
    }
};
// اضافه کردن درمانگر به بیمار
exports.addTherapistToPatient = async (req, res) => {
    const { patientId, therapistId } = req.body;

    const patient = await Patient.findById(patientId);
    if (!patient) return res.status(404).json({ error: 'Patient not found' });

    const therapist = await Therapist.findById(therapistId);
    if (!therapist) return res.status(404).json({ error: 'Therapist not found' });

    patient.therapists.push(therapist._id);
    await patient.save();

    res.json(patient);
};

exports.updatePatient = async (req, res) => {
    const { id } = req.params; // شناسه بیمار از پارامترهای درخواست
    const { name, lastName, clinicId, desc, therapistId } = req.body;

    try {
        // یافتن بیمار بر اساس شناسه
        const patient = await Patient.findById(id);

        if (!patient) {
            return res.status(404).json({ message: "Patient not found" });
        }

        // به‌روزرسانی فیلدهای بیمار
        if (name) patient.name = name;
        if (lastName) patient.lastName = lastName;
        if (clinicId) patient.clinic = clinicId;
        if (desc) patient.desc = desc;

        // جایگزینی آرایه درمانگران
        if (therapistId && Array.isArray(therapistId)) {
            patient.therapists = therapistId;
        }

        // ذخیره تغییرات
        await patient.save();

        res.status(200).json({ message: "Patient updated successfully", patient });
    } catch (error) {
        console.error("Error updating patient:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

exports.upsertFile = async (req, res) => {
    try {
        const { patient, clinic, ...updateData } = req.body;

        if (!patient || !clinic) {
            return res.status(400).json({ message: 'Patient and Clinic are required.' });
        }

        const file = await File.findOneAndUpdate(
            { patient, clinic }, // شرط جستجو
            { $set: updateData }, // داده‌هایی که باید به‌روزرسانی شوند
            { new: true, upsert: true } // new: مقدار جدید را برمی‌گرداند، upsert: اگر وجود نداشت ایجاد کند
        );

        res.status(200).json(file);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
exports.getFileByPatient = async (req, res) => {
    try {
        const { patient } = req.params;

        if (!patient) {
            return res.status(400).json({ message: 'Patient ID is required.' });
        }

        const file = await File.findOne({ patient }).populate('patient').populate('clinic');

        if (!file) {
            return res.status(404).json({ message: 'File not found.' });
        }

        res.status(200).json(file);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
