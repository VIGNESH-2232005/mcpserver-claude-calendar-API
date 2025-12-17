const API_BASE = 'http://localhost:3100/employees';

async function listEmployees() {
    const response = await fetch(API_BASE);
    if (!response.ok) {
        throw new Error(`Failed to list employees: ${response.statusText}`);
    }
    return response.json();
}

async function addEmployee({ name, role, email, phone, department }) {
    const response = await fetch(API_BASE, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, role, email, phone, department }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(`Failed to add employee: ${error.error || response.statusText}`);
    }
    return response.json();
}

async function updateEmployee(id, { name, role, email, phone, department }) {
    const response = await fetch(`${API_BASE}/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, role, email, phone, department }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(`Failed to update employee: ${error.error || response.statusText}`);
    }
    return response.json();
}

async function deleteEmployee(id) {
    const response = await fetch(`${API_BASE}/${id}`, {
        method: 'DELETE',
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(`Failed to delete employee: ${error.error || response.statusText}`);
    }
    return response.json();
}

module.exports = { listEmployees, addEmployee, updateEmployee, deleteEmployee };

