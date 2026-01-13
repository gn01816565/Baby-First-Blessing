
import React, { useState, useEffect } from 'react';
import { Heart, Stars, Baby, Calendar, MessageCircle, ArrowRight, Share2, ShieldCheck, CheckCircle2, X, ExternalLink } from 'lucide-react';
import { GoogleGenerativeAI } from "@google/genai";
import { SUBSCRIPTION_TIERS, INITIAL_MESSAGES } from './constants';
import { TierLevel, Message, SubscriptionTier } from './types';

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [newMessage, setNewMessage] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [babyDiary, setBabyDiary] = useState<string>('嗨～我是滿寶！正在感受媽媽的心跳，準備跟世界見面中...');
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedTier, setSelectedTier] = useState<SubscriptionTier | null>(null);

  // 平滑捲動
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

  // 產生寶貝獨白 (使用 Gemini AI)
  const generateBabyThoughts = async () => {
    setIsGenerating(true);
    try {
      // 使用 Vite 標準環境變數 VITE_GEMINI_API_KEY
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      
      if (!apiKey || apiKey === 'PLACEHOLDER_API_KEY') {
        throw new Error('API Key is missing or invalid');
      }

      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

      const prompt = "你是一個還在肚子裡的胎兒，小名叫做「滿寶」，大約12週大。請用可愛、溫暖且幽默的口吻寫一段話給未來的乾爹乾媽們，字數約100字以內。一定要包含對乾爹乾媽的感謝，並提到預產期是 2026/07/15。";

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      setBabyDiary(text);
    } catch (error) {
      console.error("Failed to generate baby thoughts", error);
      // Fallback 靜態文字
      const fallbacks = [
        "嗨～我是滿寶！還在媽咪肚子裡努力長大哦！謝謝未來的乾爹乾媽們，2026/07/15 我們不見不散！💕",
        "Hi！我是滿寶～現在每天最愛聽媽咪的心跳聲！好期待見到乾爹乾媽們，謝謝你們的支持！👶✨"
      ];
      setBabyDiary(fallbacks[Math.floor(Math.random() * fallbacks.length)]);
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
    <div className="min-h-screen flex flex-col">
      {/* 訂閱確認彈窗 */}
      {selectedTier && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setSelectedTier(null)}></div>
          <div className="relative bg-white w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in duration-300">
            <button 
              onClick={() => setSelectedTier(null)}
              className="absolute top-6 right-6 p-2 hover:bg-gray-100 rounded-full transition z-10"
            >
              <X size={20} />
            </button>
            
            <div className="text-center space-y-6">
              <div className="bg-pink-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                <Heart className="text-pink-500" fill="currentColor" size={32} />
              </div>
              
              <div>
                <h3 className="text-2xl font-bold text-gray-900">成為寶貝的{selectedTier.name}</h3>
                <p className="text-gray-500 text-sm mt-2 px-4">
                  您即將每月贊助 <span className="font-bold text-gray-900">NT${selectedTier.price}</span>，
                  這筆資金將全數投入寶貝的成長基金。
                </p>
              </div>

              <div className="bg-gray-50 p-6 rounded-2xl text-left space-y-3 border border-gray-100">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">您的專屬權益</p>
                {selectedTier.perks.map((perk, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm text-gray-700 leading-tight">
                    <CheckCircle2 size={16} className="text-green-500 mt-0.5 flex-shrink-0" />
                    {perk}
                  </div>
                ))}
              </div>

              <div className="pt-4 space-y-4">
                <a 
                  href={getPaypalLink(selectedTier.id)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-100 flex items-center justify-center gap-2"
                >
                  前往 PayPal 安全訂閱 <ExternalLink size={18} />
                </a>
                <p className="text-[10px] text-gray-400">
                  * 點擊後將開啟 PayPal 官方頁面完成訂閱作業
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 導覽列 */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-pink-100 px-4 py-3">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="bg-pink-100 p-2 rounded-full">
              <Baby className="text-pink-500" size={24} />
            </div>
            <span className="text-xl font-bold gradient-text">Little Blessing</span>
          </div>
          <div className="hidden md:flex gap-6 text-sm font-medium text-gray-600">
            <button onClick={() => scrollToSection('about')} className="hover:text-pink-500 transition">關於我</button>
            <button onClick={() => scrollToSection('godparents')} className="hover:text-pink-500 transition">乾爹乾媽計畫</button>
            <button onClick={() => scrollToSection('gallery')} className="hover:text-pink-500 transition">影像記錄</button>
            <button onClick={() => scrollToSection('wall')} className="hover:text-pink-500 transition">祝福牆</button>
          </div>
          <button 
            onClick={() => scrollToSection('godparents')}
            className="bg-pink-500 text-white px-5 py-2.5 rounded-full text-sm font-bold hover:bg-pink-600 transition shadow-lg shadow-pink-200"
          >
            立即訂閱祝福
          </button>
        </div>
      </nav>

      <main className="flex-grow">
        {/* Hero 區塊 */}
        <section id="about" className="relative py-20 px-4 bg-gradient-to-b from-white to-pink-50 overflow-hidden">
          <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 bg-pink-100 text-pink-600 px-3 py-1 rounded-full text-sm font-medium">
                <Stars size={16} />
                <span>招募專屬守護者中</span>
              </div>
              <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 leading-tight">
                Hello World! <br />
                我是還在探險的 <span className="text-pink-500">滿寶</span>
              </h1>
              <p className="text-lg text-gray-600 leading-relaxed">
                我還在媽媽肚子裡努力成長，預計 2026/07/15 跟大家見面！
                我已經等不及想要見到各位乾爹乾媽了！邀請你成為我人生旅途的第一批守護者。
              </p>
              <div className="flex gap-4">
                <button 
                  onClick={() => scrollToSection('godparents')}
                  className="flex items-center gap-2 bg-gray-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-gray-800 transition"
                >
                  看看乾爹權益 <ArrowRight size={20} />
                </button>
                <button 
                  onClick={() => scrollToSection('wall')}
                  className="flex items-center gap-2 border border-gray-200 px-6 py-3 rounded-xl font-bold hover:bg-white transition"
                >
                  留下一句祝福
                </button>
              </div>
            </div>

            <div className="relative group">
              <div className="absolute -inset-4 bg-gradient-to-r from-pink-200 to-purple-200 rounded-[2rem] blur-2xl opacity-50 group-hover:opacity-70 transition duration-1000"></div>
              <div className="relative bg-white p-4 rounded-[2rem] shadow-2xl border border-pink-50 transform rotate-1 group-hover:rotate-0 transition duration-500">
                <img 
                  src="./product_1.jpg" 
                  alt="Ultrasound"
                  className="rounded-xl w-full h-auto object-cover aspect-[4/3] grayscale contrast-125"
                />
                <div className="mt-4 flex justify-between items-center px-2">
                  <div className="flex items-center gap-2 text-gray-500">
                    <Calendar size={18} />
                    <span className="text-sm font-medium">目前孕期：12 週 2 天</span>
                  </div>
                  <div className="flex items-center gap-1 text-pink-500 font-bold">
                    <Heart size={18} fill="currentColor" />
                    <span>0.5cm</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 寶貝的心情獨白 */}
        <section className="py-16 px-4 bg-white">
          <div className="max-w-4xl mx-auto">
            <div className="bg-gradient-to-br from-pink-50 to-blue-50 p-8 md:p-12 rounded-[3rem] border border-white shadow-inner relative">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-4 rounded-full shadow-lg">
                <Baby className="text-pink-400" size={40} />
              </div>
              <h2 className="text-2xl font-bold text-center mb-8 text-gray-800">滿寶今日的心情獨白</h2>
              <div className="relative">
                <blockquote className="text-xl md:text-2xl text-center text-gray-700 italic font-medium leading-relaxed">
                  “{babyDiary}”
                </blockquote>
              </div>
              <div className="mt-8 flex justify-center">
                <button 
                  onClick={generateBabyThoughts}
                  disabled={isGenerating}
                  className="text-sm font-bold text-pink-500 hover:text-pink-600 transition flex items-center gap-2 disabled:opacity-50"
                >
                  {isGenerating ? '正在感應滿寶中...' : '再聽聽滿寶說什麼？'}
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* 應援方案區 */}
        <section id="godparents" className="py-24 px-4 bg-gray-50 scroll-mt-20">
          <div className="max-w-6xl mx-auto text-center mb-16">
            <h2 className="text-4xl font-extrabold text-gray-900 mb-4">乾爹乾媽 應援方案</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              你的每一份支持都會存入寶貝的成長專屬基金，讓我們一起見證生命奇蹟。
            </p>
          </div>

          <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8">
            {SUBSCRIPTION_TIERS.map((tier) => (
              <div key={tier.id} className="bg-white rounded-[2rem] p-8 shadow-xl border border-gray-100 flex flex-col hover:scale-105 transition duration-300">
                <div className={`self-start px-4 py-1 rounded-full text-xs font-bold mb-4 ${tier.color}`}>
                  {tier.name}
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{tier.name}方案</h3>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-4xl font-extrabold text-gray-900">NT${tier.price}</span>
                  <span className="text-gray-500 font-medium">/月</span>
                </div>
                <p className="text-sm text-gray-600 mb-8">{tier.description}</p>
                
                <ul className="space-y-4 mb-8 flex-grow">
                  {tier.perks.map((perk, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-gray-700">
                      <ShieldCheck className="text-green-500 mt-0.5 flex-shrink-0" size={18} />
                      {perk}
                    </li>
                  ))}
                </ul>

                <button 
                  onClick={() => setSelectedTier(tier)}
                  className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold hover:bg-gray-800 transition shadow-lg"
                >
                  立即預約訂閱
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* 祝福牆區 */}
        <section id="wall" className="py-24 px-4 bg-pink-50 scroll-mt-20">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-3 gap-12">
              <div className="md:col-span-1 space-y-8">
                <div>
                  <h2 className="text-4xl font-extrabold text-gray-900 mb-4">祝福留言牆</h2>
                  <p className="text-gray-600 text-sm">
                    寶貝在肚子裡也能聽見大家溫暖的聲音喔！快來留下一句你想對寶貝說的話。
                  </p>
                </div>

                <form onSubmit={handleSendMessage} className="bg-white p-6 rounded-3xl shadow-lg border border-pink-100 space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">你的暱稱</label>
                    <input 
                      type="text" 
                      value={authorName}
                      onChange={(e) => setAuthorName(e.target.value)}
                      placeholder="例如：漂亮的隔壁阿姨"
                      className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-100 focus:outline-none focus:ring-2 focus:ring-pink-400"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">留言內容</label>
                    <textarea 
                      rows={4}
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="寫下給滿寶的祝福..."
                      className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-100 focus:outline-none focus:ring-2 focus:ring-pink-400 resize-none"
                    ></textarea>
                  </div>
                  <button type="submit" className="w-full bg-pink-500 text-white py-3 rounded-xl font-bold hover:bg-pink-600 transition shadow-lg shadow-pink-200">
                    送出祝福
                  </button>
                </form>
              </div>

              <div className="md:col-span-2">
                <div className="grid sm:grid-cols-2 gap-4">
                  {messages.map((msg) => (
                    <div key={msg.id} className="bg-white p-6 rounded-2xl shadow-sm border border-pink-50 flex flex-col gap-3 relative">
                      <div className="flex items-center gap-3">
                        <div className="bg-pink-100 p-2 rounded-full">
                          <MessageCircle size={16} className="text-pink-500" />
                        </div>
                        <div>
                          <div className="font-bold text-gray-900">{msg.author}</div>
                          <div className="text-[10px] text-gray-400">{msg.timestamp.toLocaleDateString()}</div>
                        </div>
                      </div>
                      <p className="text-gray-600 text-sm leading-relaxed">
                        {msg.content}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8 text-center md:text-left">
          <div>
            <div className="text-2xl font-extrabold mb-2">Little Blessing</div>
            <p className="text-gray-400 text-sm max-w-xs">
              這是一個充滿愛的平台，讓我們一起陪伴滿寶健康快樂地長大。
            </p>
          </div>
          <div className="max-w-6xl mx-auto mt-12 pt-8 border-t border-gray-800 text-center text-gray-500 text-xs w-full">
            © {new Date().getFullYear()} Little Blessing. Made with Love for 滿寶 💕
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
