import { useState, useEffect } from 'react';

const MODELS = [
  { id: 'anthropic/claude-sonnet-4', label: 'Claude Sonnet 4' },
  { id: 'google/gemini-2.5-flash', label: 'Gemini 2.5 Flash' },
  { id: 'openai/gpt-4o-mini', label: 'GPT-4o Mini' },
];

export default function ApiKeyInput({ apiKey, setApiKey, model, setModel }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('openrouter_api_key');
    if (saved) setApiKey(saved);
    const savedModel = localStorage.getItem('openrouter_model');
    if (savedModel) setModel(savedModel);
  }, [setApiKey, setModel]);

  const handleKeyChange = (e) => {
    const val = e.target.value;
    setApiKey(val);
    localStorage.setItem('openrouter_api_key', val);
  };

  const handleModelChange = (e) => {
    const val = e.target.value;
    setModel(val);
    localStorage.setItem('openrouter_model', val);
  };

  return (
    <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-end">
      <div className="flex-1 min-w-0 w-full">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          OpenRouter API Key
        </label>
        <div className="relative">
          <input
            type={visible ? 'text' : 'password'}
            value={apiKey}
            onChange={handleKeyChange}
            placeholder="sk-or-..."
            className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-10 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
          <button
            type="button"
            onClick={() => setVisible(!visible)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs"
          >
            {visible ? 'Hide' : 'Show'}
          </button>
        </div>
      </div>
      <div className="w-full sm:w-56">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          AI Model
        </label>
        <select
          value={model}
          onChange={handleModelChange}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
        >
          {MODELS.map((m) => (
            <option key={m.id} value={m.id}>
              {m.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
