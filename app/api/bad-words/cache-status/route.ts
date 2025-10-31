import { NextRequest, NextResponse } from "next/server";

// Cache durumunu kontrol etmek için basit bir endpoint
let cacheInfo = {
  lastClearTime: 0,
  totalClears: 0
};

export async function GET(request: NextRequest) {
  try {
    return NextResponse.json({ 
      success: true,
      cacheInfo: {
        ...cacheInfo,
        timeSinceLastClear: Date.now() - cacheInfo.lastClearTime
      }
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    cacheInfo.lastClearTime = Date.now();
    cacheInfo.totalClears += 1;
    
    return NextResponse.json({ 
      success: true,
      message: "Cache durumu güncellendi",
      cacheInfo
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
