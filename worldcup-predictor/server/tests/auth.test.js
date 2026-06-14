import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { createTestApp, closeTestApp, getBaseUrl } from './helpers.js'

const PORT = 3099
let baseUrl

beforeAll(async () => {
  await createTestApp(PORT)
  baseUrl = getBaseUrl(PORT)
})

afterAll(async () => {
  await closeTestApp()
})

describe('Auth API', () => {
  const testUser = {
    username: `testuser_${Date.now()}`,
    password: 'TestPass123!',
    nickname: 'Test User'
  }

  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      const response = await fetch(`${baseUrl}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testUser)
      })

      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data.message).toBe('User registered successfully')
      expect(data.user).toBeDefined()
      expect(data.user.username).toBe(testUser.username)
      expect(data.accessToken).toBeDefined()
      expect(data.refreshToken).toBeDefined()
    })

    it('should reject duplicate username', async () => {
      const response = await fetch(`${baseUrl}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testUser)
      })

      expect(response.status).toBe(409)
    })

    it('should reject short username', async () => {
      const response = await fetch(`${baseUrl}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'ab', password: 'TestPass123!' })
      })

      expect(response.status).toBe(400)
    })

    it('should reject short password', async () => {
      const response = await fetch(`${baseUrl}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'testuser2', password: '123' })
      })

      expect(response.status).toBe(400)
    })
  })

  describe('POST /api/auth/login', () => {
    it('should login with valid credentials', async () => {
      const response = await fetch(`${baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: testUser.username, password: testUser.password })
      })

      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.message).toBe('登录成功')
      expect(data.user).toBeDefined()
      expect(data.accessToken).toBeDefined()
    })

    it('should reject invalid password', async () => {
      const response = await fetch(`${baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: testUser.username, password: 'wrongpassword' })
      })

      expect(response.status).toBe(401)
    })

    it('should reject non-existent user', async () => {
      const response = await fetch(`${baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'nonexistent', password: 'password' })
      })

      expect(response.status).toBe(401)
    })
  })

  describe('GET /api/auth/me', () => {
    it('should get current user with valid token', async () => {
      // First login to get token
      const loginResponse = await fetch(`${baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: testUser.username, password: testUser.password })
      })

      const loginData = await loginResponse.json()
      const token = loginData.accessToken

      // Get current user
      const response = await fetch(`${baseUrl}/api/auth/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.user).toBeDefined()
      expect(data.user.username).toBe(testUser.username)
    })

    it('should reject without token', async () => {
      const response = await fetch(`${baseUrl}/api/auth/me`)
      expect(response.status).toBe(401)
    })
  })
})
