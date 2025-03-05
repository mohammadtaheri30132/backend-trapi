const Clinic = require('../models/Clinic');
const Visit = require('../models/Visit');
const Therapist = require('../models/Therapist');
const moment = require("moment");
const momentJalaali = require('moment-jalaali'); // استفاده از moment-jalaali برای تاریخ شمسی

require("moment/locale/fa");
/**
 * ایجاد کلینیک جدید
 * @route POST /api/clinics
 * @access Admin (بسته به نیاز می‌توان محدودیت دسترسی تعریف کرد)
 */

// Helper Function to Calculate Percentage Growth
const calculateGrowth = (current, previous) => {
    if (previous === 0) return 100;
    return ((current - previous) / previous) * 100;
};

const getClinicStats = async (req, res) => {
    try {
        const { startDate, endDate, comparisonPeriod, clinicId } = req.query;
        if (!clinicId) {
            return res.status(400).json({ error: 'Clinic ID is required' });
        }

        const start = moment(startDate).startOf('day').toDate();
        const end = moment(endDate).endOf('day').toDate();
        const previousStart = moment(startDate).subtract(comparisonPeriod, 'days').startOf('day').toDate();
        const previousEnd = moment(endDate).subtract(comparisonPeriod, 'days').endOf('day').toDate();

        const visitsInRange = await Visit.find({ clinic: clinicId, visitDate: { $gte: start, $lte: end }, paymentStatus: 'Paid' });
        const previousVisits = await Visit.find({ clinic: clinicId, visitDate: { $gte: previousStart, $lte: previousEnd }, paymentStatus: 'Paid' });

        const totalIncome = visitsInRange.reduce((sum, visit) => sum + visit.fee, 0);
        const previousIncome = previousVisits.reduce((sum, visit) => sum + visit.fee, 0);

        const totalVisits = visitsInRange.length;
        const previousTotalVisits = previousVisits.length;

        const incomeGrowth = calculateGrowth(totalIncome, previousIncome);
        const visitGrowth = calculateGrowth(totalVisits, previousTotalVisits);

        const unpaidVisits = await Visit.find({ clinic: clinicId, paymentStatus: 'Unpaid' });

        const doctorIncome = await Visit.aggregate([
            { $match: { clinic: clinicId, visitDate: { $gte: start, $lte: end }, paymentStatus: 'Paid' } },
            { $group: { _id: '$doctor', totalIncome: { $sum: '$fee' }, visitCount: { $sum: 1 } } },
            { $lookup: { from: 'therapists', localField: '_id', foreignField: '_id', as: 'doctor' } },
        ]);

        const doctorPatients = await Visit.aggregate([
            { $match: { clinic: clinicId } },
            { $group: { _id: '$doctor', patientCount: { $addToSet: '$patient' } } },
            { $project: { _id: 1, patientCount: { $size: '$patientCount' } } },
        ]);

        res.json({
            totalIncome,
            incomeGrowth,
            totalVisits,
            visitGrowth,
            unpaidVisits,
            doctorIncome,
            doctorPatients,
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch clinic statistics', details: error.message });
    }
};


const createClinic = async (req, res) => {
    try {
        const { name, username, password,
            clinicName,
            family,
            address} = req.body;

        // بررسی اینکه تمام فیلدها پر شده باشند
        if (!name || !username || !password|| !clinicName|| !family || !address) {
            return res.status(400).json({ message: 'All fields are required.' });
        }

        // بررسی وجود نام کاربری تکراری
        const existingClinic = await Clinic.findOne({ username });
        if (existingClinic) {
            return res.status(400).json({ message: 'Username already exists.' });
        }

        // ایجاد کلینیک جدید
        const newClinic = new Clinic({ name, username, password,
            clinicName,
            family,
            address });
        await newClinic.save();

        res.status(201).json({
            success: true,
            message: 'Clinic created successfully.',
            clinicId: newClinic._id
        });
    } catch (error) {
        console.error('Error creating clinic:', error.message);
        res.status(500).json({
            success: false,
            message: 'Server error while creating clinic.'
        });
    }
};

const getClinicDetails = async (req, res) => {
    try {
        // شناسه کلینیک را از JWT می‌گیریم
        const clinicId = req.user.clinicId;

        if (!clinicId) {
            return res.status(403).json({ message: 'Access denied. Clinic ID is required.' });
        }

        // دریافت اطلاعات کلینیک
        const clinic = await Clinic.findById(clinicId).select('-password'); // رمز عبور را حذف می‌کنیم

        if (!clinic) {
            return res.status(404).json({ message: 'Clinic not found.' });
        }

        res.status(200).json({
            success: true,
            data: clinic
        });
    } catch (error) {
        console.error('Error fetching clinic details:', error.message);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching clinic details.'
        });
    }
};


