const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');

const app = express();
app.use(cors());
app.use(express.json());

// conn data
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

const checkTeacher = (req, res, next) => {
    let t = req.headers.authorization;
    if(!t) return res.status(401).json({msg: 'no token'});
    try {
        let decoded = jwt.verify(t.split(" ")[1], SECRET_KEY);
        if(decoded.role !== 'teacher') return res.status(403).json({msg: 'not teacher'});
        req.uInfo = decoded;
        next();
    } catch(e) {
        res.status(400).json({msg: 'bad token'});
    }
}

app.post('/login', async (req, res) => {
    let e = req.body.email;
    let p = req.body.password;
    
    let u = await User.findOne({email: e, password: p});
    if(u) {
        let token123 = jwt.sign({id: u._id, role: u.role}, SECRET_KEY, {expiresIn: '2h'});
        res.json({token: token123, role: u.role});
    } else {
        res.status(400).json({err: 'wrong creds'});
    }
});

app.get('/initdb', async (req, res) => {
    await User.create({email: 'teacher@test.com', password: '123', role: 'teacher'});
    await User.create({email: 'student@test.com', password: '123', role: 'student'});
    res.send('done init');
});

app.listen(5000, () => {
    console.log('server on 5000 !!');
});
