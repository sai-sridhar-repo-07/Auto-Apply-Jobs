import fs from 'fs'
import path from 'path'
import yaml from 'yaml'
import type { UserProfile, PortalsConfig } from '@/types'

const CONFIG_DIR = path.join(process.cwd(), 'config')

function loadYaml<T>(filename: string, fallback: string): T {
  const filePath = path.join(CONFIG_DIR, filename)
  const fallbackPath = path.join(CONFIG_DIR, fallback)

  const src = fs.existsSync(filePath) ? filePath : fallbackPath
  if (!fs.existsSync(src)) {
    throw new Error(`Config file not found: ${filename}. Copy ${fallback} to ${filename} and fill in your details.`)
  }
  return yaml.parse(fs.readFileSync(src, 'utf-8')) as T
}

export function getProfile(): UserProfile {
  return loadYaml<UserProfile>('profile.yml', 'profile.example.yml')
}

export function getPortals(): PortalsConfig {
  return loadYaml<PortalsConfig>('portals.yml', 'portals.example.yml')
}

export function getAnthropicKey(): string {
  const key = process.env.ANTHROPIC_API_KEY
  if (!key) throw new Error('ANTHROPIC_API_KEY environment variable is not set.')
  return key
}
