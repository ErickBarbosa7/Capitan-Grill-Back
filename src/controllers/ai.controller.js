const { GoogleGenAI } = require('@google/genai');

exports.generateDescription = async (req, res) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'GEMINI_API_KEY no configurada en el servidor' });
    }

    const { nombreEs, nombreEn, descripcionEs, categoriaNombreEs, categoriaNombreEn } = req.body;

    if (!nombreEs?.trim()) {
      return res.status(400).json({ error: 'El nombre en español es obligatorio' });
    }

    const ai = new GoogleGenAI({ apiKey });

    const context = `Platillo: ${nombreEs}${nombreEn ? ` / ${nombreEn}` : ''}${categoriaNombreEs ? `, Categoría: ${categoriaNombreEs}${categoriaNombreEn ? ` / ${categoriaNombreEn}` : ''}` : ''}.${descripcionEs?.trim() ? ` Descripción actual: "${descripcionEs}"` : ''}`;

    const prompt = `Eres un redactor experto en menús de restaurantes. Tu tono es atractivo, profesional y cálido.

Basándote en la siguiente información, genera:
1. Un nombre en inglés atractivo y auténtico (NO traducción literal, debe sonar como un nombre original escrito por un nativo)
2. Una descripción corta en español (máximo 2 oraciones, concisa y atractiva)
3. Una descripción corta en inglés que suene natural y auténtica (máximo 2 oraciones, NO traducción literal)

${context}

Responde ÚNICAMENTE con un objeto JSON válido con esta estructura exacta, sin texto adicional ni markdown:
{"nombreEn": "nombre en inglés", "descripcionEs": "texto en español", "descripcionEn": "texto en inglés"}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    const text = response.text;

    const cleaned = text.replace(/```(?:json)?\s*/gi, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleaned);

    res.json({
      nombreEn: parsed.nombreEn || '',
      descripcionEs: parsed.descripcionEs || '',
      descripcionEn: parsed.descripcionEn || '',
    });
  } catch (err) {
    const status = err.status || err.code || 500;
    const message = err.message || 'Error al generar la descripción con IA';
    console.error('AI Error:', status, message);
    res.status(500).json({ error: message });
  }
};
