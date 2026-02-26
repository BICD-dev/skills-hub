import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

// ─── TYPES ────────────────────────────────────────────────────────────────────
interface Config {
  port: number;
  korapay: {
    apiBaseUrl: string;
    secretKey: string;
    publicKey: string;
    redirectUrl: string;
    webhookUrl: string;
  };
}


// ─── VALIDATION SCHEMA ────────────────────────────────────────────────────────
interface ValidationRule {
  required: boolean;
  default?: string | number;
  validator?: (value: string) => boolean;
  errorMessage?: string;
}

const validationSchema: Record<string, ValidationRule> = {
  PORT: {
    required: false,
    default: 3000,
    validator: (value) => !isNaN(Number(value)) && Number(value) > 0,
    errorMessage: "PORT must be a positive number",
  },
  KORAPAY_API_BASE_URL: {
    required: true,
    validator: (value) => /^https?:\/\/.+/.test(value),
    errorMessage: "KORAPAY_API_BASE_URL must be a valid URL",
  },
  KORAPAY_SECRET_KEY: {
    required: true,
    errorMessage: "KORAPAY_SECRET_KEY is required",
  },
  KORAPAY_PUBLIC_KEY: {
    required: true,
    errorMessage: "KORAPAY_PUBLIC_KEY is required",
  },
  KORAPAY_REDIRECT_URL: {
    required: true,
    validator: (value) => /^https?:\/\/.+/.test(value),
    errorMessage: "KORAPAY_REDIRECT_URL must be a valid URL",
  },
  KORAPAY_WEBHOOK_URL: {
    required: true,
    validator: (value) => /^https?:\/\/.+/.test(value),
    errorMessage: "KORAPAY_WEBHOOK_URL must be a valid URL",
  },
};

// ─── VALIDATION FUNCTION ──────────────────────────────────────────────────────
function validateEnv(envVars: NodeJS.ProcessEnv): string[] {
  const errors: string[] = [];

  Object.entries(validationSchema).forEach(([key, rule]) => {
    const value = envVars[key];

    // Check if required variable is missing
    if (rule.required && (!value || value.trim() === "")) {
      errors.push(`${key} is required`);
      return;
    }

    // Skip validation if value is not provided and not required
    if (!value) {
      return;
    }

    // Run custom validator if provided
    if (rule.validator && !rule.validator(value)) {
      errors.push(rule.errorMessage || `${key} is invalid`);
    }
  });

  return errors;
}

// ─── CONFIG SERVICE ───────────────────────────────────────────────────────────
class ConfigService {
  private config: Config;
  private isValidated: boolean = false;

  constructor() {
    this.config = this.initializeConfig();
  }

  private initializeConfig(): Config {
    return {
      port: 3000,
      korapay: {
        apiBaseUrl: "",
        secretKey: "",
        publicKey: "",
        redirectUrl: "",
        webhookUrl: "",
      },
    };
  }

  /**
   * Validates all environment variables and loads them into the config object
   * Throws an error if validation fails
   */
  validate(): this {
    if (this.isValidated) {
      return this;
    }

    const errors = validateEnv(process.env);

    if (errors.length > 0) {
      const errorMessage = `Environment validation failed:\n${errors.map((e) => `  • ${e}`).join("\n")}`;
      throw new Error(errorMessage);
    }

    // Load validated environment variables into config
    this.config = {
      port: process.env.PORT ? Number(process.env.PORT) : 3000,
      korapay: {
        apiBaseUrl: process.env.KORAPAY_API_BASE_URL || "",
        secretKey: process.env.KORAPAY_SECRET_KEY || "",
        publicKey: process.env.KORAPAY_PUBLIC_KEY || "",
        redirectUrl: process.env.KORAPAY_REDIRECT_URL || "",
        webhookUrl: process.env.KORAPAY_WEBHOOK_URL || "",
      },
    };

    this.isValidated = true;
    return this;
  }

  /**
   * Returns the entire config object
   */
  getConfig(): Config {
    if (!this.isValidated) {
      throw new Error("Configuration not validated. Call validate() first.");
    }
    return this.config;
  }

  /**
   * Returns a specific config value
   * @param path - dot notation path to config value (e.g., 'korapay.secretKey')
   */
  get<T = any>(path: string): T {
    if (!this.isValidated) {
      throw new Error("Configuration not validated. Call validate() first.");
    }

    const keys = path.split(".");
    let value: any = this.config;

    for (const key of keys) {
      if (value === null || value === undefined) {
        throw new Error(`Config path "${path}" is invalid`);
      }
      value = value[key];
    }

    return value;
  }

  /**
   * Returns the port configuration
   */
  getPort(): number {
    return this.get<number>("port");
  }

  /**
   * Returns the Korapay configuration
   */
  getKorapayConfig() {
    return this.get("korapay");
  }
}

// ─── SINGLETON INSTANCE ───────────────────────────────────────────────────────
const configService = new ConfigService();

export default configService;
export { Config, ConfigService };
