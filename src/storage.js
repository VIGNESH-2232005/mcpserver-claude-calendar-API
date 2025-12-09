const fs = require('fs');
const path = require('path');

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

async function listEmployees() {
    return readData();
}

async function addEmployee({ name, role, email }) {
    const employees = readData();
    const id = Math.random().toString(36).substr(2, 9);
    const newEmployee = { id, name, role, email };
    employees.push(newEmployee);
    writeData(employees);
    return newEmployee;
}

async function updateEmployee(id, { name, role, email }) {
    const employees = readData();
    const index = employees.findIndex(e => e.id === id);
    if (index === -1) {
        throw new Error(`Employee with ID ${id} not found`);
    }

    // Update only provided fields
    const current = employees[index];
    const updated = {
        ...current,
        name: name || current.name,
        role: role || current.role,
        email: email || current.email
    };

    employees[index] = updated;
    writeData(employees);
    return updated;
}

async function deleteEmployee(id) {
    const employees = readData();
    const index = employees.findIndex(e => e.id === id);
    if (index === -1) {
        throw new Error(`Employee with ID ${id} not found`);
    }

    employees.splice(index, 1);
    writeData(employees);
    return { success: true, deletedId: id };
}

module.exports = { listEmployees, addEmployee, updateEmployee, deleteEmployee };
