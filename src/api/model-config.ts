import { API_CONFIG } from '@/config/api-config';
import { Response } from '@/types/api';
import type {
  ModelConfigItem,
  SaveModelConfigRequest,
  VerifyKeyRequest,
  VerifyKeyResult,
} from '@/types/model-config';

const BASE = API_CONFIG.BASE_URL;

async function handleResponse<T>(res: Response): Promise<Response<T>> {
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP ${res.status}: ${text}`);
  }
  const json = await res.json();
  if (json.code !== '0000') {
    throw new Error(json.info || 'API error');
  }
  return json;
}

export const modelConfigApi = {
  /** 获取用户所有模型配置 */
  list: async (): Promise<Response<ModelConfigItem[]>> => {
    const res = await fetch(`${BASE}/model-config/list`, { credentials: 'include' });
    return handleResponse<ModelConfigItem[]>(res);
  },

  /** 保存/更新配置 */
  save: async (data: SaveModelConfigRequest): Promise<Response<void>> => {
    const res = await fetch(`${BASE}/model-config/save`, {
      credentials: 'include',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse<void>(res);
  },

  /** 删除配置 */
  delete: async (id: number): Promise<Response<void>> => {
    const res = await fetch(`${BASE}/model-config/${id}`, {
      credentials: 'include',
      method: 'DELETE',
    });
    return handleResponse<void>(res);
  },

  /** 设为默认配置 */
  setDefault: async (id: number): Promise<Response<void>> => {
    const res = await fetch(`${BASE}/model-config/${id}/default`, {
      credentials: 'include',
      method: 'PUT',
    });
    return handleResponse<void>(res);
  },

  /** 验证 API Key 有效性 */
  verifyKey: async (data: VerifyKeyRequest): Promise<Response<VerifyKeyResult>> => {
    const res = await fetch(`${BASE}/model-config/verify`, {
      credentials: 'include',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse<VerifyKeyResult>(res);
  },
};
