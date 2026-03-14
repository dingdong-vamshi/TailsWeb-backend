const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect('mongodb://127.0.0.1:27017/assignment_db', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log('db connected maybe')).catch(err => console.log('db error', err));

const UserSchema = new mongoose.Schema({
    email: { type: String, required: true },
    password: { type: String, required: true },
    role: { type: String, required: true }
});
const User = mongoose.model('User', UserSchema);

const AssignmentSchema = new mongoose.Schema({
    title: String,
    description: String,
    dueDate: String,
    status: String 
}, { timestamps: true });
const Assignment = mongoose.model('Assignment', AssignmentSchema);

const SubSchema = new mongoose.Schema({
    assignmentId: String,
    studentId: String,
    answer: String,
    date: { type: Date, default: Date.now }
});
const Sub = mongoose.model('Submission', SubSchema);

const SECRET_KEY = "my_super_secret_key_123_temp";

app.listen(5000, () => {
    console.log('server on 5000 !!');
});
