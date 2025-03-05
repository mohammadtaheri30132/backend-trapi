const Report = require('../models/Report');
const Patient = require('../models/Patient');

// ثبت گزارش برای بیمار
    exports.createReport = async (req, res) => {
       try{
        const { patientId, reportText ,therapistId} = req.body;
       

        const patient = await Patient.findById(patientId);
        if (!patient) return res.status(404).json({ error: 'Patient not found' });

        // بررسی اینکه درمانگر برای بیمار مجاز به ثبت گزارش است
        // if (!patient.therapists.includes(therapistId)) {
        //     return res.status(403).json({ error: 'Therapist not authorized for this patient' });
        // }

    const report = new Report({
        therapist: therapistId,
        patient: patientId,
        reportText,
    });

    await report.save();
    res.status(201).json(report);
       }catch(e){
        console.log(e)
       }
}; 

// دریافت گزارشات بیمار
exports.getPatientReports = async (req, res) => {
    const { patientId } = req.params;
    console.log(patientId)
    const patient = await Patient.findById(patientId);
    if (!patient) return res.status(404).json({ error: 'Patient not found' });

    const reports = await Report.find({ patient: patientId }).populate('therapist', 'firstName lastName')
   
    res.json(reports);
};
