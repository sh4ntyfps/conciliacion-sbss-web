import { useState, useRef, useEffect } from 'react';
import { chatbotApi } from '../../api/axios';
import { MessagesSquare, Send, X, Bot, User } from 'lucide-react';

export default function ChatbotWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<{ from: string; text: string }[]>([
    { from: 'bot', text: '¡Hola! Soy el asistente virtual SBSS. ¿En qué puedo ayudarte?' },
  ]);
  const [question, setQuestion] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const ask = async () => {
    if (!question.trim()) return;
    const q = question;
    setQuestion('');
    setMessages(prev => [...prev, { from: 'user', text: q }]);
    try {
      const res = await chatbotApi.ask(q);
      setMessages(prev => [...prev, { from: 'bot', text: res.data.answer }]);
    } catch {
      setMessages(prev => [...prev, { from: 'bot', text: 'Error al conectar con el asistente.' }]);
    }
  };

  return (
    <>
      {open && (
        <div className="chatbot-widget">
          <div className="chatbot-widget-header">
            <h3><Bot size={18} style={{ marginRight: 6, verticalAlign: 'middle' }} /> Asistente SBSS</h3>
            <button className="chatbot-close-btn" onClick={() => setOpen(false)}>
              <X size={18} />
            </button>
          </div>
          <div className="chat-messages">
            {messages.map((m, i) => (
              <div key={i} className={`chat-msg ${m.from === 'user' ? 'user' : 'bot'}`}>
                {m.from === 'bot' && <Bot size={20} style={{ color: 'var(--primary)', flexShrink: 0 }} />}
                {m.from === 'user' && <User size={20} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />}
                <div className="chat-bubble">{m.text}</div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          <div className="chat-input">
            <input
              type="text"
              placeholder="Escribe tu pregunta..."
              value={question}
              onChange={e => setQuestion(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && ask()}
            />
            <button className="btn btn-primary btn-sm" onClick={ask}><Send size={16} /></button>
          </div>
        </div>
      )}
      <button className="chatbot-widget-btn" onClick={() => setOpen(!open)}>
        {open ? <X size={24} /> : <MessagesSquare size={24} />}
      </button>
    </>
  );
}
