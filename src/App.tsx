/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronRight, 
  User, 
  Activity, 
  ArrowLeft, 
  Sparkles, 
  Coffee, 
  Moon, 
  Info,
  CheckCircle2,
  Settings,
  X
} from 'lucide-react';
import { AppStep, UserHealthData, AIReport, OneApiConfig } from './types';

// API Call Logic (Supports both Mock and Real One-API)
const generateAIReport = async (data: UserHealthData, config: OneApiConfig): Promise<AIReport> => {
  // If One-API is not configured, use mock data
  if (!config.apiKey || !config.baseUrl) {
    console.log("未配置 One-API，使用本地模拟数据");
    await new Promise(resolve => setTimeout(resolve, 2000));
    return {
      summary: `根据您的年龄(${data.age}岁)及体重(${data.weight}kg)数据，草莓果维小方富含维生素C及天然抗氧化物。`,
      benefits: [
        "辅助缓解氧化应激",
        "改善睡眠质量",
        "补充每日所需维生素C"
      ],
      suggestion: "建议睡前1小时食用1～2块，有助于身体进入放松状态。",
      pairing: {
        name: "椰子水冰杯",
        reason: "搭配椰子水冰杯饮用，兼顾营养吸收与清爽口感体验，椰子水中的电解质能进一步辅助身体代谢。"
      }
    };
  }

  // Real One-API Call
  console.log("正在调用 One-API 接口...");
  const prompt = `
你是一个专业的AI健康顾问。
用户信息：年龄${data.age}岁，性别${data.gender === 'male' ? '男' : '女'}，身高${data.height}cm，体重${data.weight}kg。
产品背景：草莓果维小方（富含维生素C及天然抗氧化物），椰子水冰杯。
参考资料：《2025中国睡眠健康白皮书》。

请根据以上信息，生成一份个性化健康报告。
必须严格按照以下JSON格式返回（不要包含任何Markdown标记、代码块或其他文字）：
{
  "summary": "核心解读（50字左右）",
  "benefits": ["功效1", "功效2", "功效3"],
  "suggestion": "食用建议（50字左右）",
  "pairing": {
    "name": "推荐搭配的产品名称（如：椰子水冰杯）",
    "reason": "搭配理由（50字左右）"
  }
}
`;

  const response = await fetch(`${config.baseUrl.replace(/\/$/, '')}/v1/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.apiKey}`
    },
    body: JSON.stringify({
      model: config.model || 'qwen-turbo',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7
    })
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`API 请求失败: ${response.status} ${errText}`);
  }

  const result = await response.json();
  let content = result.choices[0].message.content.trim();
  
  // Clean up potential markdown code blocks from LLM response
  if (content.startsWith('```json')) {
    content = content.replace(/^```json\n/, '').replace(/\n```$/, '');
  } else if (content.startsWith('```')) {
    content = content.replace(/^```\n/, '').replace(/\n```$/, '');
  }

  return JSON.parse(content) as AIReport;
};

