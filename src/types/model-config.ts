/** 用户模型配置 DTO */

export interface ModelConfigItem {
  id: number;
  configName: string;
  provider: string;
  baseUrl: string;
  apiKeyMasked: string;  // 脱敏展示：****xxxx
  modelName: string;
  completionsPath: string;
  isDefault: boolean;
  isEnabled: boolean;
}

export interface SaveModelConfigRequest {
  id?: number;
  configName: string;
  provider: string;
  baseUrl: string;
  apiKey: string;  // 明文，提交时加密传输（HTTPS）
  modelName: string;
  completionsPath?: string;
  isDefault: boolean;
}

export interface VerifyKeyRequest {
  baseUrl: string;
  apiKey: string;
}

export interface VerifyKeyResult {
  valid: boolean;
}
