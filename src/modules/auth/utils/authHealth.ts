import mongoose from "mongoose"
import axios from "axios"
import { redisClient } from "@common/config/redisClient"

type HealthStatus = "ok" | "degraded" | "error"

export const checkDatabase = () => {
  return mongoose.connection.readyState === 1
    ? "connected"
    : "disconnected"
}

export const checkGoogleOAuth = async () => {
  try {
    await axios.get("https://accounts.google.com/.well-known/openid-configuration", { timeout: 2000 })
    return "reachable"
  } catch {
    return "unreachable"
  }
}

export const checkRedis = async () => {
  try {
    await redisClient.ping()
    return "connected"
  } catch {
    return "disconnected"
  }
}

export const getAuthHealth = async () => {
  const dbStatus = checkDatabase()
  const oauthStatus = await checkGoogleOAuth()
  const redisStatus = await checkRedis()

  let status: HealthStatus = "ok"

  // Critical dependency
  if (dbStatus !== "connected" || redisStatus !== "connected") {
    status = "error"
  }

  // Non-critical dependency
  else if (oauthStatus !== "reachable") {
    status = "degraded"
  }

  return {
    status,
    services: {
      database: dbStatus,
      oauth: oauthStatus,
      redis: redisStatus
    },
    uptime: process.uptime()
  }
}