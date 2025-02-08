'use client';

import { useEffect, useRef } from 'react';

interface ChatMessage {
  role: string;
  content: string;
  model?: string | null;
}

interface ChatWindowProps {
  messages: ChatMessage[];
  loading?: boolean;
  error?: string | null;
}

// Компонент кнопки копирования
const CopyButton = ({ text }: { text: string }) => {
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
      title="Копировать текст"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-gray-500 dark:text-gray-400"
      >
        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
      </svg>
    </button>
  );
};

// Компонент сообщения пользователя
const UserMessage = ({ content }: { content: string }) => (
  <div className="flex justify-end mb-4">
    <div className="inline-block max-w-[80%] p-4 rounded-lg bg-blue-500 text-white group">
      <div className="flex items-center justify-between mb-1">
        <div className="text-sm">Вы</div>
        <CopyButton text={content} />
      </div>
      <div className="whitespace-pre-wrap break-words" data-testid="user-message">
        {content}
      </div>
    </div>
  </div>
);

// Компонент ответа ассистента
const AssistantResponse = ({ content, model }: { content: string; model?: string | null }) => (
  <div className="flex justify-start">
    <div className="inline-block max-w-[80%] p-4 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 group">
      <div className="whitespace-pre-wrap break-words" data-testid="provider-response">
        {content}
      </div>
      <div className="mt-2 flex items-center justify-between">
        {model && (
          <div className="text-xs opacity-70">
            Модель: {model}
          </div>
        )}
        <CopyButton text={content} />
      </div>
    </div>
  </div>
);

// Компонент сообщения
const MessageItem = ({ role, content, model }: ChatMessage) => (
  <div className="space-y-4">
    {role === 'user' ? (
      <UserMessage content={content} />
    ) : (
      <AssistantResponse 
        content={content} 
        model={model}
      />
    )}
  </div>
);

// Компонент загрузки
const LoadingIndicator = () => (
  <div className="flex justify-center items-center py-4">
    <div className="animate-pulse text-gray-500 dark:text-gray-400">
      Печатает...
    </div>
  </div>
);

// Компонент пустого состояния
const EmptyState = () => (
  <div className="text-center text-gray-500 dark:text-gray-400">
    Начните диалог, отправив сообщение
  </div>
);

// Компонент ошибки
const ErrorState = ({ error }: { error: string }) => (
  <div className="p-4 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-lg" data-testid="error-message">
    {error}
  </div>
);

// Компонент списка сообщений
const MessageList = ({ messages }: { messages: ChatMessage[] }) => (
  <div className="space-y-4">
    {messages.map((msg, index) => (
      <MessageItem 
        key={index}
        role={msg.role}
        content={msg.content}
        model={msg.model}
      />
    ))}
  </div>
);

export default function ChatWindow({ 
  messages, 
  loading = false,
  error = null 
}: ChatWindowProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && bottomRef.current?.scrollIntoView) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  return (
    <div className="flex-1 p-4 overflow-y-auto bg-gray-50 dark:bg-gray-900">
      {error ? (
        <ErrorState error={error} />
      ) : messages.length === 0 ? (
        <EmptyState />
      ) : (
        <MessageList messages={messages} />
      )}
      {loading && <LoadingIndicator />}
      <div ref={bottomRef} />
    </div>
  );
}
