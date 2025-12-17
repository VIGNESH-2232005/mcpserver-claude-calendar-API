const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3100;

app.use(cors());
app.use(express.json());

const DATA_DIR = path.join(__dirname, '../data');
const DATA_FILE = path.join(DATA_DIR, 'employees.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR);
}

function readData() {
    if (!fs.existsSync(DATA_FILE)) {
        return [];
    }
    const content = fs.readFileSync(DATA_FILE, 'utf-8');
    try {
        return JSON.parse(content);
    } catch (e) {
        return [];
    }
}

function writeData(data) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// GET /employees - List all employees
app.get('/employees', (req, res) => {
    try {
        const employees = readData();
        res.json(employees);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST /employees - Add new employee
app.post('/employees', (req, res) => {
    try {
        const { name, role, email, phone, department } = req.body;
        if (!name || !role || !email) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const employees = readData();
        const id = Math.random().toString(36).substr(2, 9);
        const newEmployee = { id, name, role, email, phone, department };

        employees.push(newEmployee);
        writeData(employees);

        res.status(201).json(newEmployee);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// PUT /employees/:id - Update employee
app.put('/employees/:id', (req, res) => {
    try {
        const { id } = req.params;
        const { name, role, email, phone, department } = req.body;

        const employees = readData();
        const index = employees.findIndex(e => e.id === id);

        if (index === -1) {
            return res.status(404).json({ error: 'Employee not found' });
        }

        const current = employees[index];
        const updated = {
            ...current,
            name: name || current.name,
            role: role || current.role,
            email: email || current.email,
            phone: phone || current.phone,
            department: department || current.department
        };

        employees[index] = updated;
        writeData(employees);

        res.json(updated);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// DELETE /employees/:id - Delete employee
app.delete('/employees/:id', (req, res) => {
    try {
        const { id } = req.params;

        const employees = readData();
        const index = employees.findIndex(e => e.id === id);

        if (index === -1) {
            return res.status(404).json({ error: 'Employee not found' });
        }

        employees.splice(index, 1);
        writeData(employees);

        res.json({ success: true, deletedId: id });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

function startApiServer() {
    const server = app.listen(PORT, () => {
        console.error(`Employee API Server running on http://localhost:${PORT}`);
    });
    server.on('error', (e) => {
        console.error(`API Server Error (ignored, possibly already running): ${e.message}`);
    });
    return server;
}

if (require.main === module) {
    startApiServer();
}

module.exports = { startApiServer };
