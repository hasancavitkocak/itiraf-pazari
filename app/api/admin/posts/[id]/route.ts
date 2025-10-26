import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json();
    const { id } = await params;
    const { title, content, category_id, custom_location } = body;

    const updateData: any = {
      content,
    };

    if (title !== undefined) updateData.title = title;
    if (category_id) updateData.category_id = category_id;
    if (custom_location !== undefined) updateData.custom_location = custom_location;

    const { error } = await supabaseAdmin
      .from('posts')
      .update(updateData)
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}