"use client";

interface ChatMessage {
  id: number | string;
  user: string;
  message: string;
  time: string;
  isBot?: boolean;
}

interface LiveChatProps {
  messages: ChatMessage[];
}

export default function LiveChat({ messages }: LiveChatProps) {
  return (
    <div className="bg-surface-container rounded-xl border border-outline-variant overflow-hidden flex flex-col h-80">
      <div className="px-4 py-3 border-b border-outline-variant flex items-center gap-2">
        <span className="material-symbols-outlined text-tertiary text-xl">chat</span>
        <h3 className="font-label-bold text-sm text-on-surface uppercase tracking-wider">Live Chat</h3>
      </div>
      <div className="flex-grow overflow-y-auto p-3 space-y-3 flex flex-col-reverse">
        <div className="space-y-3">
          {messages.map((msg) => (
            <div key={msg.id} className={`${msg.isBot ? "bg-surface-variant/50" : ""} rounded-lg p-2`}>
              <div className="flex items-center gap-2 mb-1">
                <span className={`font-label-bold text-[11px] ${msg.isBot ? "text-tertiary" : "text-on-surface-variant"}`}>
                  {msg.isBot && <span className="material-symbols-outlined text-[12px] mr-0.5 align-middle">smart_toy</span>}
                  {msg.user}
                </span>
                <span className="text-[10px] text-outline">{msg.time}</span>
              </div>
              <p className="font-body-md text-sm text-on-surface">{msg.message}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="p-3 border-t border-outline-variant">
        <div className="flex gap-2">
          <input
            className="flex-grow bg-surface-container-highest border border-outline-variant rounded-lg px-3 py-2 text-sm text-on-surface placeholder-on-surface-variant/50 focus:outline-none focus:ring-1 focus:ring-tertiary"
            placeholder="Type a message..."
          />
          <button className="bg-secondary text-on-secondary p-2 rounded-lg hover:bg-secondary-fixed transition-colors">
            <span className="material-symbols-outlined text-[18px]">send</span>
          </button>
        </div>
      </div>
    </div>
  );
}
