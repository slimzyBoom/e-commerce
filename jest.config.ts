import { Config } from "jest";
import { createDefaultPreset } from "ts-jest";

const tsJestTrasnformConfig = createDefaultPreset().transform

const config: Config = {
    preset: "ts-jest",
    testEnvironment: "node",
    transform: {
        ...tsJestTrasnformConfig
    },
    testMatch: ["**/__tests__/**/*.ts", "**/?(*.)+(spec|test).ts"],
    moduleNameMapper: {
        "^(\\.{1,2}/.*)\\.js$": "$1",
    },
    setupFiles: ["<rootDir>/src/jest.setup.ts"],
    clearMocks: true
}

export default config;