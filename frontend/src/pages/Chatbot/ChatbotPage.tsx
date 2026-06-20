import { useState } from 'react';
import { chatbotApi } from '../../api/axios';
import { MessagesSquare, Send } from 'lucide-react';

export default function ChatbotPage() {
  const [messages, setMessages] = useState<{ from: string; text: string }[]>([
    { from: 'bot', text: '¡Hola! Soy el asistente virtual SBSS. ¿En qué puedo ayudarte?' },
  ]);
  const [question, setQuestion] = useState('');

  const ask = async () => {
    if (!question.trim()) return;
    setMessages(prev => [...prev, { from: 'user', text: question }]);
    try {
      const res = await chatbotApi.ask(question);
      setMessages(prev => [...prev, { from: 'bot', text: res.data.answer }]);
    } catch {
      setMessages(prev => [...prev, { from: 'bot', text: 'Error al conectar con el asistente.' }]);
    }
    setQuestion('');
  };

  return (
    <div>
      <h1>Asistente Virtual</h1>
      <div className="chat-container">
        <div className="chat-messages">
          {messages.map((m, i) => (
            <div key={i} className={`chat-msg ${m.from === 'user' ? 'user' : 'bot'}`}>
              {m.from === 'bot' && <MessagesSquare size={16} />}
              <div className="chat-bubble">{m.text}</div>
            </div>
          ))}
        </div>
        <div className="chat-input">
          <input
            type="text"
            placeholder="Escribe tu pregunta..."
            value={question}
            onChange={e => setQuestion(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && ask()}
          />
          <button className="btn btn-primary" onClick={ask}><Send size={18} /></button>
        </div>
      </div>
    </div>
  );
}