export default function App() {
  const [step, setStep] = useState<AppStep>('welcome');
  const [formData, setFormData] = useState<UserHealthData>({
    age: '',
    gender: '',
    height: '',
    weight: ''
  });
  const [report, setReport] = useState<AIReport | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>('');

  // Settings State
  const [showSettings, setShowSettings] = useState(false);
  const [apiConfig, setApiConfig] = useState<OneApiConfig>({
    baseUrl: '',
    apiKey: '',
    model: 'qwen-turbo'
  });

  // Load config from localStorage on mount
  useEffect(() => {
    const savedConfig = localStorage.getItem('oneApiConfig');
    if (savedConfig) {
      try {
        setApiConfig(JSON.parse(savedConfig));
      } catch (e) {
        console.error("Failed to parse saved config");
      }
    }
  }, []);

  const saveConfig = (config: OneApiConfig) => {
    setApiConfig(config);
    localStorage.setItem('oneApiConfig', JSON.stringify(config));
    setShowSettings(false);
  };

  const handleStart = () => setStep('form');
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.gender) {
      setErrorMsg('请选择性别');
      return;
    }
    setStep('loading');
    setErrorMsg('');
    try {
      const result = await generateAIReport(formData, apiConfig);
      setReport(result);
      setStep('report');
    } catch (error: unknown) {
      console.error("Failed to generate report", error);
      const message = error instanceof Error ? error.message : "生成报告失败，请检查 API 配置或网络连接";
      setErrorMsg(message);
      setStep('form');
    }
  };

  const reset = () => {
    setStep('welcome');
    setFormData({ age: '', gender: '', height: '', weight: '' });
    setReport(null);
    setErrorMsg('');
  };

  return (
    <div className="min-h-screen max-w-md mx-auto bg-[#F7F7F7] relative overflow-hidden flex flex-col">
      {/* Background Decoration */}
      <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-5%] left-[-5%] w-48 h-48 bg-primary/10 rounded-full blur-2xl pointer-events-none" />

      <AnimatePresence mode="wait">
        {step === 'welcome' && (
          <motion.div 
            key="welcome"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex-1 flex flex-col items-center justify-center p-8 text-center relative"
          >
            <button 
              onClick={() => setShowSettings(true)}
              className="absolute top-6 right-6 p-2 text-gray-400 hover:text-gray-600 bg-white rounded-full shadow-sm transition-colors"
            >
              <Settings className="w-5 h-5" />
            </button>

            <div className="w-24 h-24 bg-white rounded-3xl shadow-xl flex items-center justify-center mb-8 rotate-3">
              <Sparkles className="w-12 h-12 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4 tracking-tight">
              AI 智能健康顾问
            </h1>
            <p className="text-gray-500 mb-12 leading-relaxed">
              扫描包装开启个性化健康之旅<br/>
              基于《2025中国睡眠健康白皮书》数据
            </p>
            
            <button 
              onClick={handleStart}
              className="w-full py-4 bg-primary text-white rounded-2xl font-semibold shadow-lg shadow-primary/20 flex items-center justify-center gap-2 active:scale-95 transition-transform"
            >
              开始咨询 <ChevronRight className="w-5 h-5" />
            </button>
          </motion.div>
        )}

        {step === 'form' && (
          <motion.div 
            key="form"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="flex-1 flex flex-col p-6"
          >
            <div className="flex items-center gap-4 mb-8">
              <button onClick={() => setStep('welcome')} className="p-2 hover:bg-white rounded-full transition-colors">
                <ArrowLeft className="w-6 h-6 text-gray-600" />
              </button>
              <h2 className="text-xl font-bold text-gray-900">填写健康信息</h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 flex-1 flex flex-col">
              <div className="bg-white rounded-2xl p-6 shadow-sm space-y-5">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-500 flex items-center gap-2">
                    <User className="w-4 h-4" /> 性别
                  </label>
                  <div className="flex gap-3">
                    {(['male', 'female'] as const).map((g) => (
                      <button
                        key={g}
                        type="button"
                        onClick={() => setFormData({...formData, gender: g})}
                        className={`flex-1 py-3 rounded-xl border-2 transition-all ${
                          formData.gender === g 
                            ? 'border-primary bg-primary-light text-primary font-semibold' 
                            : 'border-gray-100 bg-gray-50 text-gray-400'
                        }`}
                      >
                        {g === 'male' ? '男' : '女'}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-500">年龄</label>
                    <input 
                      required
                      type="number"
                      placeholder="岁"
                      value={formData.age}
                      onChange={e => setFormData({...formData, age: e.target.value})}
                      className="w-full p-4 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-500">体重 (kg)</label>
                    <input 
                      required
                      type="number"
                      placeholder="kg"
                      value={formData.weight}
                      onChange={e => setFormData({...formData, weight: e.target.value})}
                      className="w-full p-4 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-500">身高 (cm)</label>
                  <input 
                    required
                    type="number"
                    placeholder="cm"
                    value={formData.height}
                    onChange={e => setFormData({...formData, height: e.target.value})}
                    className="w-full p-4 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                  />
                </div>
              </div>

              {errorMsg && (
                <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100">
                  {errorMsg}
                </div>
              )}

              <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-xl text-blue-600 text-xs leading-relaxed mt-auto mb-6">
                <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <p>
                  {apiConfig.apiKey 
                    ? "已连接 One-API，将使用大模型实时生成个性化报告。" 
                    : "当前未配置 API Key，将使用本地模拟数据演示。点击首页右上角设置可接入真实 AI。"}
                </p>
              </div>

              <button 
                type="submit"
                className="w-full py-4 bg-primary text-white rounded-2xl font-semibold shadow-lg shadow-primary/20 active:scale-95 transition-transform"
              >
                生成健康报告
              </button>
            </form>
          </motion.div>
        )}

        {step === 'loading' && (
          <motion.div 
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center p-8 text-center"
          >
            <div className="relative mb-8">
              <div className="w-20 h-20 border-4 border-primary/10 border-t-primary rounded-full animate-spin" />
              <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-primary animate-pulse" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">AI 正在分析中...</h3>
            <p className="text-gray-400 text-sm">正在结合《2025中国睡眠健康白皮书》为您定制方案</p>
          </motion.div>
        )}

        {step === 'report' && report && (
          <motion.div 
            key="report"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex-1 flex flex-col p-6 overflow-y-auto pb-24"
          >
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-gray-900">健康功效报告</h2>
              <CheckCircle2 className="w-8 h-8 text-primary" />
            </div>

            <div className="space-y-6">
              {/* Summary Card */}
              <section className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center gap-2 text-primary mb-3">
                  <Activity className="w-5 h-5" />
                  <span className="font-bold">核心解读</span>
                </div>
                <p className="text-gray-700 leading-relaxed">
                  {report.summary}
                </p>
              </section>

              {/* Benefits List */}
              <section className="space-y-3">
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider px-2">主要功效</h3>
                <div className="grid grid-cols-1 gap-3">
                  {report.benefits.map((benefit, idx) => (
                    <div key={idx} className="bg-white/60 backdrop-blur-sm p-4 rounded-2xl flex items-center gap-3 border border-white">
                      <div className="w-2 h-2 bg-primary rounded-full" />
                      <span className="text-gray-700 font-medium">{benefit}</span>
                    </div>
                  ))}
                </div>
              </section>

              {/* Suggestion Card */}
              <section className="bg-primary/5 rounded-3xl p-6 border border-primary/10">
                <div className="flex items-center gap-2 text-primary mb-3">
                  <Moon className="w-5 h-5" />
                  <span className="font-bold">食用建议</span>
                </div>
                <p className="text-gray-800 leading-relaxed italic">
                  "{report.suggestion}"
                </p>
              </section>

              {/* Pairing Recommendation */}
              <section className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 overflow-hidden relative">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <Coffee className="w-16 h-16" />
                </div>
                <div className="flex items-center gap-2 text-orange-500 mb-3">
                  <Coffee className="w-5 h-5" />
                  <span className="font-bold">黄金搭档推荐</span>
                </div>
                <h4 className="text-lg font-bold text-gray-900 mb-2">{report.pairing.name}</h4>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {report.pairing.reason}
                </p>
              </section>
            </div>

            {/* Bottom Action */}
            <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[#F7F7F7] via-[#F7F7F7] to-transparent safe-area-bottom">
              <button 
                onClick={reset}
                className="w-full py-4 bg-white text-gray-900 border border-gray-200 rounded-2xl font-semibold shadow-sm active:scale-95 transition-transform"
              >
                返回首页
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Settings Modal */}
      <AnimatePresence>
        {showSettings && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl"
            >
              <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900">AI 接口配置 (One-API)</h3>
                <button onClick={() => setShowSettings(false)} className="p-2 text-gray-400 hover:bg-gray-50 rounded-full">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Base URL</label>
                  <input 
                    type="text"
                    placeholder="https://your-one-api-domain.com"
                    value={apiConfig.baseUrl}
                    onChange={e => setApiConfig({...apiConfig, baseUrl: e.target.value})}
                    className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">API Key</label>
                  <input 
                    type="password"
                    placeholder="sk-..."
                    value={apiConfig.apiKey}
                    onChange={e => setApiConfig({...apiConfig, apiKey: e.target.value})}
                    className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">模型名称 (Model)</label>
                  <input 
                    type="text"
                    placeholder="例如: qwen-turbo, gpt-3.5-turbo"
                    value={apiConfig.model}
                    onChange={e => setApiConfig({...apiConfig, model: e.target.value})}
                    className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none text-sm"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  配置保存在本地浏览器中。留空则使用内置的模拟数据进行演示。
                </p>
                <button 
                  onClick={() => saveConfig(apiConfig)}
                  className="w-full py-3 mt-4 bg-gray-900 text-white rounded-xl font-medium active:scale-95 transition-transform"
                >
                  保存配置
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
