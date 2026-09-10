import React, { useState, useRef, useEffect } from 'react';
import rahiLogo from '../../assets/images/rahi_hotel_logo_1789045500171.jpg';
import {
  Sparkles,
  X,
  Send,
  Bot,
  User,
  Utensils,
  Calendar,
  Clock,
  Compass,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  ShieldAlert,
  ChevronDown,
  Maximize2,
  Minimize2,
  Building,
  RotateCcw,
  CheckCircle2,
} from 'lucide-react';
import { useHotel } from '../../context/HotelContext';
import { ResortAIAction, ResortAIMode } from '../../types';
import { ResortAIActionCard } from './resort-ai/ResortAIActions';

interface ChatMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
  action?: ResortAIAction | null;
}

export const ResortAIWidget: React.FC = () => {
  const {
    activeGuestBooking,
    activeGuestRoom,
    rooms,
    foodOrders,
    complaints,
    setGuestTab,
    activeRole,
  } = useHotel();

  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [mode, setMode] = useState<ResortAIMode>('guest');
  const [language, setLanguage] = useState<string>('English');
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speechEnabled, setSpeechEnabled] = useState(false);
  const [emergencyModalOpen, setEmergencyModalOpen] = useState(false);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm-1',
      sender: 'ai',
      text: `👋 Namaste! I am ARIA, your 24/7 luxury concierge at Hotel Rahi. How may I assist you with your stay today?`,
      timestamp: 'Just now',
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen, loading]);

  // Speech Recognition setup (Web Speech API)
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = language === 'Hindi' ? 'hi-IN' : 'en-IN';

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = () => setIsListening(false);
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setInput(transcript);
          handleSendMessage(transcript);
        }
      };
      recognitionRef.current = recognition;
    }
  }, [language]);

  const toggleVoiceInput = () => {
    if (!recognitionRef.current) {
      alert('Voice speech recognition is not supported in this browser. Please type your message.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      try {
        recognitionRef.current.start();
      } catch (err) {
        console.error('Speech recognition error:', err);
      }
    }
  };

  // Text-to-speech
  const speakText = (text: string) => {
    if (!speechEnabled || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    window.speechSynthesis.speak(utterance);
  };

  // Live Context Computation
  const occupiedRooms = rooms.filter((r) => r.status === 'occupied').length;
  const occupancyRate = Math.round((occupiedRooms / (rooms.length || 1)) * 100);
  const todayFoodSales = foodOrders.reduce((sum, o) => sum + o.total, 0);
  const openComplaintsCount = complaints.filter((c) => c.status !== 'Resolved').length;
  const pendingOrdersCount = foodOrders.filter((o) => o.status !== 'Delivered' && o.status !== 'Cancelled').length;

  const guestPrompts = [
    'What games are available?',
    'Which activities are free?',
    'Is badminton available?',
    'How much does badminton cost?',
    'Do you have any indoor games?',
    'What is the cheapest activity?',
    'Add 2 paneer butter masala and 4 naan',
    'I need two towels',
    'The AC in my room is not working',
    'Where is the swimming pool?',
    'What is my checkout date?',
  ];

  const managerPrompts = [
    'How many rooms are occupied today?',
    'What were today total food sales?',
    'Show me unresolved complaints',
    'Which food item sold the most this week?',
  ];

  const activePrompts = mode === 'guest' ? guestPrompts : managerPrompts;

  const handleSendMessage = async (userText: string) => {
    if (!userText.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/resort-ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userText,
          history: messages.slice(-6).map((m) => ({
            sender: m.sender,
            text: m.text,
          })),
          mode: mode,
          language: language,
          guestContext: {
            roomNumber: activeGuestRoom,
            guestName: activeGuestBooking?.guestName || 'Rohit Bhure',
            checkIn: 'Sept 2, 2026',
            checkOut: 'Sept 5, 2026',
            foodOrdersCount: foodOrders.length,
          },
          managerContext: {
            totalRooms: rooms.length,
            occupiedRooms: occupiedRooms,
            occupancyRate: occupancyRate,
            todayFoodSales: todayFoodSales,
            openComplaints: openComplaintsCount,
            pendingFoodOrders: pendingOrdersCount,
          },
        }),
      });

      if (!response.ok) {
        throw new Error('API unavailable');
      }

      const data = await response.json();
      const replyText = data.reply || 'Certainly! I am here to assist you.';

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        action: data.action || null,
      };

      setMessages((prev) => [...prev, aiMsg]);
      speakText(replyText);
    } catch (err) {
      console.error('Chat error:', err);
      const fallbackText = `At Hotel Rahi, we are delighted to assist your stay in Room ${activeGuestRoom}. Dial Ext. 9 for front desk concierge.`;
      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: fallbackText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleActionComplete = (resultMsg: string) => {
    const confirmationMsg: ChatMessage = {
      id: `ai-conf-${Date.now()}`,
      sender: 'ai',
      text: resultMsg,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages((prev) => [...prev, confirmationMsg]);
    speakText(resultMsg);
  };

  const resetChat = () => {
    setMessages([
      {
        id: 'm-1',
        sender: 'ai',
        text:
          mode === 'guest'
            ? `👋 Hi! I'm ARIA, your 24/7 digital concierge for Room #${activeGuestRoom}. How can I assist you today?`
            : `👩‍💼 ARIA Operations Co-Pilot Online. Ask me about real-time occupancy, food sales, open maintenance tickets, or staff assignments.`,
        timestamp: 'Just now',
      },
    ]);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Floating Launcher Button */}
      {!isOpen && (
        <button
          id="open-resort-ai-chat-btn"
          onClick={() => setIsOpen(true)}
          className="flex items-center space-x-3 px-4 py-3 bg-[#5C5E4E] hover:bg-[#47493D] text-[#FDFCF8] rounded-full shadow-2xl hover:scale-105 transition-all border border-[#D4AF37]/50 group"
        >
          <div className="w-8 h-8 rounded-full overflow-hidden border border-[#D4AF37] bg-[#1C1C1A] shrink-0 shadow-xs">
            <img
              src={rahiLogo}
              alt="Rahi Hotel"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="text-left">
            <span className="block text-xs font-serif font-bold tracking-wide flex items-center space-x-1">
              <span>ARIA</span>
              <Sparkles className="w-3 h-3 text-[#D4AF37] inline" />
            </span>
            <span className="block text-[10px] text-[#E5E1D5] font-sans">
              {mode === 'guest' ? 'Virtual Concierge' : 'Manager Co-Pilot'}
            </span>
          </div>
          <span className="w-2.5 h-2.5 rounded-full bg-[#D4AF37] animate-pulse ml-1" />
        </button>
      )}

      {/* Main Interactive Chat Window */}
      {isOpen && (
        <div
          className={`bg-[#FDFCF8] rounded-3xl shadow-2xl border border-[#E5E1D5] flex flex-col overflow-hidden transition-all duration-300 ${
            isExpanded
              ? 'fixed inset-4 sm:inset-10 z-50 w-auto h-auto max-w-5xl mx-auto'
              : 'w-[410px] max-w-[calc(100vw-2rem)] h-[580px]'
          }`}
        >
          {/* Header */}
          <div className="bg-[#5C5E4E] text-[#FDFCF8] px-4 py-3 flex flex-col gap-2.5 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-full overflow-hidden border border-[#D4AF37] bg-[#1C1C1A] shrink-0 shadow-sm">
                  <img
                    src={rahiLogo}
                    alt="Rahi Hotel Logo"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h4 className="font-serif font-bold text-xs text-white">ARIA</h4>
                    <span className="text-[9px] px-1.5 py-0.5 bg-[#D4AF37]/20 text-[#D4AF37] rounded-md font-semibold border border-[#D4AF37]/30">
                      Gemini 3.8
                    </span>
                  </div>
                  <p className="text-[10px] text-[#E5E1D5]">
                    {mode === 'guest' ? `Hotel Rahi • Room #${activeGuestRoom}` : 'Hotel Rahi • Operations AI Hub'}
                  </p>
                </div>
              </div>

              {/* Header Right Actions */}
              <div className="flex items-center space-x-1 text-[#E5E1D5]">
                {/* Emergency SOS trigger */}
                <button
                  id="resort-ai-sos-btn"
                  onClick={() => setEmergencyModalOpen(true)}
                  title="Resort Emergency SOS"
                  className="p-1.5 hover:text-white bg-rose-700/80 hover:bg-rose-700 text-white rounded-lg transition-colors flex items-center space-x-1 text-[10px] font-bold px-2 mr-1"
                >
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>SOS</span>
                </button>

                {/* Speech Toggle */}
                <button
                  onClick={() => setSpeechEnabled(!speechEnabled)}
                  title={speechEnabled ? 'Mute AI speech' : 'Enable voice read-aloud'}
                  className={`p-1.5 rounded-lg transition-colors ${
                    speechEnabled ? 'bg-[#D4AF37] text-[#1C1C1A]' : 'hover:bg-[#47493D]'
                  }`}
                >
                  {speechEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                </button>

                {/* Reset Chat */}
                <button
                  onClick={resetChat}
                  title="Restart conversation"
                  className="p-1.5 hover:bg-[#47493D] hover:text-white rounded-lg transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>

                {/* Expand Window */}
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  title={isExpanded ? 'Collapse' : 'Expand window'}
                  className="p-1.5 hover:bg-[#47493D] hover:text-white rounded-lg transition-colors"
                >
                  {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </button>

                {/* Close Button */}
                <button
                  id="close-resort-ai-chat-btn"
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 hover:bg-[#47493D] hover:text-white rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Mode & Language Bar */}
            <div className="flex items-center justify-between pt-1 border-t border-white/10 text-[11px]">
              {/* Role Switcher */}
              <div className="flex items-center bg-[#47493D] rounded-lg p-0.5 border border-white/10">
                <button
                  id="resort-ai-mode-guest"
                  onClick={() => {
                    setMode('guest');
                    resetChat();
                  }}
                  className={`px-2.5 py-0.5 rounded-md font-medium transition-colors ${
                    mode === 'guest'
                      ? 'bg-[#5C5E4E] text-[#D4AF37] shadow-xs'
                      : 'text-[#E5E1D5] hover:text-white'
                  }`}
                >
                  Guest Concierge
                </button>
                <button
                  id="resort-ai-mode-manager"
                  onClick={() => {
                    setMode('manager');
                    resetChat();
                  }}
                  className={`px-2.5 py-0.5 rounded-md font-medium transition-colors ${
                    mode === 'manager'
                      ? 'bg-[#5C5E4E] text-[#D4AF37] shadow-xs'
                      : 'text-[#E5E1D5] hover:text-white'
                  }`}
                >
                  Staff Manager
                </button>
              </div>

              {/* Language Selector */}
              <div className="flex items-center space-x-1 text-[10px]">
                <span className="text-[#D4AF37]">🌐</span>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="bg-[#47493D] text-[#FDFCF8] px-1.5 py-0.5 rounded-md border border-white/10 focus:outline-hidden text-[10px]"
                >
                  <option value="English">English</option>
                  <option value="Hindi">हिन्दी (Hindi)</option>
                  <option value="Marathi">मराठी (Marathi)</option>
                  <option value="Kannada">ಕನ್ನಡ (Kannada)</option>
                  <option value="Telugu">తెలుగు (Telugu)</option>
                  <option value="Tamil">தமிழ் (Tamil)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Quick Prompts Bar */}
          <div className="bg-[#F5F2EA] px-3 py-2 border-b border-[#E5E1D5] flex items-center gap-1.5 overflow-x-auto text-[10px] scrollbar-none">
            {activePrompts.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(q)}
                className="whitespace-nowrap px-2.5 py-1 rounded-lg bg-white hover:bg-[#F9F8F3] border border-[#E5E1D5] text-[#33332D] transition-colors shadow-2xs"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Messages Thread */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 text-xs">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex items-start space-x-2 ${
                  m.sender === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {m.sender === 'ai' && (
                  <div className="w-6 h-6 rounded-full bg-[#F5F2EA] text-[#5C5E4E] border border-[#E5E1D5] flex items-center justify-center flex-shrink-0 mt-0.5 shadow-2xs">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                )}
                <div
                  className={`p-3 rounded-2xl max-w-[85%] leading-relaxed ${
                    m.sender === 'user'
                      ? 'bg-[#5C5E4E] text-white rounded-tr-xs shadow-xs'
                      : 'bg-[#F5F2EA] text-[#33332D] rounded-tl-xs border border-[#E5E1D5]'
                  }`}
                >
                  <p className="whitespace-pre-line">{m.text}</p>

                  {/* Render Structured Action Card if present */}
                  {m.action && (
                    <ResortAIActionCard
                      action={m.action}
                      onActionComplete={handleActionComplete}
                    />
                  )}

                  <span
                    className={`block text-[9px] mt-1.5 ${
                      m.sender === 'user' ? 'text-[#E5E1D5] text-right' : 'text-[#8A8E71]'
                    }`}
                  >
                    {m.timestamp}
                  </span>
                </div>

                {m.sender === 'user' && (
                  <div className="w-6 h-6 rounded-full bg-[#1C1C1A] text-white flex items-center justify-center flex-shrink-0 mt-0.5 shadow-2xs">
                    <User className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex items-center space-x-2 text-[#8A8E71]">
                <div className="w-6 h-6 rounded-full bg-[#F5F2EA] text-[#5C5E4E] flex items-center justify-center flex-shrink-0 border border-[#E5E1D5]">
                  <Bot className="w-3.5 h-3.5" />
                </div>
                <div className="bg-[#F5F2EA] p-2.5 rounded-2xl text-[11px] italic text-[#5C5E4E] border border-[#E5E1D5] flex items-center space-x-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#5C5E4E] animate-bounce" />
                  <span className="w-1.5 h-1.5 rounded-full bg-[#5C5E4E] animate-bounce [animation-delay:0.2s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-[#5C5E4E] animate-bounce [animation-delay:0.4s]" />
                  <span className="ml-1 text-[10px]">ARIA thinking...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Voice Listening Bar */}
          {isListening && (
            <div className="bg-rose-50 border-t border-rose-200 px-4 py-2 flex items-center justify-between text-xs text-rose-700 animate-pulse">
              <div className="flex items-center space-x-2">
                <Mic className="w-4 h-4 text-rose-600 animate-bounce" />
                <span className="font-semibold">Listening... Speak now</span>
              </div>
              <button
                onClick={() => recognitionRef.current?.stop()}
                className="text-[10px] underline font-medium"
              >
                Stop
              </button>
            </div>
          )}

          {/* Input Field */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage(input);
            }}
            className="p-3 border-t border-[#E5E1D5] bg-[#FDFCF8] flex items-center space-x-2"
          >
            {/* Mic Button */}
            <button
              type="button"
              id="resort-ai-mic-btn"
              onClick={toggleVoiceInput}
              title={isListening ? 'Stop listening' : 'Start voice input'}
              className={`p-2 rounded-xl transition-all ${
                isListening
                  ? 'bg-rose-600 text-white animate-pulse'
                  : 'bg-[#F5F2EA] hover:bg-[#E5E1D5] text-[#5C5E4E]'
              }`}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            <input
              type="text"
              id="resort-ai-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                mode === 'guest'
                  ? 'Ask about rooms, food, housekeeping, complaints, directions...'
                  : 'Ask about occupancy, food sales, open complaints...'
              }
              className="flex-1 px-3 py-2 bg-[#F9F8F3] border border-[#E5E1D5] rounded-xl text-xs text-[#33332D] placeholder-[#8A8E71]/70 focus:outline-hidden focus:border-[#5C5E4E]"
            />

            <button
              type="submit"
              id="resort-ai-send-btn"
              disabled={!input.trim() || loading}
              className="p-2 bg-[#5C5E4E] hover:bg-[#47493D] disabled:opacity-50 text-white rounded-xl transition-colors shadow-2xs"
            >
              <Send className="w-4 h-4 text-[#D4AF37]" />
            </button>
          </form>
        </div>
      )}

      {/* Emergency Modal */}
      {emergencyModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 border-2 border-rose-500 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-rose-600">
                <ShieldAlert className="w-6 h-6" />
                <h3 className="font-serif font-bold text-lg text-rose-950">Resort Emergency Support</h3>
              </div>
              <button
                onClick={() => setEmergencyModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-neutral-600">
              Immediate 24/7 emergency response for Hotel Rahi guests and staff. Your current location:
              <strong className="text-neutral-900 block mt-0.5">Room #{activeGuestRoom}</strong>
            </p>

            <div className="space-y-2.5">
              <a
                href="tel:9"
                className="p-3 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-2xl flex items-center justify-between transition-colors"
              >
                <div>
                  <h5 className="font-bold text-xs text-rose-950">Reception & Manager-on-Duty</h5>
                  <p className="text-[11px] text-rose-700">Immediate front desk dispatch</p>
                </div>
                <span className="px-3 py-1 bg-rose-600 text-white rounded-xl text-xs font-bold shadow-2xs">
                  Call Ext. 9
                </span>
              </a>

              <a
                href="tel:911"
                className="p-3 bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 rounded-2xl flex items-center justify-between transition-colors"
              >
                <div>
                  <h5 className="font-bold text-xs text-neutral-900">Resort Security & Lifeguard</h5>
                  <p className="text-[11px] text-neutral-600">Perimeter & beach patrol</p>
                </div>
                <span className="px-3 py-1 bg-neutral-800 text-white rounded-xl text-xs font-bold shadow-2xs">
                  Call Ext. 911
                </span>
              </a>

              <a
                href="tel:108"
                className="p-3 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-2xl flex items-center justify-between transition-colors"
              >
                <div>
                  <h5 className="font-bold text-xs text-emerald-950">Medical Doctor on Call</h5>
                  <p className="text-[11px] text-emerald-700">First-aid, nurse, hospital transfer</p>
                </div>
                <span className="px-3 py-1 bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-2xs">
                  Call Ext. 108
                </span>
              </a>
            </div>

            <button
              onClick={() => {
                setEmergencyModalOpen(false);
                handleSendMessage('EMERGENCY: I need immediate medical assistance for my room!');
              }}
              className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-colors shadow-md"
            >
              Alert Emergency Team via Chatbot Now
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
