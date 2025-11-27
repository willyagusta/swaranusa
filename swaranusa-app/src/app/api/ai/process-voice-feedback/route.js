import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || ''
});

export async function POST(request) {
  try {
    // Check if Claude API key is not set
    if (!process.env.ANTHROPIC_API_KEY) {
      console.log('Claude API key not set, using fallback processing');
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

    // Use Claude to process voice transcript
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

    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    });

    let result;
    try {
      // Try to parse JSON response
      const content = response.content[0].type === 'text' ? response.content[0].text.trim() : '';
      
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
      console.error('Failed to parse AI response:', response.content);
      
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
    
    // Check if it's an API error
    if (error.status === 401 || error.message?.includes('api_key')) {
      console.log('Claude API authentication failed, using fallback processing');
      
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
