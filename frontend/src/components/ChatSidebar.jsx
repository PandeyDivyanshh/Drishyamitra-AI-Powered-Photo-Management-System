import { useState, useRef, useEffect } from 'react';
import { sendChat } from '../api/client';
import { MessageCircle, X, Send, Sparkles, Bot, User } from 'lucide-react';

export default function ChatSidebar({ onSearchResults }) {
    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState([
        {
            role: 'ai',
            text: "Hey there! 👋 I'm Drishyamitra — your AI photo assistant. Ask me things like:\n\n• \"Find Ananya's photos\"\n• \"Show photos from January\"\n• \"How many photos do I have?\"",
        },
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const endRef = useRef(null);

    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, loading]);

    const handleSend = async () => {
        const text = input.trim();
        if (!text || loading) return;

        setMessages((prev) => [...prev, { role: 'user', text }]);
        setInput('');
        setLoading(true);

        try {
            const res = await sendChat(text);
            const data = res.data;
            setMessages((prev) => [...prev, { role: 'ai', text: data.response }]);

            if (data.photos?.length > 0 && onSearchResults) {
                onSearchResults(data.photos);
            }
        } catch (err) {
            setMessages((prev) => [
                ...prev,
                { role: 'ai', text: 'Sorry, something went wrong. Please try again.' },
            ]);
        }

        setLoading(false);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <>
            {/* Floating Toggle */}
            {!open && (
                <button
                    onClick={() => setOpen(true)}
                    className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 text-white shadow-xl shadow-primary-500/30 hover:shadow-primary-500/50 hover:scale-110 transition-all duration-300 flex items-center justify-center animate-bounce-soft"
                    id="chat-toggle"
                >
                    <MessageCircle className="w-6 h-6" />
                </button>
            )}

            {/* Chat Panel */}
            {open && (
                <div className="fixed bottom-6 right-6 z-40 w-96 h-[540px] bg-white rounded-3xl shadow-2xl border border-surface-100 flex flex-col overflow-hidden animate-slide-up">
                    {/* Header */}
                    <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-primary-500 to-primary-700 text-white">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
                                <Sparkles className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold">Drishyamitra AI</h3>
                                <p className="text-xs text-white/70">Smart photo search</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setOpen(false)}
                            className="p-1.5 rounded-lg hover:bg-white/20 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
                        {messages.map((msg, i) => (
                            <div
                                key={i}
                                className={`flex gap-2.5 animate-fade-in ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                {msg.role === 'ai' && (
                                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center flex-shrink-0 mt-1">
                                        <Bot className="w-3.5 h-3.5 text-white" />
                                    </div>
                                )}
                                <div
                                    className={`max-w-[75%] px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap
                    ${msg.role === 'user'
                                            ? 'chat-bubble-user text-white'
                                            : 'chat-bubble-ai text-surface-700'
                                        }`}
                                >
                                    {msg.text}
                                </div>
                                {msg.role === 'user' && (
                                    <div className="w-7 h-7 rounded-full bg-surface-200 flex items-center justify-center flex-shrink-0 mt-1">
                                        <User className="w-3.5 h-3.5 text-surface-500" />
                                    </div>
                                )}
                            </div>
                        ))}

                        {/* Typing Indicator */}
                        {loading && (
                            <div className="flex gap-2.5 animate-fade-in">
                                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center flex-shrink-0 mt-1">
                                    <Bot className="w-3.5 h-3.5 text-white" />
                                </div>
                                <div className="chat-bubble-ai px-5 py-3 flex items-center gap-1.5">
                                    <div className="w-2 h-2 rounded-full bg-primary-400 typing-dot" />
                                    <div className="w-2 h-2 rounded-full bg-primary-400 typing-dot" />
                                    <div className="w-2 h-2 rounded-full bg-primary-400 typing-dot" />
                                </div>
                            </div>
                        )}
                        <div ref={endRef} />
                    </div>

                    {/* Input */}
                    <div className="px-4 py-3 border-t border-surface-100">
                        <div className="flex items-center gap-2 bg-surface-50 rounded-2xl px-4 py-2">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Ask about your photos..."
                                className="flex-1 bg-transparent text-sm text-surface-700 placeholder-surface-400 outline-none"
                                id="chat-input"
                            />
                            <button
                                onClick={handleSend}
                                disabled={!input.trim() || loading}
                                className="p-2 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 text-white disabled:opacity-40 hover:shadow-lg hover:shadow-primary-500/25 transition-all"
                                id="chat-send"
                            >
                                <Send className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
