import { NextRequest, NextResponse } from 'next/server'

const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36'

const HEADERS = { 'User-Agent': UA, Referer: 'https://music.163.com/' }

type SongResult = {
  id: string
  name?: string
  artist?: string
  author?: string
  cover?: string
  pic?: string
  url?: string
  lrc?: string
  error?: string
}

type Detail = {
  name?: string
  ar?: { name?: string }[]
  al?: { picUrl?: string }
}

/** 详情：v3 接口比 v1 稳（v1 常被限流成 405） */
async function fetchDetail(songId: string): Promise<Detail | null> {
  const url = `https://music.163.com/api/v3/song/detail?c=${encodeURIComponent(
    JSON.stringify([{ id: Number(songId) }]),
  )}`
  const res = await fetch(url, { headers: HEADERS, signal: AbortSignal.timeout(6000) })
  if (!res.ok) return null
  const data = (await res.json()) as { songs?: Detail[] }
  return data.songs?.[0] ?? null
}

async function fetchLyric(songId: string): Promise<string> {
  try {
    const res = await fetch(
      `https://music.163.com/api/song/lyric?id=${songId}&lv=-1&kv=-1&tv=-1`,
      { headers: HEADERS, signal: AbortSignal.timeout(6000) },
    )
    if (!res.ok) return ''
    const data = (await res.json()) as { lrc?: { lyric?: string } }
    return data.lrc?.lyric || ''
  } catch {
    return ''
  }
}

/** 直链：官方 outer/url 现在经常 403，先用第三方解析拿真实 mp3 地址 */
async function fetchUrl(songId: string): Promise<string> {
  try {
    const res = await fetch(
      `https://music-api.gdstudio.xyz/api.php?types=url&source=netease&id=${songId}&br=320`,
      { signal: AbortSignal.timeout(8000) },
    )
    if (res.ok) {
      const data = (await res.json()) as { url?: string }
      if (data.url) return data.url
    }
  } catch {
    /* 落到官方外链 */
  }
  return `https://music.163.com/song/media/outer/url?id=${songId}.mp3`
}

export async function GET(request: NextRequest) {
  const ids = request.nextUrl.searchParams.get('ids')
  if (!ids) {
    return NextResponse.json({ error: 'Missing ids parameter' }, { status: 400 })
  }

  const songIds = ids.split(',').map((id) => id.trim()).filter(Boolean)

  const results: SongResult[] = await Promise.all(
    songIds.map(async (songId): Promise<SongResult> => {
      try {
        const [detail, lrc, url] = await Promise.all([
          fetchDetail(songId),
          fetchLyric(songId),
          fetchUrl(songId),
        ])

        if (!detail) return { id: songId, error: 'not_found' }

        const artistName = detail.ar?.[0]?.name || '未知歌手'
        const cover = detail.al?.picUrl || ''

        return {
          id: songId,
          name: detail.name,
          artist: artistName,
          author: artistName,
          cover,
          pic: cover,
          url,
          lrc,
        }
      } catch (error) {
        console.error(`[api/music] 获取歌曲 ${songId} 失败:`, error)
        return { id: songId, error: String(error) }
      }
    }),
  )

  return NextResponse.json(results)
}
