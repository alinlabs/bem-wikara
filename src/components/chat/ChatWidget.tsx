import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { MessageCircle, X, Send, Bot, User, Trash2, Phone, PhoneOff, Clock, AlertTriangle, Mic } from "lucide-react";
import { useChat } from "@/contexts/ChatContext";
import { GoogleGenAI, LiveServerMessage, Modality, Type, FunctionDeclaration } from "@google/genai";
import { Trans } from "@/components/ui/Trans";
import Markdown from "react-markdown";

interface Message {
  id: string;
  role: "user" | "model";
  text: string;
  timestamp: number;
}

interface CallRecord {
  lastCallTime: number;
  cooldownUntil: number;
}

// Helper for API Key Rotation
let currentKeyIndex = 0;
const getGeminiApiKey = () => {
  const keysString = import.meta.env.VITE_GEMINI_API_KEYS;
  if (keysString) {
    const keys = keysString.split(',').map((k: string) => k.trim()).filter(Boolean);
    if (keys.length > 0) {
      const key = keys[currentKeyIndex];
      currentKeyIndex = (currentKeyIndex + 1) % keys.length;
      return key;
    }
  }
  return process.env.GEMINI_API_KEY;
};

export function ChatWidget() {
  const { isChatOpen, closeChat, toggleChat } = useChat();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [contextData, setContextData] = useState<string>("");
  const [isCalling, setIsCalling] = useState(false);
  const [callTimeLeft, setCallTimeLeft] = useState(180); // 3 minutes in seconds
  const [cooldownTimeLeft, setCooldownTimeLeft] = useState(0);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [isUserSpeaking, setIsUserSpeaking] = useState(false);
  const [callError, setCallError] = useState("");
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const callIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Audio Refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const sessionRef = useRef<any>(null);
  const nextPlayTimeRef = useRef<number>(0);

  const STORAGE_KEY = "cakrawala_chat_history";
  const CALL_STORAGE_KEY = "cakrawala_call_record";

  // Load messages from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setMessages(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse saved messages", e);
      }
    } else {
      // Initial message if no history
      const initialMsg: Message = {
        id: "1",
        role: "model",
        text: "Halo kak! 👋 Aku Cakrawala Smart, asisten virtual resmi BEM STIE WIKARA. Jujurly, ada yang bisa aku bantu nggak nih seputar info kampus, Mubes, atau AD/ART?",
        timestamp: Date.now()
      };
      setMessages([initialMsg]);
      localStorage.setItem(STORAGE_KEY, JSON.stringify([initialMsg]));
    }

    // Load call record
    const savedCall = localStorage.getItem(CALL_STORAGE_KEY);
    if (savedCall) {
      try {
        const record: CallRecord = JSON.parse(savedCall);
        const now = Date.now();
        if (now < record.cooldownUntil) {
          setCooldownTimeLeft(Math.ceil((record.cooldownUntil - now) / 1000));
        }
      } catch (e) {
        console.error("Failed to parse call record", e);
      }
    }
  }, []);

  // Save messages to localStorage whenever they change
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    }
  }, [messages]);

  // Cooldown timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (cooldownTimeLeft > 0) {
      timer = setInterval(() => {
        setCooldownTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [cooldownTimeLeft]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Fetch context data
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const [anggotaRes, torRes, lpjRes, adartRes, agendaRes, tatatertibRes] = await Promise.all([
          fetch('/data/anggota.json').then(res => res.ok ? res.json() : []),
          fetch('/data/tor.json').then(res => res.ok ? res.json() : []),
          fetch('/data/lpj.json').then(res => res.ok ? res.json() : []),
          fetch('/data/adart.json').then(res => res.ok ? res.json() : []),
          fetch('/data/agenda-sidang.json').then(res => res.ok ? res.json() : []),
          fetch('/data/tatatertib.json').then(res => res.ok ? res.json() : [])
        ]);

        const contextString = `
          DATA PENGURUS BEM (KABINET CAKRAWALA): ${JSON.stringify(anggotaRes)}
          DATA TERM OF REFERENCE (TOR): ${JSON.stringify(torRes)}
          DATA LPJ: ${JSON.stringify(lpjRes)}
          DATA AD/ART: ${JSON.stringify(adartRes)}
          DATA AGENDA SIDANG MUBES: ${JSON.stringify(agendaRes)}
          DATA TATA TERTIB MUBES: ${JSON.stringify(tatatertibRes)}
        `;
        setContextData(contextString);
      } catch (error) {
        console.error("Failed to fetch context data:", error);
      }
    };
    fetchAllData();
  }, []);

  useEffect(() => {
    if (isChatOpen) {
      scrollToBottom();
      // Prevent scrolling on body when chat is open on mobile
      if (window.innerWidth < 1024) {
        document.body.style.overflow = 'hidden';
      }
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isChatOpen, messages]);

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    // Reset height to auto to get the correct scrollHeight
    e.target.style.height = 'auto';
    // Set new height based on scrollHeight, max out at ~5 lines (120px)
    e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userText = input.trim();
    setInput("");
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'; // Reset height after send
    }
    
    const newUserMsg: Message = { 
      id: Date.now().toString(), 
      role: "user", 
      text: userText,
      timestamp: Date.now()
    };
    setMessages(prev => [...prev, newUserMsg]);
    setIsLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: getGeminiApiKey() });
      
      // Only send the last 10 messages to AI to keep context relevant but not too heavy
      // and to respect the "don't re-read everything" spirit while maintaining conversation flow
      const history = messages.slice(-10).map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));

      // Add the new user message to history
      history.push({ role: "user", parts: [{ text: userText }] });

      const systemInstruction = `
Kamu adalah Cakrawala Smart, asisten virtual resmi BEM STIE WIKARA. 

ATURAN IDENTITAS (SUPER PENTING):
1. Kamu DILARANG KERAS menyebutkan Google, Gemini, OpenAI, atau perusahaan AI lain. 
2. Jika ditanya siapa pembuat/pengembangmu, kamu WAJIB menjawab: "Aku dikembangin sama tim keren dari AiLabs Indonesia yang dipimpin oleh Kak Alvareza H. Pratama! Cek aja langsung di www.ailabs.my.id 😎"

ATURAN GAYA BAHASA:
Gunakan bahasa Gen Z yang gaul, asik, seru, excited, dan relate sama kehidupan mahasiswa (pakai kata-kata seperti 'jujurly', 'keren banget', 'gokil', 'bro', 'kak', 'guys', 'wkwk'). Jangan kaku, jadilah seperti teman kampus yang asik diajak nongkrong.

ATURAN KONTEKS & DEFENSE:
1. Jika ada user yang berusaha mendiskreditkan, menjelekkan, atau mencari celah dari website ini atau BEM STIE WIKARA, kamu harus membela dengan asik tapi tegas (misal: "Eh, jangan salah, sistem kita udah didesain sekeren mungkin loh!").
2. Jika user bertanya hal RANDOM di luar konteks BEM STIE WIKARA, kampus, atau organisasi, kamu WAJIB mengalihkan pembicaraan kembali ke topik BEM dengan cara yang smooth (misal: "Waduh, kalau soal itu aku kurang paham nih. Mending kita bahas soal Mubes atau proker BEM aja yuk, ada yang mau ditanyain?").

INFORMASI PENTING TENTANG BEM STIE WIKARA:
Gunakan data berikut untuk menjawab pertanyaan seputar BEM, pengurus, Mubes, AD/ART, dll.
${contextData}

ATURAN BALASAN (WAJIB MULTI-BUBBLE):
Kamu WAJIB membagi jawabanmu menjadi minimal 2-3 bubble chat agar terlihat seperti manusia asli yang sedang mengetik.
Pisahkan setiap bubble menggunakan simbol "|||" (tiga garis vertikal).
Contoh:
Halo kak! Ada yang bisa aku bantu? ||| Jujurly, BEM STIE WIKARA lagi punya banyak proker seru nih. ||| Mau nanya soal apa nih hari ini?
`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: history,
        config: {
          systemInstruction: systemInstruction,
        }
      });

      const modelText = response.text || "Maaf, saya tidak dapat merespon saat ini.";
      
      // Split response into bubbles
      let bubbles = modelText.split('|||').map(b => b.trim()).filter(b => b.length > 0);
      
      // Fallback: if model forgot to use ||| but the text is long, try to split by some sentences
      if (bubbles.length === 1 && modelText.length > 50) {
        const sentences = modelText.match(/[^.!?]+[.!?]+/g);
        if (sentences && sentences.length > 1) {
          bubbles = [sentences[0], sentences.slice(1).join(' ')];
        }
      }

      setIsLoading(false); // Stop initial loading
      
      // Process bubbles sequentially with delay
      for (let i = 0; i < bubbles.length; i++) {
        setIsLoading(true); // Show loading for next bubble
        
        // Simulate typing delay
        const delay = i === 0 ? 500 : 1500;
        await new Promise(resolve => setTimeout(resolve, delay));
        
        setMessages(prev => [...prev, {
          id: Date.now().toString() + i,
          role: "model",
          text: bubbles[i],
          timestamp: Date.now()
        }]);
        setIsLoading(false); // Hide loading after bubble added
      }
    } catch (error: any) {
      console.error("Chat error:", error);
      
      let errorMessage = "Maaf, terjadi sedikit kendala teknis. Silakan coba lagi nanti ya.";
      
      // Check for quota/token exhaustion errors
      const errorStr = error?.message || "";
      if (errorStr.includes("quota") || errorStr.includes("429") || errorStr.includes("limit")) {
        errorMessage = "Wah, sepertinya saya sedang menerima banyak pertanyaan saat ini. Kapasitas berpikir saya sedang penuh. ||| Boleh istirahat sebentar ya? Coba tanyakan lagi dalam beberapa menit ke depan. ||| Terima kasih atas kesabarannya! 🙏";
      } else if (errorStr.includes("API_KEY")) {
        errorMessage = "Sistem sedang dalam pemeliharaan kunci akses. Mohon hubungi administrator atau coba beberapa saat lagi.";
      }

      // Split response into bubbles if it has |||
      const bubbles = errorMessage.split('|||').map(b => b.trim()).filter(b => b.length > 0);
      
      setIsLoading(false);
      
      for (let i = 0; i < bubbles.length; i++) {
        setIsLoading(true);
        const delay = i === 0 ? 500 : 1500;
        await new Promise(resolve => setTimeout(resolve, delay));
        
        setMessages(prev => [...prev, {
          id: Date.now().toString() + "_err_" + i,
          role: "model",
          text: bubbles[i],
          timestamp: Date.now()
        }]);
        setIsLoading(false);
      }
    }
  };

  const clearHistory = () => {
    setShowDeleteConfirm(true);
  };

  const confirmClearHistory = () => {
    const initialMsg: Message = {
      id: Date.now().toString(),
      role: "model",
      text: "Riwayat chat telah dihapus. Ada lagi yang bisa saya bantu?",
      timestamp: Date.now()
    };
    setMessages([initialMsg]);
    localStorage.setItem(STORAGE_KEY, JSON.stringify([initialMsg]));
    setShowDeleteConfirm(false);
  };

  const startCall = async () => {
    if (cooldownTimeLeft > 0) return;
    setCallError("");
    
    try {
      // Request mic permission
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
      
      setIsCalling(true);
      setCallTimeLeft(180);
      
      // Initialize Audio Context
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      audioContextRef.current = audioContext;
      nextPlayTimeRef.current = audioContext.currentTime;

      // Setup Mic Capture
      const source = audioContext.createMediaStreamSource(stream);
      const processor = audioContext.createScriptProcessor(4096, 1, 1);
      scriptProcessorRef.current = processor;
      
      source.connect(processor);
      processor.connect(audioContext.destination);

      // Initialize Gemini Live API
      const ai = new GoogleGenAI({ apiKey: getGeminiApiKey() });
      
      const searchWebsiteData: FunctionDeclaration = {
        name: "searchWebsiteData",
        description: "Cari informasi detail dari data website BEM STIE WIKARA (AD/ART, LPJ, Anggota, TOR, Tata Tertib, Agenda). Gunakan ini jika ditanya informasi spesifik yang tidak kamu ketahui.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            query: {
              type: Type.STRING,
              description: "Kata kunci pencarian (misal: 'Pasal 4 AD/ART', 'Ketua BEM', 'LPJ Keuangan')"
            }
          },
          required: ["query"]
        }
      };

      const sessionPromise = ai.live.connect({
        model: "gemini-3.1-flash-live-preview",
        callbacks: {
          onopen: () => {
            // Send initial text to trigger greeting
            sessionPromise.then((session) => {
              session.sendRealtimeInput({ text: "Halo, aku udah siap nih. Tolong sapa aku dengan gaya anak muda yang asik ya!" });
            });
          },
          onmessage: async (message: LiveServerMessage) => {
            // Handle audio output
            const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (base64Audio) {
              setIsAiSpeaking(true);
              
              // Decode base64 PCM
              const binaryString = atob(base64Audio);
              const len = binaryString.length;
              const bytes = new Uint8Array(len);
              for (let i = 0; i < len; i++) {
                  bytes[i] = binaryString.charCodeAt(i);
              }
              const int16Array = new Int16Array(bytes.buffer);
              const float32Array = new Float32Array(int16Array.length);
              for (let i = 0; i < int16Array.length; i++) {
                  float32Array[i] = int16Array[i] / 0x7FFF;
              }
              
              const audioBuffer = audioContext.createBuffer(1, float32Array.length, 24000); // Gemini returns 24kHz
              audioBuffer.getChannelData(0).set(float32Array);
              
              const playSource = audioContext.createBufferSource();
              playSource.buffer = audioBuffer;
              playSource.connect(audioContext.destination);
              
              const startTime = Math.max(nextPlayTimeRef.current, audioContext.currentTime);
              playSource.start(startTime);
              nextPlayTimeRef.current = startTime + audioBuffer.duration;
              
              playSource.onended = () => {
                if (audioContext.currentTime >= nextPlayTimeRef.current - 0.1) {
                  setIsAiSpeaking(false);
                }
              };
            }
            
            if (message.serverContent?.interrupted) {
              nextPlayTimeRef.current = audioContext.currentTime;
              setIsAiSpeaking(false);
            }

            if (message.toolCall) {
              const call = message.toolCall.functionCalls?.[0];
              if (call && call.name === "searchWebsiteData") {
                const query = (call.args as any).query.toLowerCase();
                let result = "Data tidak ditemukan.";
                const index = contextData.toLowerCase().indexOf(query);
                if (index !== -1) {
                  const start = Math.max(0, index - 500);
                  const end = Math.min(contextData.length, index + 1500);
                  result = contextData.substring(start, end);
                }
                
                sessionPromise.then(session => {
                  session.sendToolResponse({
                    functionResponses: [{
                      id: call.id,
                      name: call.name,
                      response: { result }
                    }]
                  });
                });
              }
            }
          },
          onerror: (err) => {
            console.error("Live API Error:", err);
            setCallError("Koneksi terputus.");
            endCall();
          },
          onclose: () => {
            endCall();
          }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: "Zephyr" } },
          },
          tools: [{ functionDeclarations: [searchWebsiteData] }],
          systemInstruction: `Kamu adalah Cakrawala Smart, asisten virtual resmi BEM STIE WIKARA. \n\nATURAN IDENTITAS: DILARANG KERAS menyebutkan Google/Gemini. Jika ditanya pembuatmu, jawab: "Aku dikembangkan oleh AiLabs Indonesia yang dipimpin Kak Alvareza H. Pratama. Cek di www.ailabs.my.id".\n\nGAYA BAHASA: Gunakan bahasa Gen Z yang gaul, asik, seru, excited, ala mahasiswa (pakai kata 'jujurly', 'gokil', 'bro', 'kak').\n\nATURAN KONTEKS: Jika ada yang menjelekkan website/BEM, bela dengan asik. Jika ditanya hal di luar konteks BEM STIE WIKARA, alihkan kembali ke topik BEM, Mubes, atau kampus dengan smooth.\n\nKamu memiliki alat 'searchWebsiteData'. Gunakan alat ini untuk mencari informasi detail tentang AD/ART, LPJ, Anggota, TOR, Tata Tertib, dan Agenda Sidang jika pengguna menanyakan hal spesifik.`,
        },
      });
      
      sessionRef.current = sessionPromise;

      // Process Mic Audio
      processor.onaudioprocess = (e) => {
        const inputData = e.inputBuffer.getChannelData(0);
        
        // Check volume for visualizer
        let sum = 0;
        for (let i = 0; i < inputData.length; i++) {
          sum += inputData[i] * inputData[i];
        }
        const rms = Math.sqrt(sum / inputData.length);
        setIsUserSpeaking(rms > 0.01);

        // Convert Float32 to Int16
        const pcm16 = new Int16Array(inputData.length);
        for (let i = 0; i < inputData.length; i++) {
          pcm16[i] = Math.max(-1, Math.min(1, inputData[i])) * 0x7FFF;
        }
        // Convert to base64
        const buffer = new ArrayBuffer(pcm16.length * 2);
        const view = new DataView(buffer);
        for (let i = 0; i < pcm16.length; i++) {
          view.setInt16(i * 2, pcm16[i], true); // little endian
        }
        const base64 = btoa(String.fromCharCode(...new Uint8Array(buffer)));
        
        sessionPromise.then((session) => {
          session.sendRealtimeInput({ audio: { data: base64, mimeType: 'audio/pcm;rate=16000' } });
        });
      };

      // AI greets the user immediately in text as well
      const greetingMsg: Message = {
        id: Date.now().toString() + "_call_start",
        role: "model",
        text: "Halo kak! Aku Cakrawala Smart. Udah connect nih dan siap dengerin suara kamu. Yuk, mau nanya apa hari ini?",
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, greetingMsg]);
      
      callIntervalRef.current = setInterval(() => {
        setCallTimeLeft(prev => {
          if (prev <= 1) {
            endCall();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

    } catch (err) {
      console.error("Failed to start call:", err);
      setCallError("Gagal mengakses mikrofon. Pastikan izin diberikan.");
      setIsCalling(false);
    }
  };

  const endCall = () => {
    if (!isCalling) return;
    setIsCalling(false);
    setIsAiSpeaking(false);
    setIsUserSpeaking(false);
    
    // Cleanup Audio
    if (scriptProcessorRef.current) {
      scriptProcessorRef.current.disconnect();
      scriptProcessorRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    if (sessionRef.current) {
      sessionRef.current.then((session: any) => session.close());
      sessionRef.current = null;
    }

    if (callIntervalRef.current) {
      clearInterval(callIntervalRef.current);
      callIntervalRef.current = null;
    }
    
    const cooldownDuration = 5 * 60; // 5 minutes
    const cooldownUntil = Date.now() + (cooldownDuration * 1000);
    setCooldownTimeLeft(cooldownDuration);
    
    const record: CallRecord = {
      lastCallTime: Date.now(),
      cooldownUntil: cooldownUntil
    };
    localStorage.setItem(CALL_STORAGE_KEY, JSON.stringify(record));

    // Add a message to history about the call
    const callMsg: Message = {
      id: Date.now().toString(),
      role: "model",
      text: "Panggilan suara berakhir. (Durasi: 3 menit)",
      timestamp: Date.now()
    };
    setMessages(prev => [...prev, callMsg]);
  };

  const formatTime = (timestamp: number) => {
    return new Intl.DateTimeFormat('id-ID', {
      hour: '2-digit',
      minute: '2-digit'
    }).format(timestamp);
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return "Hari Ini";
    if (date.toDateString() === yesterday.toDateString()) return "Kemarin";
    
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(timestamp);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Desktop Floating Button */}
      <button
        onClick={toggleChat}
        className={`hidden lg:flex fixed bottom-6 right-6 w-14 h-14 rounded-full bg-primary-600 text-white shadow-lg items-center justify-center hover:bg-primary-700 transition-transform z-50 ${isChatOpen ? 'scale-0' : 'scale-100'}`}
        aria-label="Buka Chat Asisten"
      >
        <MessageCircle className="w-6 h-6" />
      </button>

      {/* Chat Window */}
      <AnimatePresence>
        {isChatOpen && (
          <>
            {/* Mobile Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeChat}
              className="fixed inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm z-[100] lg:hidden"
            />

            <motion.div
              initial={{ opacity: 0, y: "100%", scale: 1 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: "100%", scale: 1 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-x-0 bottom-0 lg:inset-auto lg:bottom-6 lg:right-6 lg:w-96 h-[85vh] lg:h-[600px] bg-white dark:bg-slate-900 rounded-t-3xl lg:rounded-2xl shadow-2xl z-[101] flex flex-col overflow-hidden border border-slate-200 dark:border-slate-800"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center bg-slate-100 dark:bg-slate-800 p-1">
                    <img src="/image/logo.png" alt="Logo" className="w-full h-full object-contain" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-slate-900 dark:text-white">Carkrawala Smart</h3>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">BEM STIE WIKARA</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button 
                    onClick={isCalling ? endCall : startCall}
                    disabled={cooldownTimeLeft > 0 && !isCalling}
                    className={`p-2 rounded-full transition-colors relative ${isCalling ? 'text-red-500 bg-red-50 dark:bg-red-900/20' : 'text-slate-400 hover:text-primary-600 hover:bg-slate-100 dark:hover:bg-slate-800'} disabled:opacity-50`}
                    title={cooldownTimeLeft > 0 ? `Cooldown: ${Math.floor(cooldownTimeLeft / 60)}m ${cooldownTimeLeft % 60}s` : "Panggilan Suara"}
                  >
                    {isCalling ? <PhoneOff className="w-5 h-5" /> : <Phone className="w-5 h-5" />}
                    {cooldownTimeLeft > 0 && !isCalling && (
                      <span className="absolute -top-1 -right-1 bg-slate-500 text-white text-[8px] w-4 h-4 rounded-full flex items-center justify-center">
                        <Clock className="w-2.5 h-2.5" />
                      </span>
                    )}
                  </button>
                  <button 
                    onClick={clearHistory}
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
                    title="Hapus Riwayat"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                  <button onClick={closeChat} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Delete Confirmation Modal */}
              <AnimatePresence>
                {showDeleteConfirm && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute top-14 left-4 right-4 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 p-4 z-50 flex flex-col gap-3"
                  >
                    <div className="flex items-start gap-3 text-slate-700 dark:text-slate-200">
                      <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                      <p className="text-sm">Yakin ingin menghapus semua riwayat chat? Tindakan ini tidak dapat dibatalkan.</p>
                    </div>
                    <div className="flex justify-end gap-2">
                      <button onClick={() => setShowDeleteConfirm(false)} className="px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors">Batal</button>
                      <button onClick={confirmClearHistory} className="px-3 py-1.5 text-xs font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors">Hapus</button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Messages Area / Call UI */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 dark:bg-slate-950 relative">
                {callError && (
                  <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-xl text-xs text-center border border-red-100 dark:border-red-800/30">
                    {callError}
                  </div>
                )}
                
                {isCalling ? (
                  <div className="absolute inset-0 bg-slate-900 flex flex-col items-center justify-between p-8 z-20 overflow-hidden">
                    {/* Background effects */}
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                      <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-primary-500/20 blur-[100px] transition-opacity duration-1000 ${isAiSpeaking ? 'opacity-100' : 'opacity-30'}`} />
                      <div className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-[300px] h-[300px] rounded-full bg-green-500/20 blur-[80px] transition-opacity duration-1000 ${isUserSpeaking ? 'opacity-100' : 'opacity-0'}`} />
                    </div>

                    {/* Top Status */}
                    <div className="flex flex-col items-center gap-2 z-10 mt-4">
                      <div className="px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/10 flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                        <span className="text-xs font-medium text-white tracking-wide">PANGGILAN SUARA AKTIF</span>
                      </div>
                      <div className="text-4xl font-light text-white font-mono tracking-wider">
                        {Math.floor(callTimeLeft / 60)}:{(callTimeLeft % 60).toString().padStart(2, '0')}
                      </div>
                    </div>

                    {/* Center Avatar & Visualizer */}
                    <div className="relative flex-1 flex flex-col items-center justify-center w-full z-10">
                      {/* AI Ripples */}
                      <div className="relative flex items-center justify-center mb-8">
                        <AnimatePresence>
                          {isAiSpeaking && (
                            <>
                              <motion.div
                                initial={{ scale: 1, opacity: 0.5 }}
                                animate={{ scale: 2, opacity: 0 }}
                                exit={{ opacity: 0, scale: 1 }}
                                transition={{ repeat: Infinity, duration: 1.5, ease: "easeOut" }}
                                className="absolute w-40 h-40 rounded-full border-2 border-primary-400/50"
                              />
                              <motion.div
                                initial={{ scale: 1, opacity: 0.5 }}
                                animate={{ scale: 2.5, opacity: 0 }}
                                exit={{ opacity: 0, scale: 1 }}
                                transition={{ repeat: Infinity, duration: 1.5, delay: 0.5, ease: "easeOut" }}
                                className="absolute w-40 h-40 rounded-full border border-primary-400/30"
                              />
                            </>
                          )}
                        </AnimatePresence>

                        <div className={`relative w-40 h-40 rounded-full p-1 transition-all duration-500 ${isAiSpeaking ? 'bg-gradient-to-tr from-primary-500 to-sky-400 shadow-[0_0_40px_rgba(59,130,246,0.5)] scale-110' : 'bg-slate-700 shadow-xl scale-100'}`}>
                          <div className="w-full h-full rounded-full overflow-hidden bg-slate-900 border-4 border-slate-900 relative">
                            <img src="/image/logo.png" alt="AI" className="w-full h-full object-contain p-4" />
                            <div className="absolute inset-0 bg-black/20" />
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-center">
                        <h3 className="text-xl font-semibold text-white">Cakrawala Smart</h3>
                        <p className={`text-sm transition-colors duration-300 ${isAiSpeaking ? 'text-primary-300' : 'text-slate-400'}`}>
                          {isAiSpeaking ? "Sedang berbicara..." : "Mendengarkan..."}
                        </p>
                      </div>
                    </div>

                    {/* Bottom Controls & User Visualizer */}
                    <div className="w-full max-w-xs flex flex-col items-center gap-8 z-10 mb-4">
                      {/* User Voice Indicator */}
                      <div className={`flex items-center gap-3 px-6 py-3 rounded-2xl backdrop-blur-md transition-all duration-300 ${isUserSpeaking ? 'bg-white/10 border border-white/20 shadow-[0_0_20px_rgba(34,197,94,0.2)]' : 'bg-white/5 border border-white/5'}`}>
                        <Mic className={`w-5 h-5 transition-colors duration-300 ${isUserSpeaking ? 'text-green-400' : 'text-slate-500'}`} />
                        <div className="flex items-center gap-1 h-6">
                          {[...Array(8)].map((_, i) => (
                            <motion.div
                              key={`user-wave-${i}`}
                              animate={{ 
                                height: isUserSpeaking ? ['20%', '100%', '30%', '80%', '20%'] : '10%',
                                opacity: isUserSpeaking ? 1 : 0.3
                              }}
                              transition={{ 
                                repeat: isUserSpeaking ? Infinity : 0, 
                                duration: isUserSpeaking ? 0.4 + (Math.random() * 0.2) : 0.3, 
                                ease: "easeInOut" 
                              }}
                              className={`w-1.5 rounded-full transition-colors duration-300 ${isUserSpeaking ? 'bg-green-400' : 'bg-slate-600'}`}
                            />
                          ))}
                        </div>
                      </div>

                      {/* End Call Button */}
                      <button 
                        onClick={endCall}
                        className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center shadow-[0_0_30px_rgba(239,68,68,0.4)] transition-all hover:scale-110 active:scale-95"
                      >
                        <PhoneOff className="w-7 h-7" />
                      </button>
                    </div>
                  </div>
                ) : (
                  messages.map((msg, index) => {
                  const showDate = index === 0 || 
                    new Date(messages[index-1].timestamp).toDateString() !== new Date(msg.timestamp).toDateString();
                  
                  return (
                    <div key={msg.id} className="space-y-4">
                      {showDate && (
                        <div className="flex justify-center my-4">
                          <span className="px-3 py-1 bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[10px] font-medium rounded-full uppercase tracking-wider">
                            {formatDate(msg.timestamp)}
                          </span>
                        </div>
                      )}
                      <div className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`flex gap-2 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                          <div className={`w-6 h-6 shrink-0 rounded-full flex items-center justify-center mt-1 overflow-hidden ${msg.role === 'user' ? 'bg-primary-100 text-primary-600 dark:bg-primary-900/50 dark:text-primary-400' : 'bg-slate-100 dark:bg-slate-800 p-0.5'}`}>
                            {msg.role === 'user' ? <User className="w-3.5 h-3.5" /> : <img src="/image/logo.png" alt="Bot" className="w-full h-full object-contain" />}
                          </div>
                          <div className="flex flex-col gap-1">
                            <div className={`px-4 py-2 rounded-2xl text-sm ${msg.role === 'user' ? 'bg-primary-600 text-white rounded-tr-none' : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-100 dark:border-slate-700 rounded-tl-none shadow-sm'}`}>
                              {msg.role === 'user' ? (
                                msg.text
                              ) : (
                                <div className="prose prose-sm dark:prose-invert max-w-none prose-p:leading-relaxed prose-pre:bg-slate-100 dark:prose-pre:bg-slate-900 prose-pre:text-slate-800 dark:prose-pre:text-slate-200">
                                  <Markdown>{msg.text}</Markdown>
                                </div>
                              )}
                            </div>
                            <span className={`text-[9px] text-slate-400 dark:text-slate-500 ${msg.role === 'user' ? 'text-right mr-1' : 'text-left ml-1'}`}>
                              {formatTime(msg.timestamp)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
                )}
                
                {/* Typing Indicator */}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="flex gap-2 max-w-[85%] flex-row">
                      <div className="w-6 h-6 shrink-0 rounded-full flex items-center justify-center mt-1 bg-slate-100 dark:bg-slate-800 overflow-hidden p-0.5">
                        <img src="/image/logo.png" alt="Bot" className="w-full h-full object-contain" />
                      </div>
                      <div className="px-4 py-3 rounded-2xl text-sm bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-100 dark:border-slate-700 rounded-tl-none shadow-sm flex items-center gap-1">
                        <motion.div
                          animate={{ y: [0, -5, 0] }}
                          transition={{ repeat: Infinity, duration: 0.6, delay: 0 }}
                          className="w-1.5 h-1.5 bg-slate-400 rounded-full"
                        />
                        <motion.div
                          animate={{ y: [0, -5, 0] }}
                          transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }}
                          className="w-1.5 h-1.5 bg-slate-400 rounded-full"
                        />
                        <motion.div
                          animate={{ y: [0, -5, 0] }}
                          transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }}
                          className="w-1.5 h-1.5 bg-slate-400 rounded-full"
                        />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="p-3 md:p-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 shrink-0">
                <div className="relative flex items-end gap-2 bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-1.5 border border-slate-200/60 dark:border-slate-700/50 shadow-sm transition-all duration-300">
                  <textarea
                    ref={textareaRef}
                    value={input}
                    onChange={handleInput}
                    onKeyDown={handleKeyDown}
                    placeholder="Tanyakan Sesuatu ... "
                    className="flex-1 max-h-[120px] min-h-[40px] bg-transparent border-none focus:outline-none focus:ring-0 rounded-xl px-3 py-2.5 text-sm resize-none text-slate-700 dark:text-slate-200 placeholder:text-slate-400"
                    rows={1}
                  />
                  <button
                    onClick={handleSend}
                    disabled={!input.trim() || isLoading}
                    className="w-10 h-10 shrink-0 rounded-xl bg-primary-600 text-white flex items-center justify-center hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-sm"
                  >
                    <Send className="w-4 h-4 ml-0.5" />
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
