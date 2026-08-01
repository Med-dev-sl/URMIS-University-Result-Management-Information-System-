import prisma from '../../prisma-runtime.js'

let cachedPlatformSettings = null

export async function refreshPlatformSettingsCache() {
  cachedPlatformSettings = await prisma.platformSetting.findMany({ orderBy: { key: 'asc' } })
  return cachedPlatformSettings
}

export async function getPlatformSettingsCache() {
  if (!cachedPlatformSettings) {
    await refreshPlatformSettingsCache()
  }
  return cachedPlatformSettings
}

export async function getPlatformSettingByKey(key) {
  const settings = await getPlatformSettingsCache()
  return settings.find((setting) => setting.key === key) ?? null
}

export function clearPlatformSettingsCache() {
  cachedPlatformSettings = null
}
