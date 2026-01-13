
import React, { useState, useEffect, useMemo } from 'react';
import { Heart, Stars, Baby, Calendar, MessageCircle, ArrowRight, CheckCircle2, ExternalLink, Sparkles, Send, Loader2, AlertCircle } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getFirestore, collection, addDoc, onSnapshot, query, orderBy, serverTimestamp, Firestore } from "firebase/firestore";
import { SUBSCRIPTION_TIERS } from './constants';

// Firebase 設定
const firebaseConfig = {
  apiKey: "AIzaSyCFN5m27Q2BCuHKlofjarX9POrxX3LSCEs",
  authDomain: "baby-first-blessing.firebaseapp.com",
  projectId: "baby-first-blessing",
  storageBucket: "baby-first-blessing.firebasestorage.app",
  messagingSenderId: "1061010685596",
  appId: "1:1061010685596:web:a97d1c09127a6d24ffb759",
  measurementId: "G-H3QM5SWP9E"
};

// 安全初始化 Firebase
let firebaseApp: FirebaseApp | undefined;
let db: Firestore | undefined;

try {
  // 檢查是否已經初始化，避免重複初始化錯誤
  firebaseApp = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  db = getFirestore(firebaseApp);
} catch (error) {
  console.error("Firebase Early Init Error:", error);
}

const DUE_DATE = '2026-07-15';

