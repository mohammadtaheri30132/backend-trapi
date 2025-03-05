const Clinic = require('../models/Clinic');
const Patient = require('../models/Patient');
const Therapist = require('../models/Therapist');
const Visit = require('../models/Visit');


/**
 * Get all visits of a specific clinic for a specific day
 */
const getClinicVisitsByDate = async (req, res) => {
    try {
        const { clinicId, date } = req.params;

        // دریافت نوبت‌ها از دیتابیس
        const visits = await Visit.find({
            clinic: clinicId,
            visitDate: new Date(date),
        }).populate('doctor patient clinic');

        // گروه‌بندی نوبت‌ها بر اساس پزشک
        const groupedVisits = visits.reduce((acc, visit) => {
            const doctorId = visit.doctor._id.toString();

            if (!acc[doctorId]) {
                acc[doctorId] = {
                    visitId: visit._id,
                    doctorId: visit.doctor._id,
                    doctorFirstName: visit.doctor.firstName,
                    doctorLastName: visit.doctor.lastName,
                    visits: [],
                };
            }

            acc[doctorId].visits.push({
                patientId: visit.patient._id,
                patientName: visit.patient.name,
                patientLastName: visit.patient.lastName,
                visitDate: visit.visitDate,
                startTime: visit.startTime,
                endTime: visit.endTime,
                fee: visit.fee,
                paymentStatus: visit.paymentStatus,
                attendanceStatus: visit.attendanceStatus,
            });

            return acc;
        }, {});

        // تبدیل آبجکت به آرایه
        const result = Object.values(groupedVisits);

        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


/**
 * Create a new visit
 */
const createVisit = async (req, res) => {
    try {
        const { startTime, endTime, doctor,visitDate, patient, clinic, fee } = req.body;

        // ۱. بررسی فیلدهای اجباری
        if (!startTime || !visitDate ||  !endTime || !doctor || !patient || !clinic || fee === undefined) {
            return res.status(400).json({ message: "تمام فیلدها الزامی هستند." });
        }

        // ۲. بررسی فرمت زمان
        const timeRegex = /^([0-1][0-9]|2[0-3]):([0-5][0-9])$/;
        if (!timeRegex.test(startTime) || !timeRegex.test(endTime)) {
            return res.status(400).json({ message: "فرمت زمان نادرست است. از قالب HH:mm استفاده کنید." });
        }

        // ۳. بررسی اینکه زمان شروع قبل از زمان پایان باشد
        if (startTime >= endTime) {
            return res.status(400).json({ message: "زمان شروع باید قبل از زمان پایان باشد." });
        }

        
        const overlappingVisits = await Visit.find({
            doctor,
            visitDate,
            $or: [
                { startTime: { $lt: endTime }, endTime: { $gt: startTime } }
            ]
        });
        
        if (overlappingVisits.length > 0) {
            return res.status(400).json({ message: "زمان ویزیت با ویزیت‌های دیگر این دکتر در این تاریخ تداخل دارد." });
        }

        // ۵. بررسی طول بازه زمانی ویزیت
        const start = parseInt(startTime.replace(":", ""), 10);
        const end = parseInt(endTime.replace(":", ""), 10);
        const duration = end - start;
        if (duration < 15 || duration > 120) {
            return res.status(400).json({ message: "مدت زمان ویزیت باید حداقل ۱۵ دقیقه و حداکثر ۲ ساعت باشد." });
        }

        // ۶. بررسی وجود دکتر در سیستم
        const doctorFound = await Therapist.findById(doctor);
        if (!doctorFound) {
            return res.status(400).json({ message: "دکتر معتبر نیست." });
        }

        // ۷. بررسی وجود بیمار در سیستم
        const patientFound = await Patient.findById(patient);
        if (!patientFound) {
            return res.status(400).json({ message: "بیمار معتبر نیست." });
        }

        // ۸. بررسی وجود کلینیک
        const clinicFound = await Clinic.findById(clinic);
        if (!clinicFound) {
            return res.status(400).json({ message: "کلینیک معتبر نیست." });
        }

        // ۹. بررسی مقدار هزینه ویزیت
        if (fee <= 0) {
            return res.status(400).json({ message: "هزینه ویزیت باید بیشتر از صفر باشد." });
        }

        // ایجاد ویزیت جدید
        const visit = new Visit(req.body);
        await visit.save();
        res.status(201).json(visit);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


/**
 * Update an existing visit
 */
const updateVisit = async (req, res) => {
    try {
        const { id } = req.params;
        const updatedVisit = await Visit.findByIdAndUpdate(id, req.body, { new: true });
        res.status(200).json(updatedVisit);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

/**
 * Delete a visit
 */
const deleteVisit = async (req, res) => {
    try {
        const { id } = req.params;
        await Visit.findByIdAndDelete(id);
        res.status(200).json({ message: 'Visit deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


/**
 * کنترلر برای دریافت گزارش درآمد کلینیک بر اساس بازه زمانی
 */


module.exports = {
    createVisit,
    getClinicVisitsByDate,
    updateVisit,
    deleteVisit,
};
