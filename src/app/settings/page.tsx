"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getUserInfo, clearUserInfo } from "@/utils/cookie";
import { modelConfigApi } from "@/api/model-config";
import WorkspaceHeader from "@/components/WorkspaceHeader";
import type { ModelConfigItem } from "@/types/model-config";

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState("");
  const [configs, setConfigs] = useState<ModelConfigItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [verifyResult, setVerifyResult] = useState<string | null>(null);

  // 表单字段
  const [form, setForm] = useState({
    configName: "",
    provider: "openai",
    baseUrl: "https://api.openai.com",
    apiKey: "",
    modelName: "gpt-4o",
    completionsPath: "/v1/chat/completions",
    isDefault: false,
  });

  useEffect(() => {
    const info = getUserInfo();
    if (info) setUser(info.user);
    else { router.push("/login"); return; }
    loadConfigs();
  }, []);

  const loadConfigs = async () => {
    setLoading(true);
    try {
      const resp = await modelConfigApi.list();
      setConfigs(resp.data || []);
    } catch { /* ignore */ }
    setLoading(false);
  };

  const resetForm = () => {
    setForm({ configName: "", provider: "openai", baseUrl: "https://api.openai.com", apiKey: "", modelName: "gpt-4o", completionsPath: "/v1/chat/completions", isDefault: false });
    setEditingId(null);
    setShowForm(false);
    setVerifyResult(null);
  };

  const handleSave = async () => {
    if (!form.configName.trim() || !form.baseUrl.trim() || !form.apiKey.trim() || !form.modelName.trim()) return;
    try {
      await modelConfigApi.save({ id: editingId ?? undefined, ...form });
      resetForm();
      loadConfigs();
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "保存失败");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("确认删除？")) return;
    try {
      await modelConfigApi.delete(id);
      loadConfigs();
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "删除失败");
    }
  };

  const handleSetDefault = async (id: number) => {
    try {
      await modelConfigApi.setDefault(id);
      loadConfigs();
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "设置失败");
    }
  };

  const handleEdit = (cfg: ModelConfigItem) => {
    setEditingId(cfg.id);
    setForm({
      configName: cfg.configName,
      provider: cfg.provider,
      baseUrl: cfg.baseUrl,
      apiKey: "",  // 编辑时不回填 Key
      modelName: cfg.modelName,
      completionsPath: cfg.completionsPath,
      isDefault: cfg.isDefault,
    });
    setShowForm(true);
  };

  const handleVerify = async () => {
    if (!form.baseUrl.trim() || !form.apiKey.trim()) return;
    setVerifying(true);
    setVerifyResult(null);
    try {
      const resp = await modelConfigApi.verifyKey({ baseUrl: form.baseUrl, apiKey: form.apiKey });
      setVerifyResult(resp.data?.valid ? "Key 有效 ✓" : "Key 无效");
    } catch (e: unknown) {
      setVerifyResult(e instanceof Error ? e.message : "验证失败");
    }
    setVerifying(false);
  };

  const handleLogout = () => {
    clearUserInfo();
    router.push("/login");
  };

  return (
    <div className="min-h-screen theme-bg-gradient p-5">
      <div className="workspace-shell mx-auto flex min-h-[calc(100vh-40px)] max-w-[1280px] flex-col overflow-hidden">
        <WorkspaceHeader activePath="/me" userName={user} onLogout={handleLogout} />
        <header className="flex items-center justify-between border-b border-[#e6e2db] px-5 py-4 md:px-7">
          <div>
            <p className="workspace-mono text-[11px] tracking-[0.14em] text-[#858c96]">设置 / 模型配置</p>
            <h1 className="mt-1 text-[34px] font-semibold tracking-tight text-[#22252a]">模型配置</h1>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => router.push("/")} className="workspace-secondary-btn px-3 py-2 text-sm font-medium">返回首页</button>
            <button onClick={() => router.push("/me")} className="workspace-secondary-btn px-3 py-2 text-sm font-medium">个人中心</button>
          </div>
        </header>

        <main className="px-5 py-8 md:px-7">
          <div className="mb-6 flex items-center justify-between">
            <p className="text-sm text-[#858c96]">配置你自己的 AI 模型 API Key 和 URL，不同任务可选择不同配置。未配置时使用系统默认模型。</p>
            <button onClick={() => { resetForm(); setShowForm(true); }}
              className="rounded-[10px] bg-[#22252a] px-4 py-2 text-sm font-medium text-white hover:bg-[#3a3f47] transition shrink-0 ml-4">
              添加配置
            </button>
          </div>

          {/* 新增/编辑表单 */}
          {showForm && (
            <div className="workspace-panel rounded-[16px] p-6 mb-6">
              <h3 className="text-lg font-semibold text-[#22252a] mb-4">{editingId ? "编辑配置" : "新增配置"}</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-[#858c96]">配置名称 *</label>
                  <input type="text" value={form.configName} onChange={(e) => setForm({ ...form, configName: e.target.value })}
                    placeholder="如：我的 DeepSeek" className="mt-1 w-full rounded-[8px] border border-[#e6e2db] px-3 py-2 text-sm outline-none" />
                </div>
                <div>
                  <label className="text-xs text-[#858c96]">提供商</label>
                  <select value={form.provider} onChange={(e) => setForm({ ...form, provider: e.target.value })}
                    className="mt-1 w-full rounded-[8px] border border-[#e6e2db] px-3 py-2 text-sm outline-none bg-white">
                    <option value="openai">OpenAI</option>
                    <option value="deepseek">DeepSeek</option>
                    <option value="custom">自定义</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="text-xs text-[#858c96]">Base URL *</label>
                  <input type="text" value={form.baseUrl} onChange={(e) => setForm({ ...form, baseUrl: e.target.value })}
                    placeholder="https://api.deepseek.com" className="mt-1 w-full rounded-[8px] border border-[#e6e2db] px-3 py-2 text-sm outline-none" />
                </div>
                <div>
                  <label className="text-xs text-[#858c96]">模型名称 *</label>
                  <input type="text" value={form.modelName} onChange={(e) => setForm({ ...form, modelName: e.target.value })}
                    placeholder="deepseek-chat" className="mt-1 w-full rounded-[8px] border border-[#e6e2db] px-3 py-2 text-sm outline-none" />
                </div>
                <div>
                  <label className="text-xs text-[#858c96]">Completions Path</label>
                  <input type="text" value={form.completionsPath} onChange={(e) => setForm({ ...form, completionsPath: e.target.value })}
                    className="mt-1 w-full rounded-[8px] border border-[#e6e2db] px-3 py-2 text-sm outline-none" />
                </div>
                <div className="col-span-2">
                  <label className="text-xs text-[#858c96]">API Key *（加密传输，仅保存密文）</label>
                  <div className="flex gap-2 mt-1">
                    <input type="password" value={form.apiKey} onChange={(e) => setForm({ ...form, apiKey: e.target.value })}
                      placeholder={editingId ? "留空则不修改" : "sk-..."}
                      className="flex-1 rounded-[8px] border border-[#e6e2db] px-3 py-2 text-sm outline-none" />
                    <button onClick={handleVerify} disabled={verifying}
                      className="rounded-[8px] border border-[#e6e2db] px-3 py-2 text-xs text-[#858c96] hover:bg-[#f7f5f2] disabled:opacity-50">
                      {verifying ? "验证中..." : "验证连接"}
                    </button>
                  </div>
                  {verifyResult && (
                    <p className={`mt-1 text-xs ${verifyResult.includes("有效") ? "text-[#567260]" : "text-red-500"}`}>{verifyResult}</p>
                  )}
                </div>
                <div>
                  <label className="flex items-center gap-2 text-xs text-[#858c96] cursor-pointer">
                    <input type="checkbox" checked={form.isDefault} onChange={(e) => setForm({ ...form, isDefault: e.target.checked })}
                      className="h-3.5 w-3.5 rounded border-[#d1cec6] accent-[#567260]" />
                    设为默认配置
                  </label>
                </div>
              </div>
              <div className="mt-4 flex gap-3">
                <button onClick={handleSave} className="rounded-[10px] bg-[#567260] px-4 py-2 text-sm text-white hover:bg-[#4a6354] transition">保存</button>
                <button onClick={resetForm} className="rounded-[10px] border border-[#e6e2db] px-4 py-2 text-sm text-[#858c96] hover:bg-[#f7f5f2] transition">取消</button>
              </div>
            </div>
          )}

          {/* 配置列表 */}
          {loading ? (
            <p className="text-sm text-[#858c96]">加载中...</p>
          ) : configs.length === 0 ? (
            <div className="workspace-panel rounded-[16px] p-12 text-center">
              <p className="text-sm text-[#858c96]">还没有配置任何模型</p>
              <p className="mt-1 text-xs text-[#b9b2a8]">点击"添加配置"开始，可使用自有 API Key 调用 AI 模型</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {configs.map((cfg) => (
                <div key={cfg.id} className={`workspace-panel rounded-[14px] p-5 ${cfg.isDefault ? "ring-2 ring-[#567260]" : ""}`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-semibold text-[#22252a]">{cfg.configName}</h3>
                        {cfg.isDefault && <span className="rounded-full bg-[#eef5f0] px-2 py-0.5 text-[10px] text-[#567260]">默认</span>}
                      </div>
                      <p className="mt-1 text-xs text-[#858c96]">{cfg.provider} · {cfg.modelName}</p>
                      <p className="text-xs text-[#b9b2a8] mt-0.5">{cfg.baseUrl}</p>
                      <p className="text-xs text-[#b9b2a8]">API Key: {cfg.apiKeyMasked}</p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      {!cfg.isDefault && (
                        <button onClick={() => handleSetDefault(cfg.id)}
                          className="rounded-[8px] border border-[#e6e2db] px-2 py-1 text-[10px] text-[#858c96] hover:bg-[#f7f5f2]">设为默认</button>
                      )}
                      <button onClick={() => handleEdit(cfg)}
                        className="rounded-[8px] border border-[#e6e2db] px-2 py-1 text-[10px] text-[#858c96] hover:bg-[#f7f5f2]">编辑</button>
                      <button onClick={() => handleDelete(cfg.id)}
                        className="rounded-[8px] border border-red-100 px-2 py-1 text-[10px] text-red-400 hover:bg-red-50">删除</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