const App: React.FC = () => {
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [babyDiary, setBabyDiary] = useState<string>('正在感受媽媽的心跳，我是滿寶，期待夏天見面...');
  const [isGenerating, setIsGenerating] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(true);
  const [firestoreError, setFirestoreError] = useState<string | null>(null);

  const pregnancyStatus = useMemo(() => {
    const due = new Date(DUE_DATE);
    const today = new Date();
    const totalDays = 280;
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const currentDays = totalDays - diffDays;
    
    if (currentDays < 0) return { label: "備孕中" };
    const weeks = Math.floor(currentDays / 7);
    const days = currentDays % 7;
    return { label: `${weeks} 週 ${days} 天` };
  }, []);

  // 監聽 Firebase 留言
  useEffect(() => {
    if (!db) {
      setFirestoreError("Firestore service is not available. Check configuration.");
      setIsLoadingMessages(false);
      return;
    }

    let unsubscribe = () => {};
    try {
      const q = query(collection(db, "blessings"), orderBy("timestamp", "desc"));
      unsubscribe = onSnapshot(q, (snapshot) => {
        const msgs = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setMessages(msgs);
        setIsLoadingMessages(false);
        setFirestoreError(null);
      }, (error) => {
        console.error("Firestore Snapshot Error:", error);
        setFirestoreError(error.message);
        setIsLoadingMessages(false);
      });
    } catch (e: any) {
      console.error("Firestore Hook Error:", e);
      setFirestoreError(e.message);
      setIsLoadingMessages(false);
    }
    return () => unsubscribe();
  }, []);

  const generateBabyThoughts = async () => {
    if (!process.env.API_KEY) return;
    setIsGenerating(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `你是一個還在肚子裡的胎兒，小名叫「滿寶」。目前進度是 ${pregnancyStatus.label}。請用可愛溫暖的口吻跟未來的乾爹乾媽說一句話，包含感謝他們的支持。約 50 字。`,
      });
      setBabyDiary(response.text || '今天在裡面翻了一個筋斗，大家都要想我喔！');
    } catch (e) {
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => { generateBabyThoughts(); }, []);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !authorName.trim() || !db) return;
    try {
      await addDoc(collection(db, "blessings"), {
        author: authorName,
        content: newMessage,
        timestamp: serverTimestamp(),
      });
      setNewMessage('');
      setAuthorName('');
    } catch (e) {
      console.error("Send Message Error:", e);
      alert('無法送出留言，請確認 Firestore 規則已設定為公開。');
    }
  };

  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

  return (
    <div className="min-h-screen flex flex-col selection:bg-pink-100 selection:text-pink-600">
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-xl border-b border-pink-50/50 px-6 py-4 flex justify-between items-center transition-all">
        <div className="flex items-center gap-2 cursor-pointer group" onClick={() => window.scrollTo({top:0, behavior:'smooth'})}>
          <div className="bg-pink-500 p-2.5 rounded-2xl text-white shadow-lg shadow-pink-100 group-hover:rotate-12 transition-transform"><Baby size={22}/></div>
          <span className="font-black text-gray-900 tracking-tighter text-2xl">Little ManBao</span>
        </div>
        <div className="hidden md:flex gap-10 text-sm font-bold text-gray-400">
          <button onClick={() => scrollTo('about')} className="hover:text-pink-500 transition-colors">關於滿寶</button>
          <button onClick={() => scrollTo('tiers')} className="hover:text-pink-500 transition-colors">應援計畫</button>
          <button onClick={() => scrollTo('wall')} className="hover:text-pink-500 transition-colors">祝福牆</button>
        </div>
        <button onClick={() => scrollTo('tiers')} className="bg-gray-900 text-white px-8 py-3 rounded-full text-xs font-black shadow-xl shadow-gray-100 hover:bg-black active:scale-95 transition-all">
          成為守護者
        </button>
      </nav>

      <main className="flex-grow pt-24">
        {/* Hero Section */}
        <section id="about" className="max-w-6xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center py-20 overflow-hidden">
          <div className="space-y-10">
            <div className="inline-flex items-center gap-2 bg-pink-50 text-pink-500 px-5 py-2 rounded-full text-[10px] font-black tracking-[0.2em] uppercase border border-pink-100">
              <Sparkles size={14} className="animate-pulse" />
              <span>預產期 2026 / 07 / 15</span>
            </div>
            <h1 className="text-7xl md:text-8xl font-black tracking-tighter text-gray-900 leading-[0.85]">
              Hello World!<br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-rose-400">我是滿寶</span>
            </h1>
            <p className="text-2xl text-gray-500 font-medium leading-relaxed max-w-md">
              目前在媽咪肚子裡待了 <span className="text-pink-500 font-black">{pregnancyStatus.label}</span>。<br/>
              正在努力變壯，準備跟各位乾爹乾媽見面！
            </p>
            <div className="flex flex-wrap gap-5 pt-4">
              <button onClick={() => scrollTo('tiers')} className="group bg-pink-500 text-white px-10 py-5 rounded-3xl font-black shadow-2xl shadow-pink-200 flex items-center gap-3 hover:bg-pink-600 active:scale-95 transition-all">
                支持我的奶粉錢 <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform"/>
              </button>
            </div>
          </div>

          <div className="relative group">
            <div className="absolute -inset-10 bg-gradient-to-tr from-pink-100 to-rose-100 rounded-[5rem] blur-3xl opacity-30 group-hover:opacity-50 transition-all duration-1000"></div>
            <div className="relative bg-white p-5 rounded-[3rem] shadow-[0_40px_80px_-15px_rgba(0,0,0,0.1)] border border-white transform lg:-rotate-1 group-hover:rotate-0 transition-all duration-1000">
              <div className="aspect-[4/3] rounded-[2.5rem] overflow-hidden bg-gray-50 relative">
                {!imgError ? (
                  <img 
                    src="./product_1.jpg" 
                    alt="滿寶第一張照片" 
                    onError={() => setImgError(true)}
                    className="w-full h-full object-cover grayscale contrast-125 transition-all duration-1000 group-hover:grayscale-0 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-pink-50 to-rose-100 flex flex-col items-center justify-center text-pink-300 p-12 text-center">
                    <Baby size={80} className="mb-6 animate-float opacity-50"/>
                    <p className="font-black text-xs uppercase tracking-widest leading-loose">滿寶的首張寫真<br/>拍攝中...</p>
                  </div>
                )}
                <div className="absolute top-6 left-6 bg-white/90 backdrop-blur px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest text-pink-500 shadow-sm">Growth Step</div>
              </div>
              <div className="mt-8 flex justify-between items-end px-4">
                <div className="space-y-2">
                  <div className="text-[10px] text-gray-300 font-black uppercase tracking-widest">Growth Progress</div>
                  <div className="flex items-center gap-3 text-gray-800">
                    <div className="p-2 bg-pink-50 rounded-xl"><Calendar size={20} className="text-pink-500" /></div>
                    <span className="text-xl font-black">{pregnancyStatus.label}</span>
                  </div>
                </div>
                <div className="bg-pink-500 h-10 w-10 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-pink-100">
                  <Heart size={20} fill="currentColor" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Baby Secret Voice Section */}
        <section className="py-32 bg-white">
          <div className="max-w-4xl mx-auto px-6">
            <div className="bg-white p-12 md:p-24 rounded-[4rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.05)] border border-pink-50/50 text-center relative overflow-hidden">
              <h2 className="text-[10px] font-black text-pink-300 tracking-[0.5em] uppercase mb-12">Man-Bao's Secret Voice</h2>
              <div className="min-h-[140px] flex items-center justify-center">
                <p className="text-3xl md:text-4xl font-bold text-gray-800 italic leading-snug tracking-tight px-4">「{babyDiary}」</p>
              </div>
              <div className="mt-16">
                <button 
                  onClick={generateBabyThoughts} 
                  disabled={isGenerating}
                  className="inline-flex items-center gap-3 px-10 py-4 rounded-full bg-gray-50 text-gray-400 font-black text-xs hover:bg-pink-50 hover:text-pink-500 transition-all disabled:opacity-50 group"
                >
                  <Stars size={16} className={isGenerating ? 'animate-spin' : 'group-hover:rotate-12 transition-transform'} />
                  {isGenerating ? '正在穿越羊水中...' : '再聽聽滿寶別的話'}
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Tiers Section */}
        <section id="tiers" className="py-32 bg-[#fffafa]">
          <div className="max-w-6xl mx-auto px-6 text-center mb-24">
            <h2 className="text-5xl font-black text-gray-900 tracking-tighter mb-4">乾爹乾媽應援方案</h2>
            <p className="text-gray-400 font-bold uppercase text-xs tracking-[0.4em]">Become his guardian from day zero</p>
          </div>
          <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-3 gap-10">
            {SUBSCRIPTION_TIERS.map(tier => (
              <div key={tier.id} className="group bg-white p-12 rounded-[3.5rem] shadow-[0_20px_60px_rgba(0,0,0,0.02)] border border-gray-100/50 flex flex-col hover:-translate-y-4 transition-all duration-500">
                <div className={`self-start px-4 py-1.5 rounded-full text-[10px] font-black mb-10 uppercase tracking-widest ${tier.color}`}>{tier.name}</div>
                <div className="mb-8">
                  <span className="text-6xl font-black text-gray-900 tracking-tighter">NT${tier.price}</span>
                  <span className="text-gray-300 text-sm font-bold ml-1">/ mo</span>
                </div>
                <p className="text-gray-500 font-medium mb-12 leading-relaxed text-lg">{tier.description}</p>
                <div className="space-y-5 mb-14 flex-grow border-t border-gray-50 pt-10">
                  {tier.perks.map((p, i) => (
                    <div key={i} className="flex gap-4 text-sm font-bold text-gray-600 leading-snug">
                      <div className="bg-green-50 p-1 rounded-full shrink-0"><CheckCircle2 className="text-green-500" size={16}/></div>
                      <span>{p}</span>
                    </div>
                  ))}
                </div>
                <button className="w-full py-5 bg-blue-600 text-white rounded-[2rem] font-black shadow-2xl shadow-blue-100 hover:bg-blue-700 transition-all flex items-center justify-center gap-3 active:scale-95 group-hover:scale-[1.02]">
                  PayPal 訂閱支持 <ExternalLink size={18}/>
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Blessing Wall Section */}
        <section id="wall" className="py-40 px-6 max-w-7xl mx-auto grid lg:grid-cols-2 gap-24">
          <div className="space-y-12">
            <div className="space-y-6">
              <h2 className="text-6xl font-black text-gray-900 tracking-tighter leading-tight">祝福留言牆</h2>
              <p className="text-gray-500 font-medium text-xl max-w-sm leading-relaxed">每一句對滿寶的祝福，都會成為他成長的力量。</p>
            </div>
            
            <form onSubmit={handleSendMessage} className="bg-white p-12 rounded-[4rem] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.08)] border border-gray-50 space-y-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-gray-300 uppercase tracking-[0.3em] ml-2">您的暱稱</label>
                <input 
                  type="text" 
                  required
                  value={authorName} 
                  onChange={e => setAuthorName(e.target.value)} 
                  className="w-full px-8 py-5 bg-gray-50 rounded-3xl font-bold focus:ring-2 focus:ring-pink-200 outline-none transition-all placeholder:text-gray-200 text-lg" 
                  placeholder="乾爹 / 乾媽的名字"
                />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-gray-300 uppercase tracking-[0.3em] ml-2">祝福悄悄話</label>
                <textarea 
                  rows={4} 
                  required
                  value={newMessage} 
                  onChange={e => setNewMessage(e.target.value)} 
                  className="w-full px-8 py-5 bg-gray-50 rounded-3xl font-medium focus:ring-2 focus:ring-pink-200 outline-none resize-none transition-all placeholder:text-gray-200 text-lg" 
                  placeholder="寫下您想對滿寶說的話..."
                />
              </div>
              <button className="w-full bg-gray-900 text-white py-6 rounded-[2rem] font-black flex items-center justify-center gap-3 active:scale-95 transition-all hover:bg-black shadow-2xl shadow-gray-200 text-lg">
                <Send size={22}/> 送出愛的祝福
              </button>
            </form>
          </div>

          <div className="relative">
            <div className="absolute top-0 inset-x-0 h-24 bg-gradient-to-b from-[#fffcfc] to-transparent z-10 pointer-events-none"></div>
            <div className="space-y-8 max-h-[850px] overflow-y-auto pr-6 scrollbar-hide py-12">
              {firestoreError ? (
                <div className="bg-red-50 p-10 rounded-[3rem] border border-red-100 text-center space-y-4">
                  <div className="bg-white w-14 h-14 rounded-2xl flex items-center justify-center mx-auto text-red-500 shadow-sm">
                    <AlertCircle size={30} />
                  </div>
                  <h3 className="font-black text-red-900">載入失敗</h3>
                  <p className="text-red-700/70 text-sm font-medium leading-relaxed">
                    Firestore 連線不穩定或服務尚未就緒。
                  </p>
                </div>
              ) : isLoadingMessages ? (
                <div className="flex flex-col items-center justify-center py-20 text-gray-300 space-y-4">
                  <Loader2 size={40} className="animate-spin opacity-50" />
                  <p className="font-black text-sm uppercase tracking-widest">祝福載入中...</p>
                </div>
              ) : messages.length > 0 ? messages.map(msg => (
                <div key={msg.id} className="bg-white p-10 rounded-[3rem] border border-gray-50 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                  <div className="flex items-center gap-5 mb-6">
                    <div className="w-14 h-14 bg-pink-50 rounded-2xl flex items-center justify-center text-pink-400 group-hover:scale-110 transition-transform"><MessageCircle size={28}/></div>
                    <div>
                      <div className="font-black text-gray-900 text-xl">{msg.author}</div>
                      <div className="text-[10px] text-gray-300 font-black tracking-widest uppercase mt-0.5">
                        {msg.timestamp?.toDate ? msg.timestamp.toDate().toLocaleDateString() : '剛剛發佈'}
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-600 font-medium leading-relaxed italic text-xl px-2">「{msg.content}」</p>
                </div>
              )) : (
                <div className="h-full flex flex-col items-center justify-center border-4 border-dashed border-gray-50 rounded-[4rem] p-24 text-gray-200 text-center space-y-6">
                  <Baby size={80} className="opacity-10 animate-float"/>
                  <div className="space-y-2">
                    <p className="font-black text-xl tracking-tight text-gray-300">目前還沒有留言</p>
                    <p className="text-sm font-bold opacity-50">成為第一個祝福滿寶的人吧！</p>
                  </div>
                </div>
              )}
            </div>
            <div className="absolute bottom-0 inset-x-0 h-24 bg-gradient-to-t from-[#fffcfc] to-transparent z-10 pointer-events-none"></div>
          </div>
        </section>
      </main>

      <footer className="bg-gray-900 text-white py-32 px-6 mt-20 relative overflow-hidden">
        <div className="max-w-6xl mx-auto text-center space-y-16 relative z-10">
          <div className="flex flex-col items-center gap-6 group cursor-pointer" onClick={() => window.scrollTo({top:0, behavior:'smooth'})}>
            <div className="bg-pink-500/10 p-5 rounded-[2rem] border border-pink-500/20 group-hover:scale-110 transition-all duration-500">
              <Baby size={54} className="text-pink-400"/>
            </div>
            <span className="text-4xl font-black tracking-tighter uppercase italic tracking-[0.2em]">Little Blessing</span>
          </div>
          <p className="text-gray-500 font-bold max-w-xl mx-auto leading-relaxed text-lg">
            每一份訂閱都是對生命的祝福。所有款項將全數用於滿寶的成長與教育。感謝您參與這段美好的旅程。
          </p>
          <div className="pt-20 border-t border-white/5 text-[10px] text-gray-700 font-black tracking-[0.6em] uppercase">
            © {new Date().getFullYear()} ManBao Growth Project . All Rights Reserved
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