const getClinicIncomeReport = async (req, res) => {
    try {
        const { clinicId } = req.params;
        const { startDate, endDate } = req.query;

        if (!clinicId || !startDate || !endDate) {
            return res.status(400).json({ message: "Clinic ID, startDate, and endDate are required." });
        }

        // بررسی وجود کلینیک
        const clinic = await Clinic.findById(clinicId);
        if (!clinic) {
            return res.status(404).json({ message: "Clinic not found." });
        }

        // تبدیل تاریخ‌ها به شیء Date
        const start = new Date(startDate);
        const end = new Date(endDate);

        // دریافت ویزیت‌ها در بازه زمانی مشخص
        const visits = await Visit.find({
            clinic: clinicId,
            visitDate: { $gte: start, $lte: end },
        });

        const totalIncome = visits.reduce((sum, visit) => sum + visit.fee, 0);

        const therapistIncome = {};
        visits.forEach((visit) => {
            const therapistId = visit.doctor.toString();
            const therapistShare = (visit.fee * visit.percentage) / 100;
            if (!therapistIncome[therapistId]) {
                therapistIncome[therapistId] = { income: 0, visits: 0 };
            }
            therapistIncome[therapistId].income += therapistShare;
            therapistIncome[therapistId].visits += 1;
        });

        const therapistDetails = await Promise.all(
            Object.entries(therapistIncome).map(async ([therapistId, data]) => {
                const therapist = await Therapist.findById(therapistId);
                return {
                    therapist: `${therapist.firstName} ${therapist.lastName}`,
                    income: data.income,
                    visits: data.visits,
                };
            })
        );

        // محاسبه درآمد کل تراپیست‌ها
        const totalTherapistIncome = Object.values(therapistIncome).reduce((sum, data) => sum + data.income, 0);

        // محاسبه درآمد کلینیک
        const clinicIncome = totalIncome - totalTherapistIncome;

        return res.status(200).json({
            clinicIncome,             // درآمد کلینیک
            totalIncome,              // درآمد کل
            totalTherapistIncome,     // درآمد کل تراپیست‌ها
            therapistDetails,         // جزئیات درآمد تراپیست‌ها
            totalVisits: visits.length,  // تعداد ویزیت‌ها
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "An error occurred while generating the clinic income report." });
    }
};

/**
 * کنترلر برای دریافت گزارش درآمد ماهانه کلینیک در سال جاری شمسی
 */
const getYearlyIncomeReport = async (req, res) => {
    try {
        const { clinicId } = req.params;
        console.log(clinicId)

        if (!clinicId) {
            return res.status(400).json({ message: "Clinic ID is required." });
        }

        // بررسی وجود کلینیک
        const clinic = await Clinic.findById(clinicId);
        if (!clinic) {
            return res.status(404).json({ message: "Clinic not found." });
        }

        // دریافت سال جاری شمسی
        const currentYear = momentJalaali().locale("fa").year();
        const months = momentJalaali.localeData("fa").months();  // ماه‌های شمسی

        const monthlyReport = [];
        let totalYearIncome = 0;
        let totalYearVisits = 0;
        let totalClinicIncome = 0;
        let totalTherapistIncome = 0;

        for (let i = 0; i < months.length; i++) {
            const startOfMonth = momentJalaali().locale("fa").year(currentYear).month(i).startOf("month").toDate();
            const endOfMonth = momentJalaali().locale("fa").year(currentYear).month(i).endOf("month").toDate();

            // دریافت ویزیت‌های ماه جاری
            const visits = await Visit.find({
                clinic: clinicId,
                visitDate: { $gte: startOfMonth, $lte: endOfMonth },
            });

            const monthIncome = visits.reduce((sum, visit) => sum + visit.fee, 0);
            const monthVisits = visits.length;

            totalYearIncome += monthIncome;
            totalYearVisits += monthVisits;

            // محاسبه درامد هر تراپیست
            const therapistDetails = [];
            const therapists = await Therapist.find({
                clinic: clinicId,
                visits: { $gte: startOfMonth, $lte: endOfMonth }
            });

            therapists.forEach(therapist => {
                const therapistIncome = visits.filter(visit => visit.therapistId.toString() === therapist._id.toString()).reduce((sum, visit) => sum + visit.fee, 0);
                therapistDetails.push({
                    therapistName: therapist.firstName,
                    therapistFamily: therapist.lastName,
                    income: therapistIncome
                });

                totalTherapistIncome += therapistIncome;
            });

            monthlyReport.push({
                month: months[i],  // ماه شمسی
                income: monthIncome,
                visits: monthVisits,
                therapistDetails: therapistDetails
            });
        }

        // ارسال پاسخ
        return res.status(200).json({
            currentYear,
            totalYearIncome,
            totalClinicIncome: totalYearIncome,  // درآمد کل کلینیک
            totalTherapistIncome,
            totalYearVisits,
            monthlyReport
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "An error occurred while generating the yearly report." });
    }
};


module.exports = { createClinic,getClinicDetails,getClinicStats,
    getClinicIncomeReport, getYearlyIncomeReport,

};
