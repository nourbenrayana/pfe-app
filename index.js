require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const Joi = require('joi');
const { DocumentStore } = require('ravendb');
const fs = require('fs');

const app = express();
app.use(bodyParser.json());

// 1️⃣ Lecture du certificat
const certificate = {
  certificate: fs.readFileSync(process.env.RAVENDB_CERT_PATH),
  type: "pfx",
};

// 2️⃣ Configuration de RavenDB avec le certificat
const store = new DocumentStore(
  process.env.RAVENDB_URL,
  process.env.RAVENDB_DATABASE
);
store.authOptions = certificate;  // Ajoute authOptions AVANT initialize
store.initialize();

// 3️⃣ Ouvre une session
const session = store.openSession();

// 4️⃣ Joi Schema
const userSchema = Joi.object({
  name: Joi.string().min(3).required(),
  email: Joi.string().email().required(),
});

// 5️⃣ Route d'inscription
app.post('/register', async (req, res) => {
  const { error } = userSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  const { name, email } = req.body;

  try {
    const existingUser = await session
      .query({ collection: 'Users' })
      .whereEquals('email', email)
      .firstOrNull();

    if (existingUser) {
      return res.status(409).json({ error: 'Cet email est déjà utilisé.' });
    }

    const user = { name, email, createdAt: new Date() };
    await session.store(user, `users|${email}`);
    await session.saveChanges();

    res.status(201).json({ message: 'Inscription réussie', user });
  } catch (err) {
    console.error('🚨 Erreur serveur:', err.message);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// 6️⃣ Lancement du serveur
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Serveur en écoute sur http://localhost:${PORT}`);
});
