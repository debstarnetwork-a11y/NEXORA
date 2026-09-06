import React, { useState, useRef, useEffect } from 'react';
import { Send, Image as ImageIcon, Paperclip, Copy, RotateCcw, Trash2, PlusCircle, User, Bot, Loader2, Mic, MicOff, FileDown } from 'lucide-react';
import { jsPDF } from 'jspdf';
import { ChatMessage } from '../types';
import { useAppStore } from '../store';
import { useSpeech } from '../hooks/useSpeech';

export function AIResearch() {
  const [messages, setMessages] = useState<ChatMessage[]>([{
    id: '1',
    role: 'model',
    content: 'Hello! I am NEXORA, your AI research assistant. How can I help you today?',
    timestamp: Date.now()
  }]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { saveChat } = useAppStore();
  const { isListening, startListening, stopListening, isSupported } = useSpeech();

  const handleMicClick = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening((text) => {
        setInput(prev => prev + (prev ? ' ' : '') + text);
      });
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: userMessage.content })
      });

      const data = await response.json();
      
      if (response.ok) {
        const modelMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'model',
          content: data.text,
          timestamp: Date.now()
        };
        setMessages(prev => [...prev, modelMessage]);
      } else {
        throw new Error(data.error || 'Failed to generate response');
      }
    } catch (error: any) {
      console.error(error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        content: error.message || 'Sorry, I encountered an error. Please try again.',
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClear = () => {
    setMessages([{
      id: Date.now().toString(),
      role: 'model',
      content: 'Hello! I am NEXORA, your AI research assistant. How can I help you today?',
      timestamp: Date.now()
    }]);
  };

  const handleSave = () => {
    if (messages.length > 1) {
      saveChat({
        id: Date.now().toString(),
        title: messages[1]?.content.substring(0, 40) + '...',
        messages,
        timestamp: Date.now()
      });
      alert('Chat saved to Projects!');
    }
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    const margin = 15;
    let y = 20;
    const pageWidth = doc.internal.pageSize.width;
    const maxLineWidth = pageWidth - margin * 2;

    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('NEXORA - AI Research Chat Log', margin, y);
    y += 15;

    messages.forEach((msg) => {
      const role = msg.role === 'user' ? 'User' : 'NEXORA';
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      if (msg.role === 'user') {
        doc.setTextColor(88, 28, 135); // purple-900 rgb
      } else {
        doc.setTextColor(0, 0, 0); // black
      }
      doc.text(`${role}:`, margin, y);
      y += 7;

      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(51, 65, 85); // slate-700 rgb
      
      const lines = doc.splitTextToSize(msg.content, maxLineWidth);
      
      lines.forEach((line: string) => {
         if (y > doc.internal.pageSize.height - margin) {
           doc.addPage();
           y = margin + 10;
         }
         doc.text(line, margin, y);
         y += 6;
      });
      y += 8; // space between messages
    });

    doc.save(`NEXORA_Chat_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="h-full flex flex-col max-w-5xl mx-auto w-full p-4 sm:p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold text-purple-900 tracking-tight">AI Research</h2>
        <div className="flex gap-3">
          <button onClick={handleExportPDF} className="p-2.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-purple-900 transition-all shadow-sm" title="Export as PDF">
            <FileDown className="w-5 h-5" />
          </button>
          <button onClick={handleSave} className="p-2.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-purple-900 transition-all shadow-sm" title="Save Chat">
            <PlusCircle className="w-5 h-5" />
          </button>
          <button onClick={handleClear} className="p-2.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-red-600 transition-all shadow-sm" title="Clear Chat">
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                msg.role === 'user' 
                  ? 'bg-purple-900 text-amber-400' 
                  : 'bg-slate-200 text-slate-600'
              }`}>
                {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>
              
              <div className={`max-w-[80%] flex flex-col gap-2 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                <div className={`px-5 py-3.5 rounded-2xl text-[15px] leading-relaxed shadow-sm border ${
                  msg.role === 'user'
                    ? 'bg-purple-900 text-white rounded-tr-none border-purple-900 shadow-md'
                    : 'bg-white text-slate-800 rounded-tl-none border-slate-200'
                }`}>
                  {msg.content}
                </div>
                
                {msg.role === 'model' && (
                  <div className="flex items-center gap-2 px-2">
                    <button 
                      onClick={() => copyToClipboard(msg.content)}
                      className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-50 transition-colors"
                      title="Copy response"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button 
                      className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-50 transition-colors"
                      title="Regenerate"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="px-5 py-3.5 rounded-2xl bg-slate-50 rounded-tl-none border border-slate-200 flex items-center gap-2 text-slate-500 shadow-sm">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm font-medium">NEXORA is thinking...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-6 bg-slate-50/50 border-t border-slate-100">
          <div className="max-w-4xl mx-auto flex items-end gap-3 bg-white p-2 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-200 focus-within:border-purple-300 focus-within:ring-4 focus-within:ring-purple-900/10 transition-all">
            <button className="p-3 text-slate-400 hover:text-purple-900 rounded-xl hover:bg-slate-50 transition-colors shrink-0">
              <Paperclip className="w-5 h-5" />
            </button>
            <button className="p-3 text-slate-400 hover:text-purple-900 rounded-xl hover:bg-slate-50 transition-colors shrink-0">
              <ImageIcon className="w-5 h-5" />
            </button>
            {isSupported && (
              <button 
                onClick={handleMicClick}
                className={`p-3 rounded-xl transition-colors shrink-0 ${isListening ? 'text-red-500 bg-red-50 hover:bg-red-100' : 'text-slate-400 hover:text-purple-900 hover:bg-slate-50'}`}
                title="Dictate query"
              >
                {isListening ? <MicOff className="w-5 h-5 animate-pulse" /> : <Mic className="w-5 h-5" />}
              </button>
            )}
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask NEXORA anything..."
              className="flex-1 max-h-32 min-h-[44px] bg-transparent border-none focus:ring-0 resize-none py-3 px-2 text-slate-700 placeholder:text-slate-400 text-[15px]"
              rows={1}
            />
            <button 
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="px-5 py-3 bg-purple-900 text-amber-500 rounded-xl hover:bg-purple-800 disabled:opacity-50 disabled:hover:bg-purple-900 transition-colors shrink-0 shadow-sm font-semibold flex items-center gap-2"
            >
              Send <Send className="w-4 h-4" />
            </button>
          </div>
          <div className="text-center mt-4 text-xs font-medium text-slate-400">
            NEXORA can make mistakes. Verify important information.
          </div>
        </div>
      </div>
    </div>
  );
}
