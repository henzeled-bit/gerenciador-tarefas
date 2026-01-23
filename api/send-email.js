import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  // Apenas POST é permitido
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { to, subject, html } = req.body;

    // Validação
    if (!to || !subject || !html) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Enviar email via Resend
    const data = await resend.emails.send({
      from: 'Gerenciador de Tarefas <onboarding@resend.dev>',
      to: [to],
      subject: subject,
      html: html,
    });

    return res.status(200).json({ success: true, data });
  } catch (error) {
    console.error('Erro ao enviar email:', error);
    return res.status(500).json({ error: error.message });
  }
}
