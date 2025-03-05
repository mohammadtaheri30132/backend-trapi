const express = require('express');
const app = express();
const cors = require('cors');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const authRoutes = require('./routes/AuthRoutes');
const patientRoutes = require('./routes/PatientRoutes');
const reportRoutes = require('./routes/ReportRoutes');
const clinicRoutes = require('./routes/ClinicRoutes');
const therapistRoutes = require('./routes/TherapistRoutes');
const exerciseRoutes = require('./routes/ExerciseRoutes');
const VisitRoutes = require('./routes/VisitRoutes');

app.use(cors());

app.use(express.json());
app.get('/', (req,res)=>{
    res.send('Hello World');
})

// اتصال به دیتابیس
mongoose.connect("mongodb://localhost:27017/mydatabase", {
  serverSelectionTimeoutMS: 5000, // حداکثر زمان انتظار برای اتصال
})
  .then(async() => {
      
    // حذف کل دیتابیس
  //   try {
  //     await mongoose.connection.dropDatabase();
  //     console.log('Database dropped successfully');
  // } catch (error) {
  //     console.error('Error dropping database:', error);
  // }
  })
  .catch((err) => console.error("MongoDB connection error:", err));
// Middlewares
app.use(bodyParser.json());
// Routes
app.use('/api',authRoutes);
app.use('/api',patientRoutes);
app.use('/api',reportRoutes);
app.use('/api',clinicRoutes);
app.use('/api',therapistRoutes);
app.use('/api',exerciseRoutes);
app.use('/api',VisitRoutes);

// شروع سرور
app.listen(4000, () => {
    console.log('Server started on port 4000');
});
