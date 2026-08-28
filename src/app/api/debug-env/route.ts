import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  return NextResponse.json({
    'process.env.NEXT_PUBLIC_API_URL': process.env.NEXT_PUBLIC_API_URL,
    'NODE_ENV': process.env.NODE_ENV,
    note: '这是服务端 process.env 看到的值'
  })
}
