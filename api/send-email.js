module.exports = async function handler(req, res) {
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Responder OPTIONS para preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Apenas POST é permitido
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { to, subject, html } = req.body;

    // Validação
    if (!to || !subject || !html) {
      return res.status(400).json({ error: 'Missing required fields: to, subject, html' });
    }

    // Chamar API do Resend diretamente
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`
      },
      body: JSON.stringify({
        from: 'Gerenciador de Tarefas <onboarding@resend.dev>',
        to: [to],
        subject: subject,
        html: html,
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Erro da API Resend:', data);
      return res.status(response.status).json({ error: data.message || 'Erro ao enviar email' });
    }

    console.log('Email enviado com sucesso:', data);
    return res.status(200).json({ success: true, data });
  } catch (error) {
    console.error('Erro ao enviar email:', error);
    return res.status(500).json({ error: error.message });
  }
}
