import React, { useState } from 'react';
import {
  HelpCircle,
  Phone,
  MessageSquare,
  ChevronDown,
  Send,
  Headphones,
  CheckCircle2,
} from 'lucide-react';
import { FAQ_DATA } from '../../data/mockData';

export const HelpSupportScreen: React.FC = () => {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<
    { sender: 'user' | 'agent'; text: string; time: string }[]
  >([
    {
      sender: 'agent',
      text: 'Hello! Welcome to G1 Mart Nellore Support. How can we assist your grocery order today?',
      time: 'Just now',
    },
  ]);
  const [chatInput, setChatInput] = useState('');

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userText = chatInput.trim();
    setChatMessages((prev) => [
      ...prev,
      { sender: 'user', text: userText, time: 'Just now' },
    ]);
    setChatInput('');

    // Simulated reply
    setTimeout(() => {
      setChatMessages((prev) => [
        ...prev,
        {
          sender: 'agent',
          text: `Thank you for contacting us regarding "${userText}". Our Nellore support team is looking into this and our rider will ensure your order is handled smoothly.`,
          time: 'Just now',
        },
      ]);
    }, 800);
  };

  return (
    <div className="flex-1 pb-24 p-3.5 space-y-4 max-w-3xl mx-auto w-full">
      {/* Contact Channels Card */}
      <div className="bg-gradient-to-r from-[#2E7D32] to-[#1b5e20] text-white rounded-2xl p-4 shadow-md space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
            <Headphones className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-base font-extrabold">24/7 G1 Mart Helpdesk</h2>
            <p className="text-xs text-white/80">
              Nellore delivery &amp; product support
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-1">
          <a
            href="tel:18004194100"
            className="p-2.5 rounded-xl bg-white text-[#212121] hover:bg-stone-100 flex items-center justify-center gap-2 text-xs font-bold shadow-xs active:scale-95 transition-all"
          >
            <Phone className="w-4 h-4 text-[#2E7D32]" />
            <span>Call Helpline</span>
          </a>

          <button
            type="button"
            onClick={() => setChatOpen(true)}
            className="p-2.5 rounded-xl bg-white text-[#212121] hover:bg-stone-100 flex items-center justify-center gap-2 text-xs font-bold shadow-xs active:scale-95 transition-all"
          >
            <MessageSquare className="w-4 h-4 text-[#FF9800]" />
            <span>Live Chat</span>
          </button>
        </div>
      </div>

      {/* Frequently Asked Questions */}
      <div className="bg-white rounded-2xl border border-stone-200/80 p-4 shadow-2xs space-y-3">
        <h3 className="text-xs font-bold text-stone-800 uppercase tracking-wider">
          Frequently Asked Questions
        </h3>

        <div className="space-y-2 divide-y divide-stone-100">
          {FAQ_DATA.map((faq, index) => {
            const isOpen = openFaqIndex === index;
            return (
              <div key={index} className="pt-2">
                <button
                  type="button"
                  onClick={() => toggleFaq(index)}
                  className="w-full text-left py-1.5 flex items-center justify-between gap-2 text-xs font-bold text-[#212121] hover:text-[#2E7D32] transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-stone-400 shrink-0 transition-transform ${
                      isOpen ? 'rotate-180 text-[#2E7D32]' : ''
                    }`}
                  />
                </button>

                {isOpen && (
                  <p className="text-xs text-stone-600 font-normal leading-relaxed mt-1 pb-2 pl-1 border-l-2 border-[#2E7D32]">
                    {faq.a}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Live Chat Modal Drawer */}
      {chatOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-end justify-center p-0"
          onClick={() => setChatOpen(false)}
        >
          <div
            className="w-full max-w-md bg-white rounded-t-3xl shadow-2xl h-[75vh] flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Chat Header */}
            <div className="p-3.5 bg-[#2E7D32] text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-bold text-xs">
                  G1
                </div>
                <div>
                  <h4 className="text-xs font-bold leading-tight">
                    G1 Mart Support Executive
                  </h4>
                  <span className="text-[10px] text-emerald-200">
                    Online · Nellore Central Hub
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setChatOpen(false)}
                className="text-white/80 hover:text-white text-xs font-bold px-2 py-1"
              >
                Close
              </button>
            </div>

            {/* Chat Body */}
            <div className="flex-1 p-3.5 space-y-3 overflow-y-auto bg-stone-50">
              {chatMessages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex flex-col ${
                    msg.sender === 'user' ? 'items-end' : 'items-start'
                  }`}
                >
                  <div
                    className={`p-3 rounded-2xl max-w-[80%] text-xs leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-[#2E7D32] text-white rounded-tr-none'
                        : 'bg-white border border-stone-200 text-stone-800 rounded-tl-none shadow-2xs'
                    }`}
                  >
                    {msg.text}
                  </div>
                  <span className="text-[9px] text-stone-400 mt-1 px-1">
                    {msg.time}
                  </span>
                </div>
              ))}
            </div>

            {/* Chat Input */}
            <form
              onSubmit={handleSendMessage}
              className="p-3 bg-white border-t border-stone-200 flex items-center gap-2"
            >
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 h-10 px-3 rounded-xl border border-stone-300 text-xs outline-hidden focus:border-[#2E7D32]"
              />
              <button
                type="submit"
                className="w-10 h-10 rounded-xl bg-[#2E7D32] text-white flex items-center justify-center hover:bg-[#1b5e20] active:scale-95 transition-all shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
