const mongoose = require('mongoose');
const Therapist = require('../models/Therapist');
const Patient = require('../models/Patient');
const Visit = require('../models/Visit');
const Report = require('../models/Report');
const moment = require('moment-jalaali');

const createTherapist = async (req, res) => {
    try {
        const { firstName, lastName, phone, specialization, clinicId,percentage, username, password } = req.body;

        if (!firstName || !lastName || !percentage || !phone || !specialization || !clinicId || !username || !password) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        // بررسی وجود نام کاربری مشابه
        const existingTherapist = await Therapist.findOne({ username });
        if (existingTherapist) {
            return res.status(400).json({ message: 'Username already exists' });
        }

        const therapist = new Therapist({
            firstName,
            lastName,
            phone,
            percentage,
            specialization,
            clinicId: new mongoose.Types.ObjectId(clinicId),
            username,
            password,
        });

        await therapist.save();
        res.status(201).json(therapist);
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: 'Error creating therapist', error });
    }
};

// دریافت تمام تراپیست‌های یک کلینیک
const getTherapistsByClinic = async (req, res) => {
    try {
        const id = req.params.id;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid clinic ID' });
        }

        const therapists = await Therapist.find({ clinicId:id });
        res.status(200).json(therapists);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching therapists', error });
    }
};
const getDetailTherapistsByClinic = async (req, res) => {
    try {
        const therapistId = req.params.id;
        if (!mongoose.Types.ObjectId.isValid(therapistId)) {
            return res.status(400).json({ message: 'Invalid therapist ID' });
        }

        // دریافت اطلاعات تراپیست
        const therapist = await Therapist.findById(therapistId);
        if (!therapist) {
            return res.status(404).json({ message: 'Therapist not found' });
        }

        // دریافت گزارش‌های تراپیست
        const reports = await Report.find({ therapist: therapistId }).populate('patient');

        // دریافت ویزیت‌های تراپیست با اطلاعات بیماران
        const visits = await Visit.find({ doctor: therapistId, paymentStatus: 'Paid' })
            .populate('patient');

        // محاسبه درآمد ماهانه به صورت شمسی
        const incomeByMonth = {};
        const visitCountByPatient = new Map(); // برای شمارش ویزیت‌های هر بیمار

        visits.forEach((visit) => {
            const jalaaliMonth = moment(visit.visitDate).format('jMMMM');
            const therapistShare = (visit.fee * visit.percentage) / 100;

            // محاسبه درآمد
            if (incomeByMonth[jalaaliMonth]) {
                incomeByMonth[jalaaliMonth].totalIncome += therapistShare;
                incomeByMonth[jalaaliMonth].visitCount += 1;
            } else {
                incomeByMonth[jalaaliMonth] = {
                    totalIncome: therapistShare,
                    visitCount: 1
                };
            }

            // شمارش تعداد ویزیت‌های هر بیمار
            if (visit.patient) {
                const patientId = visit.patient._id.toString();
                if (visitCountByPatient.has(patientId)) {
                    visitCountByPatient.set(patientId, visitCountByPatient.get(patientId) + 1);
                } else {
                    visitCountByPatient.set(patientId, 1);
                }
            }
        });

        // دریافت بیماران تنها آن‌هایی که حداقل یکبار ویزیت شده‌اند
        const visitedPatientIds = Array.from(visitCountByPatient.keys());
        const patients = await Patient.find({ _id: { $in: visitedPatientIds } });

        // ساختن آبجکت خروجی نهایی
        const response = {
            therapist: {
                id: therapist._id,
                firstName: therapist.firstName,
                lastName: therapist.lastName,
                specialization: therapist.specialization,
                percentage: therapist.percentage
            },
            reports: reports.map((report) => ({
                id: report._id,
                patient: {
                    id: report.patient._id,
                    name: `${report.patient.name} ${report.patient.lastName}`
                },
                reportText: report.reportText,
                createdAt: report.createdAt
            })),
            visits: visits.map((visit) => ({
                id: visit._id,
                visitDate: moment(visit.visitDate).format('jYYYY/jMM/jDD'),
                fee: visit.fee,
                therapistShare: (visit.fee * visit.percentage) / 100,
                paymentStatus: visit.paymentStatus,
                patient: visit.patient ? {
                    id: visit.patient._id,
                    name: `${visit.patient.name} ${visit.patient.lastName}`
                } : null
            })),
            incomeByMonth,
            patients: patients.map((patient) => ({
                id: patient._id,
                name: `${patient.name} ${patient.lastName}`,
                phoneNumber: patient.phoneNumber,
                address: patient.address,
                visitCount: visitCountByPatient.get(patient._id.toString()) || 0 // تعداد دفعات ویزیت
            }))
        };

        res.status(200).json(response);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching therapist data', error });
    }
};

// ویرایش اطلاعات تراپیست
const updateTherapist = async (req, res) => {
    try {
        const { therapistId } = req.params;
        const { firstName, lastName, phone, specialization } = req.body;

        if (!mongoose.Types.ObjectId.isValid(therapistId)) {
            return res.status(400).json({ message: 'Invalid therapist ID' });
        }

        const updatedTherapist = await Therapist.findByIdAndUpdate(
            therapistId,
            { firstName, lastName, phone, specialization },
            { new: true, runValidators: true }
        );

        if (!updatedTherapist) {
            return res.status(404).json({ message: 'Therapist not found' });
        }

        res.status(200).json(updatedTherapist);
    } catch (error) {
        res.status(500).json({ message: 'Error updating therapist', error });
    }
};

// حذف تراپیست
const deleteTherapist = async (req, res) => {
    try {
        const { therapistId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(therapistId)) {
            return res.status(400).json({ message: 'Invalid therapist ID' });
        }

        const deletedTherapist = await Therapist.findByIdAndDelete(therapistId);

        if (!deletedTherapist) {
            return res.status(404).json({ message: 'Therapist not found' });
        }

        res.status(200).json({ message: 'Therapist deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting therapist', error });
    }
};

const getPatientsByTherapistId = async (req, res) => {
    const { therapistId } = req.params;
    try {
        // بررسی وجود تراپیست
        const therapist = await Therapist.findById(therapistId);
        if (!therapist) {
            return res.status(404).json({ message: 'تراپیست مورد نظر یافت نشد.' });
        }
        console.log({ therapistId });


        // پیدا کردن بیمارانی که تراپیست با آن‌ها ویزیت داشته
        const visitedPatients = await Visit.find({ doctor: therapistId }).populate('patient');
     

        console.log('allPatients ', visitedPatients);
        res.status(200).json(visitedPatients);
    } catch (error) {
        console.error('خطا در دریافت بیماران:', error);
        res.status(500).json({ message: 'خطا در سرور. لطفاً دوباره تلاش کنید.' });
    }
};


module.exports = {
    getPatientsByTherapistId,
    createTherapist,
    getDetailTherapistsByClinic,
    getTherapistsByClinic,
    updateTherapist,
    deleteTherapist,
    
};
