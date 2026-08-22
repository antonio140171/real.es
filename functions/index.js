const { onRequest } = require('firebase-functions/v2/https');
const { defineSecret } = require('firebase-functions/params');
const nodemailer = require('nodemailer');

const SUPPORT_TO = defineSecret('SUPPORT_TO');
const SMTP_USER = defineSecret('SMTP_USER');
const SMTP_PASS = defineSecret('SMTP_PASS');

const allowedOrigins = new Set([
  'https://antonio140171.github.io',
  'https://real.es',
  'https://www.real.es'
]);

function clean(value, max = 200) {
  return String(value || '').trim().slice(0, max);
}

exports.sendBetaApplication = onRequest(
  { region: 'europe-west1', secrets: [SUPPORT_TO, SMTP_USER, SMTP_PASS], cors: false },
  async (req, res) => {
    const origin = req.get('origin') || '';
    if (allowedOrigins.has(origin)) {
      res.set('Access-Control-Allow-Origin', origin);
      res.set('Vary', 'Origin');
    }
    res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') return res.status(204).send('');
    if (req.method !== 'POST') return res.status(405).json({error:'Metodo non consentito'});
    if (origin && !allowedOrigins.has(origin)) return res.status(403).json({error:'Origine non consentita'});

    const body = req.body || {};
    if (clean(body.website, 200)) return res.status(200).json({ok:true}); // honeypot

    const name = clean(body.name, 80);
    const email = clean(body.email, 120);
    const city = clean(body.city, 80);
    const device = clean(body.device, 100);
    const androidVersion = clean(body.androidVersion, 40);
    const message = clean(body.message, 600);

    if (!name || !email || !city || !device || !androidVersion || !/^\S+@\S+\.\S+$/.test(email)) {
      return res.status(400).json({error:'Dati mancanti o non validi'});
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: SMTP_USER.value(), pass: SMTP_PASS.value() }
    });

    const text = [
      'Nuova candidatura Beta REAL', '',
      `Nome: ${name}`,
      `Email: ${email}`,
      `Città: ${city}`,
      `Telefono: ${device}`,
      `Versione Android: ${androidVersion}`,
      '',
      'Messaggio:', message || '(nessun messaggio)',
      '',
      `Origine: ${origin || 'non disponibile'}`
    ].join('\n');

    try {
      await transporter.sendMail({
        from: `REAL Beta <${SMTP_USER.value()}>`,
        to: SUPPORT_TO.value(),
        replyTo: email,
        subject: `Candidatura Beta REAL — ${name}`,
        text
      });
      return res.status(200).json({ok:true});
    } catch (e) {
      console.error('sendBetaApplication failed', e);
      return res.status(500).json({error:'Invio non riuscito'});
    }
  }
);
