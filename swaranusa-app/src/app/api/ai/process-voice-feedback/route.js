import { NextResponse } from 'next/server';
import { Ollama } from 'ollama';

const ollama = new Ollama({ 
  host: process.env.OLLAMA_HOST || 'http://localhost:11434'
});

export async function POST(request) {
  try {
    // Check if Ollama is disabled via environment variable
    if (process.env.OLLAMA_HOST === 'disabled') {
      console.log('Ollama disabled via environment variable, using fallback processing');
      const { transcript } = await request.json();
      
      if (!transcript || transcript.trim().length < 10) {
        return NextResponse.json(
          { error: 'Transcript too short or empty' },
          { status: 400 }
        );
      }

      return NextResponse.json({
        success: true,
        data: {
          title: transcript.substring(0, 60).trim() + (transcript.length > 60 ? '...' : ''),
          location: 'Tidak disebutkan',
          content: transcript
        },
        warning: 'AI processing disabled, using raw transcript'
      });
    }

    const { transcript } = await request.json();

    if (!transcript || transcript.trim().length < 10) {
      return NextResponse.json(
        { error: 'Transcript too short or empty' },
        { status: 400 }
      );
    }

    // Use Llama to process voice transcript
    const prompt = `
    Kamu adalah asisten AI yang membantu warga menyampaikan masukan kepada pemerintah.

    TUGAS: Analisis rekaman suara warga yang sudah diubah menjadi teks, lalu ekstrak informasi penting.

    TEKS DARI REKAMAN SUARA:
    "${transcript}"

    INSTRUKSI:
    1. Buat JUDUL yang singkat dan jelas (maksimal 60 karakter)
    2. Identifikasi LOKASI SPESIFIK yang disebutkan (nama jalan, gang, RT/RW, landmark, dll). Jika tidak ada, tulis "Tidak disebutkan"
    3. Tulis ulang ISI MASUKAN dengan bahasa yang baik, terstruktur, dan profesional. Tambahkan:
    - Detail situasi
    - Dampak yang dirasakan
    - Harapan penyelesaian
    
    PENTING: Pertahankan semua informasi penting dari rekaman asli. Jangan menambah informasi yang tidak disebutkan.

    Respond HANYA dengan JSON format ini:
    {
    "title": "Judul masukan yang singkat dan jelas",
    "location": "Lokasi spesifik yang disebutkan, atau 'Tidak disebutkan'",
    "content": "Isi masukan yang sudah ditingkatkan kualitasnya dengan struktur yang baik"
    }

    Respond ONLY with valid JSON.`;

    const response = await ollama.chat({
      model: 'llama3.2:latest',
      messages: [{ role: 'user', content: prompt }],
      stream: false,
      options: {
        temperature: 0.7,
        top_p: 0.9,
      }
    });

    let result;
    try {
      // Try to parse JSON response
      const content = response.message.content.trim();
      
      // Sometimes LLM wraps JSON in markdown code blocks
      const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || 
                       content.match(/```\n([\s\S]*?)\n```/) ||
                       [null, content];
      
      result = JSON.parse(jsonMatch[1] || content);
      
      // Validate required fields
      if (!result.title || !result.content) {
        throw new Error('Missing required fields');
      }
      
    } catch (parseError) {
      console.error('Failed to parse AI response:', response.message.content);
      
      // Fallback: Use transcript as-is
      return NextResponse.json({
        success: true,
        data: {
          title: transcript.substring(0, 60).trim() + '...',
          location: 'Tidak disebutkan',
          content: transcript
        },
        warning: 'AI processing failed, using raw transcript'
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        title: result.title,
        location: result.location || 'Tidak disebutkan',
        content: result.content
      }
    });

  } catch (error) {
    console.error('Voice feedback processing error:', error);
    
    // Check if it's a connection error (Ollama not available)
    if (error.message?.includes('fetch failed') || 
        error.message?.includes('ECONNREFUSED') || 
        error.message?.includes('ENOTFOUND')) {
      console.log('Ollama connection failed, using fallback processing');
      
      try {
        const { transcript } = await request.json();
        if (!transcript || transcript.trim().length < 10) {
          return NextResponse.json(
            { error: 'Transcript too short or empty' },
            { status: 400 }
          );
        }

        return NextResponse.json({
          success: true,
          data: {
            title: transcript.substring(0, 60).trim() + (transcript.length > 60 ? '...' : ''),
            location: 'Tidak disebutkan',
            content: transcript
          },
          warning: 'AI service unavailable, using raw transcript'
        });
      } catch (parseError) {
        return NextResponse.json(
          { error: 'Failed to process voice feedback and parse request' },
          { status: 500 }
        );
      }
    }
    
    return NextResponse.json(
      { error: 'Failed to process voice feedback' },
      { status: 500 }
    );
  }
}