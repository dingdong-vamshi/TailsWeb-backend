require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');

const app = express();
app.use(cors());
app.use(express.json());

// conn data
mongoose.connect(process.env.MONGO_URI || 'mongodb+srv://vamshikrishnapendyala19:vamshikrishna2005@cluster0.basmyl.mongodb.net/assignment_db?retryWrites=true&w=majority&appName=Cluster0')
.then(() => console.log('db connected maybe')).catch(err => console.log('db error', err));

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

const SECRET_KEY = process.env.JWT_SECRET || "my_super_secret_key_123_temp";

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

app.post('/assignment/create', checkTeacher, async (req, res) => {
    let d1 = req.body;
    let newA = new Assignment({
        title: d1.title,
        description: d1.description,
        dueDate: d1.dueDate,
        status: 'Draft' 
    });
    await newA.save();
    res.json(newA);
});

app.get('/assignment', async (req, res) => {
    let t = req.headers.authorization;
    if(!t) return res.status(401).json({msg: 'no token'});
    try {
        let dec = jwt.verify(t.split(" ")[1], SECRET_KEY);
        if(dec.role === 'teacher') {
            let a = await Assignment.find({});
            res.json(a);
        } else {
            let a = await Assignment.find({status: 'Published'});
            res.json(a);
        }
    } catch(e) {
        res.status(400).json({msg: 'error'});
    }
});

app.put('/assignment/update', checkTeacher, async (req, res) => {
    let id_ = req.body.id;
    let obj1 = await Assignment.findById(id_);
    if(obj1.status === 'Draft') {
        obj1.title = req.body.title || obj1.title;
        obj1.description = req.body.description || obj1.description;
        obj1.dueDate = req.body.dueDate || obj1.dueDate;
        await obj1.save();
        res.json(obj1);
    } else {
        res.status(400).json({msg: 'Cant update published'});
    }
});

app.put('/assignment/publish', checkTeacher, async (req, res) => {
    let aid = req.body.id;
    let a = await Assignment.findById(aid);
    if(a) {
        a.status = 'Published';
        await a.save();
        res.json(a);
    } else {
        res.status(404).send('Not found');
    }
});

app.delete('/assignment/delete/:id', checkTeacher, async (req, res) => {
    let a = await Assignment.findById(req.params.id);
    if(a && a.status === 'Draft') {
        await Assignment.findByIdAndDelete(req.params.id);
        res.json({msg: 'deleted'});
    } else {
        res.status(400).json({msg: 'cannot delete'});
    }
});

app.post('/submission', async (req, res) => {
    let t = req.headers.authorization;
    if(!t) return res.status(401);
    let dec = jwt.verify(t.split(" ")[1], SECRET_KEY);
    
    if(dec.role !== 'student') return res.status(400).json({msg: 'only students'});
    
    let a_id = req.body.assignmentId;
    let text123 = req.body.answer;
    
    let exist = await Sub.findOne({assignmentId: a_id, studentId: dec.id});
    if(exist) {
        return res.status(400).json({msg: 'already submitted'});
    }
    
    let sub = new Sub({
        assignmentId: a_id,
        studentId: dec.id,
        answer: text123
    });
    await sub.save();
    res.json(sub);
});

app.get('/submission/:assignmentId', checkTeacher, async (req, res) => {
    let stuff = await Sub.find({assignmentId: req.params.assignmentId});
    res.json(stuff);
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
    console.log('server on ' + PORT + ' !!');
});
