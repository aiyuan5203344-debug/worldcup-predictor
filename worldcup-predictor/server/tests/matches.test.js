import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { createTestApp, closeTestApp, getBaseUrl } from './helpers.js'

const PORT = 3098
let baseUrl

beforeAll(async () => {
  await createTestApp(PORT)
  baseUrl = getBaseUrl(PORT)
})

afterAll(async () => {
  await closeTestApp()
})

describe('Matches API', () => {
  describe('GET /api/matches', () => {
    it('should return list of matches', async () => {
      const response = await fetch(`${baseUrl}/api/matches`)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.matches).toBeDefined()
      expect(Array.isArray(data.matches)).toBe(true)
    })

    it('should filter by status', async () => {
      const response = await fetch(`${baseUrl}/api/matches?status=upcoming`)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.matches).toBeDefined()
    })

    it('should filter by group', async () => {
      const response = await fetch(`${baseUrl}/api/matches?group=A`)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.matches).toBeDefined()
    })

    it('should limit results', async () => {
      const response = await fetch(`${baseUrl}/api/matches?limit=5`)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.matches.length).toBeLessThanOrEqual(5)
    })
  })

  describe('GET /api/matches/:id', () => {
    it('should return match by ID', async () => {
      const listResponse = await fetch(`${baseUrl}/api/matches?limit=1`)
      const listData = await listResponse.json()

      if (listData.matches.length > 0) {
        const matchId = listData.matches[0].id
        const response = await fetch(`${baseUrl}/api/matches/${matchId}`)
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(data.match).toBeDefined()
        expect(data.match.id).toBe(matchId)
      }
    })

    it('should return 404 for non-existent match', async () => {
      const response = await fetch(`${baseUrl}/api/matches/99999`)
      expect(response.status).toBe(404)
    })
  })

  describe('GET /api/matches/:id/odds', () => {
    it('should return odds for a match', async () => {
      const listResponse = await fetch(`${baseUrl}/api/matches?limit=1`)
      const listData = await listResponse.json()

      if (listData.matches.length > 0) {
        const matchId = listData.matches[0].id
        const response = await fetch(`${baseUrl}/api/matches/${matchId}/odds`)
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(data.odds).toBeDefined()
        expect(data.odds.worldbet).toBeDefined()
        expect(data.odds.asianOdds).toBeDefined()
        expect(data.odds.globalSports).toBeDefined()

        expect(data.odds.worldbet.home).toBeGreaterThan(0)
        expect(data.odds.worldbet.draw).toBeGreaterThan(0)
        expect(data.odds.worldbet.away).toBeGreaterThan(0)
      }
    })
  })
})
