
import React, { useState, useEffect, useMemo } from 'react';
import { Heart, Stars, Baby, Calendar, MessageCircle, ArrowRight, Share2, ShieldCheck, CheckCircle2, X, ExternalLink } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { SUBSCRIPTION_TIERS, INITIAL_MESSAGES } from './constants';
import { TierLevel, Message, SubscriptionTier } from './types';

// 設定預產期為 2026 年 7 月 15 日
const DUE_DATE = '2026-07-15';

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [newMessage, setNewMessage] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [babyDiary, setBabyDiary] = useState<string>('正在感受媽媽的心跳，我是滿寶，準備跟世界見面中...');
  const [isGenerating, setIsGenerating] = useState(false);

  // 自動計算目前孕期
  const pregnancyStatus = useMemo(() => {
    const due = new Date(DUE_DATE);
    const today = new Date();
    const totalPregnancyDays = 280; // 一般以 40 週 (280天) 為標準孕期
    
    // 計算距離預產期還有幾天
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    // 計算已經懷孕幾天
    const currentDays = totalPregnancyDays - diffDays;
    
    if (currentDays < 0) {
      return { weeks: 0, days: 0, started: false, label: "備孕與應援中" };
    }
    
    const weeks = Math.floor(currentDays / 7);
    const days = currentDays % 7;
    
    // 限制最高週數為 40
    if (weeks >= 40) {
      return { weeks: 40, days: 0, started: true, label: "準備出生囉！" };
    }
    
    return { 
      weeks, 
      days, 
      started: true, 
      label: `${weeks} 週 ${days} 天`
    };
  }, []);

  // 平滑捲動至指定區塊
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // PayPal 直接訂閱網址對應
  const getPaypalLink = (tierId: string) => {
    const baseUrl = "https://www.paypal.com/billing/plans/subscribe?plan_id=";
    switch (tierId) {
      case 'tier-1': return `${baseUrl}P-51M44352TK751472SNFPBFPY`; // 500 NTD
      case 'tier-2': return `${baseUrl}P-8VD31323VA233292BNFPBG6Q`; // 1500 NTD
      case 'tier-3': return `${baseUrl}P-3RC26760JT829260YNFPBIBI`; // 3000 NTD
      default: return "#";
    }
  };

  // AI 產生滿寶的動態獨白
  const generateBabyThoughts = async () => {
    // 確保只在有 API Key 的情況下執行，API Key 透過環境變數 process.env.API_KEY 取得
    if (!process.env.API_KEY) return;
    
    setIsGenerating(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const stageContext = pregnancyStatus.started 
        ? `目前我已經在媽媽肚子裡 ${pregnancyStatus.weeks} 週了。`
        : `我正在準備跟爸媽見面。`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `你是一個還在肚子裡的胎兒，小名叫「滿寶」。${stageContext} 請根據這個成長階段，用可愛、溫暖且充滿福氣的口吻寫一段話給未來的乾爹乾媽們，字數 80 字以內。一定要包含對乾爹乾媽支持的感謝，並提到「滿寶」這個名字。不要包含任何技術性的描述。`,
        config: {
          temperature: 0.85,
          topP: 0.95,
        }
      });
      setBabyDiary(response.text || '今天在裡面翻了一個筋斗，我是滿寶，大家都要想我喔！');
    } catch (error) {
      console.error("Failed to generate baby thoughts", error);
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    generateBabyThoughts();
  }, []);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !authorName.trim()) return;
    const msg: Message = {
      id: Date.now().toString(),
      author: authorName,
      content: newMessage,
      timestamp: new Date(),
    };
    setMessages([msg, ...messages]);
    setNewMessage('');
    setAuthorName('');
  };

  return (
    <div className="min-h-screen flex flex-col selection:bg-pink-100 selection:text-pink-600">
      {/* 導覽列 */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-pink-50 px-4 py-3">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>
            <div className="bg-gradient-to-br from-pink-400 to-pink-500 p-2 rounded-xl shadow-sm">
              <Baby className="text-white" size={22} />
            </div>
            <span className="text-xl font-bold tracking-tight text-gray-800">Man-Bao Project</span>
          </div>
          <div className="hidden md:flex gap-8 text-sm font-semibold text-gray-500">
            <button onClick={() => scrollToSection('about')} className="hover:text-pink-500 transition-colors">關於滿寶</button>
            <button onClick={() => scrollToSection('godparents')} className="hover:text-pink-500 transition-colors">應援計畫</button>
            <button onClick={() => scrollToSection('wall')} className="hover:text-pink-500 transition-colors">祝福留言</button>
          </div>
          <button 
            onClick={() => scrollToSection('godparents')}
            className="bg-gray-900 text-white px-6 py-2.5 rounded-full text-sm font-bold hover:bg-gray-800 transition-all active:scale-95 shadow-md shadow-gray-200"
          >
            立即訂閱贊助
          </button>
        </div>
      </nav>

      <main className="flex-grow">
        {/* Hero 區塊 */}
        <section id="about" className="relative pt-12 pb-24 px-4 bg-gradient-to-b from-white via-pink-50/20 to-white overflow-hidden">
          <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8 relative z-10">
              <div className="inline-flex items-center gap-2 bg-pink-100/80 border border-pink-200 text-pink-600 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">
                <Stars size={14} className="animate-pulse" />
                <span>預產期：2026 / 07 / 15</span>
              </div>
              <h1 className="text-6xl md:text-7xl font-black text-gray-900 leading-tight tracking-tighter">
                Hello! <br />
                我是 <span className="text-pink-500 inline-block hover:scale-105 transition-transform duration-300">滿寶</span>
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed max-w-lg font-medium">
                我正在努力長大，準備帶著滿滿的福氣來到這個世界。
                你想成為滿寶的第一批守護者「乾爹」或「乾媽」嗎？
                每一份支持都是滿寶未來最棒的見面禮！
              </p>
              <div className="flex flex-wrap gap-4 pt-4">
                <button 
                  onClick={() => scrollToSection('godparents')}
                  className="flex items-center gap-2 bg-pink-500 text-white px-8 py-4 rounded-2xl font-bold hover:bg-pink-600 transition-all shadow-xl shadow-pink-100 active:scale-95"
                >
                  成為守護者 <ArrowRight size={20} />
                </button>
                <button 
                  onClick={() => scrollToSection('wall')}
                  className="flex items-center gap-2 bg-white border border-gray-200 px-8 py-4 rounded-2xl font-bold hover:bg-gray-50 transition-all active:scale-95"
                >
                  留下一句祝福
                </button>
              </div>
            </div>

            <div className="relative">
              <div className="absolute -top-12 -right-12 w-64 h-64 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
              <div className="absolute -bottom-8 -left-8 w-64 h-64 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
              
              <div className="relative bg-white p-5 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-pink-50 transform lg:rotate-2 hover:rotate-0 transition-all duration-700">
                <img 
                  src="./product_1.jpg" 
                  alt="滿寶第一張超音波照片"
                  className="rounded-[1.5rem] w-full h-auto object-cover aspect-[4/3] shadow-inner grayscale contrast-125 hover:grayscale-0 transition-all duration-700"
                />
                <div className="mt-6 flex justify-between items-center px-2">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Growth Status</span>
                    <div className="flex items-center gap-2 text-gray-700">
                      <Calendar size={18} className="text-pink-400" />
                      <span className="text-sm font-bold italic underline decoration-pink-200 underline-offset-4">目前孕期：{pregnancyStatus.label}</span>
                    </div>
                  </div>
                  <div className="bg-pink-50 px-4 py-2 rounded-2xl flex items-center gap-2">
                    <Heart size={16} className="text-pink-500 animate-bounce" fill="currentColor" />
                    <span className="text-pink-600 font-black text-sm">Growing!</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 滿寶的心情獨白 */}
        <section className="py-20 px-4 bg-white">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white p-1 md:p-1.5 rounded-[3.5rem] shadow-2xl bg-gradient-to-br from-pink-200 via-white to-blue-200">
              <div className="bg-white p-8 md:p-16 rounded-[3rem] text-center relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                   <Baby size={120} />
                </div>
                <h2 className="text-sm font-black text-pink-500 uppercase tracking-widest mb-6">Man-Bao's Current Stage</h2>
                <div className="min-h-[140px] flex items-center justify-center">
                   <p className="text-2xl md:text-3xl font-bold text-gray-800 leading-relaxed italic">
                    「{babyDiary}」
                  </p>
                </div>
                <div className="mt-10">
                  <button 
                    onClick={generateBabyThoughts}
                    disabled={isGenerating}
                    className="group inline-flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-pink-500 transition-colors disabled:opacity-50"
                  >
                    <div className={`p-2 rounded-full border border-gray-100 group-hover:border-pink-200 group-hover:bg-pink-50 transition-all ${isGenerating ? 'animate-spin' : ''}`}>
                      <Stars size={16} />
                    </div>
                    {isGenerating ? '正在與滿寶連線中...' : '再點一次，聽聽滿寶的心底話'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 應援方案區 */}
        <section id="godparents" className="py-24 px-4 bg-gray-50/50 scroll-mt-20">
          <div className="max-w-6xl mx-auto text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-6">乾爹乾媽 應援方案</h2>
            <p className="text-gray-500 max-w-2xl mx-auto text-lg font-medium">
              您的每一份支持，都將專款專用於滿寶的成長與教育基金。<br className="hidden md:block" />
              點擊下方按鈕將前往 PayPal 安全訂閱頁面。
            </p>
          </div>

          <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-10">
            {SUBSCRIPTION_TIERS.map((tier) => (
              <div key={tier.id} className="group bg-white rounded-[2.5rem] p-10 shadow-xl border border-gray-100 flex flex-col hover:-translate-y-2 transition-all duration-500">
                <div className={`self-start px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest mb-6 ${tier.color}`}>
                  {tier.name}方案
                </div>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-5xl font-black text-gray-900">NT${tier.price}</span>
                  <span className="text-gray-400 font-bold">/月</span>
                </div>
                <p className="text-gray-600 font-bold mb-8">{tier.description}</p>
                
                <div className="space-y-5 mb-10 flex-grow pt-8 border-t border-gray-50">
                  {tier.perks.map((perk, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="mt-1 bg-green-50 p-0.5 rounded-full">
                        <CheckCircle2 className="text-green-500" size={16} />
                      </div>
                      <span className="text-sm text-gray-700 font-medium leading-tight">{perk}</span>
                    </div>
                  ))}
                </div>

                <a 
                  href={getPaypalLink(tier.id)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 flex items-center justify-center gap-3 active:scale-95"
                >
                  PayPal 安全訂閱 <ExternalLink size={18} />
                </a>
                <div className="flex items-center justify-center gap-1.5 mt-4 opacity-40">
                   <ShieldCheck size={14} />
                   <span className="text-[10px] font-bold uppercase tracking-widest">Secure Payment</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 祝福牆區 */}
        <section id="wall" className="py-24 px-4 bg-white scroll-mt-20">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col lg:flex-row gap-20">
              <div className="lg:w-1/3 space-y-8">
                <div>
                  <h2 className="text-4xl font-black text-gray-900 mb-4">祝福滿寶</h2>
                  <p className="text-gray-500 font-medium leading-relaxed">
                    留言將會儲存下來，等滿寶出生長大後，我們會親自讀給他聽喔！
                  </p>
                </div>

                <form onSubmit={handleSendMessage} className="bg-pink-50 p-8 rounded-[2.5rem] border border-pink-100 space-y-5 shadow-inner">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-pink-600 uppercase tracking-widest ml-1">暱稱 (乾爹/乾媽)</label>
                    <input 
                      type="text" 
                      value={authorName}
                      onChange={(e) => setAuthorName(e.target.value)}
                      placeholder="您的稱呼"
                      className="w-full px-5 py-4 bg-white rounded-2xl border-none shadow-sm focus:ring-2 focus:ring-pink-300 transition-all font-bold placeholder:text-gray-300"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-pink-600 uppercase tracking-widest ml-1">給滿寶的訊息</label>
                    <textarea 
                      rows={4}
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="寫下您的祝福..."
                      className="w-full px-5 py-4 bg-white rounded-2xl border-none shadow-sm focus:ring-2 focus:ring-pink-300 transition-all resize-none font-medium placeholder:text-gray-300"
                    ></textarea>
                  </div>
                  <button type="submit" className="w-full bg-pink-500 text-white py-4 rounded-2xl font-black hover:bg-pink-600 transition-all shadow-lg shadow-pink-100 active:scale-95">
                    送出祝福牆
                  </button>
                </form>
              </div>

              <div className="lg:w-2/3">
                <div className="grid sm:grid-cols-2 gap-6">
                  {messages.length > 0 ? messages.map((msg) => (
                    <div key={msg.id} className="group bg-white p-7 rounded-3xl shadow-md border border-gray-100 hover:border-pink-100 transition-all duration-300">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 bg-pink-100 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                          <MessageCircle size={22} className="text-pink-500" />
                        </div>
                        <div>
                          <div className="font-black text-gray-900">{msg.author}</div>
                          <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{msg.timestamp.toLocaleDateString()}</div>
                        </div>
                      </div>
                      <p className="text-gray-600 leading-relaxed font-medium">
                        {msg.content}
                      </p>
                    </div>
                  )) : (
                    <div className="col-span-2 text-center py-20 bg-gray-50 rounded-[2rem] border-2 border-dashed border-gray-200">
                       <p className="text-gray-400 font-bold">還沒有人留言，來當滿寶的第一個乾爹乾媽吧！</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-gray-900 text-white pt-20 pb-10 px-4 mt-20">
        <div className="max-w-6xl mx-auto flex flex-col items-center">
          <div className="flex items-center gap-3 mb-8">
            <div className="bg-white/10 p-3 rounded-2xl">
              <Baby size={30} className="text-pink-400" />
            </div>
            <span className="text-3xl font-black tracking-tighter">Man-Bao Project</span>
          </div>
          
          <div className="flex gap-10 text-sm font-bold text-gray-400 mb-12">
            <button onClick={() => scrollToSection('about')} className="hover:text-white transition-colors">關於</button>
            <button onClick={() => scrollToSection('godparents')} className="hover:text-white transition-colors">應援</button>
            <button onClick={() => scrollToSection('wall')} className="hover:text-white transition-colors">留言牆</button>
          </div>

          <div className="text-center space-y-4">
            <p className="text-gray-500 text-sm font-medium max-w-md mx-auto leading-relaxed">
              本網站所有贊助款項將 100% 用於滿寶的教育與成長所需。
              感謝每一位願意陪伴他長大的守護者。
            </p>
            <div className="pt-10 border-t border-white/5 w-full">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-600 text-center">
                © {new Date().getFullYear()} Man-Bao Blessing Project. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
