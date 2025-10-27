import { NextResponse } from 'next/server';
import { analyzeMediaWithAI } from '@/lib/ollama';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    
    if (!file) {
      return NextResponse.json(
        { success: false, error: 'Tidak ada file yang diunggah' },
        { status: 400 }
      );
    }

    // Validate file type - only images allowed
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: 'Format file tidak didukung. Gunakan gambar (JPG, PNG, GIF, WebP) saja.' },
        { status: 400 }
      );
    }

    // Validate file size (max 50MB)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, error: 'Ukuran file terlalu besar. Maksimal 50MB.' },
        { status: 400 }
      );
    }

    // Convert file to base64 for AI processing
    const buffer = await file.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');
    const mimeType = file.type;

    // Analyze media with AI
    const analysisResult = await analyzeMediaWithAI(base64, mimeType, file.name);

    if (!analysisResult.success) {
      return NextResponse.json(
        { success: false, error: analysisResult.error || 'Gagal menganalisis file' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: analysisResult.data,
      message: analysisResult.data.title.includes('Masukan') ? 'File dianalisis menggunakan sistem fallback' : 'File berhasil dianalisis dengan AI'
    });

  } catch (error) {
    console.error('Error processing media feedback:', error);
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan saat memproses file' },
      { status: 500 }
    );
  }
}
