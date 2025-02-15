const express = require('express');
const fs = require('fs');
const { DocumentStore } = require('ravendb');

const app = express();

// 📌 Configuration de l'authentification
const authOptions = {
    certificate: fs.readFileSync("C:\\RavenDB-7.0.0-windows-x64\\nour.Cluster.Settings 2025-02-12 09-20\\admin.client.certificate.nour.pfx"),
    type: "pfx",
};

// 📌 Initialisation unique de RavenDB
const store = new DocumentStore("https://a.nour.ravendb.community/", "BD", authOptions);
store.initialize();

// 🔹 Modèle "Employee"
class Employee {
    constructor(firstName, lastName, age, department) {
        this.FirstName = firstName;
        this.LastName = lastName;
        this.Age = age;
        this.Department = department;
    }
}

// 🌱 Route pour créer un employé
app.get('/create', async (req, res) => {
    try {
        const session = store.openSession();
        const newEmployee = new Employee("Alice", "Smith", 28, "HR");

        await session.store(newEmployee, 'employees/2-B');
        await session.saveChanges();

        res.send("Employee created successfully!");
    } catch (error) {
        console.error("Error creating employee:", error);
        res.status(500).send('Failed to create employee.');
    }
});

// 🔍 Route pour récupérer un employé
app.get('/employee/:id', async (req, res) => {
    try {
        const session = store.openSession();
        const employee = await session.load(`employees/${req.params.id}`);

        if (employee) {
            res.send(`Employee Last Name: ${employee.LastName}`);
        } else {
            res.status(404).send('Employee not found');
        }
    } catch (error) {
        console.error("Error fetching employee:", error);
        res.status(500).send('Internal Server Error');
    }
});

// 📌 Démarrage du serveur
app.listen(3000, () => console.log('Server is running on http://localhost:3000'));
