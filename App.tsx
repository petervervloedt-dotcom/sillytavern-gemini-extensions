
import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, 
  Image as ImageIcon, 
  BookOpen, 
  BrainCircuit, 
  Settings as SettingsIcon,
  Copy,
  Check,
  Upload,
  RefreshCw,
  Terminal,
  Cpu,
  Info
} from 'lucide-react';
import { ExtensionTab, LoreEntry, AppSettings } from './types';
import { analyzeRoleplayImage, generateLoreEntry, suggestPlotHooks } from './services/geminiService';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ExtensionTab>('vision');
  const [loading, setLoading] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);

  // Vision State
  const [visionMode, setVisionMode] = useState<'character' | 'setting'>('character');
  const [visionResult, setVisionResult] = useState('');
  const [previewImg, setPreviewImg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Lore State
  const [lorePrompt, setLorePrompt] = useState('');
  const [generatedLore, setGeneratedLore] = useState<LoreEntry | null>(null);

  // Brainstorm State
  const [historyInput, setHistoryInput] = useState('');
  const [hooks, setHooks] = useState<string[]>([]);

  // Settings State
  const [settings, setSettings] = useState<AppSettings>({
    visionModel: localStorage.getItem('visionModel') || 'gemini-3-flash-preview',
    loreModel: localStorage.getItem('loreModel') || 'gemini-3-flash-preview',
    brainstormModel: localStorage.getItem('brainstormModel') || 'gemini-3-pro-preview',
    chatModel: localStorage.getItem('chatModel') || 'gemini-3-flash-preview',
  });

  const updateSetting = (key: keyof AppSettings, value: string) => {
    localStorage.setItem(key, value);
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const triggerCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopyFeedback(id);
    setTimeout(() => setCopyFeedback(null), 2000);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const base64 = (ev.target?.result as string).split(',')[1];
      setPreviewImg(ev.target?.result as string);
      try {
        const result = await analyzeRoleplayImage(base64, file.type, visionMode);
        setVisionResult(result);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleLoreGen = async () => {
    if (!lorePrompt.trim()) return;
    setLoading(true);
    try {
      const lore = await generateLoreEntry(lorePrompt);
      setGeneratedLore(lore);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleBrainstorm = async () => {
    if (!historyInput.trim()) return;
    setLoading(true);
    try {
      const result = await suggestPlotHooks(historyInput);
      setHooks(result);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const ModelSelect = ({ label, value, onChange }: { label: string, value: string, onChange: (val: string) => void }) => (
    <div className="flex flex-col gap-2">
      <label className="text-[10px] uppercase font-bold text-neutral-500 tracking-widest">{label}</label>
      <select 
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-neutral-900 border border-neutral-800 rounded-lg p-2 text-xs focus:ring-1 focus:ring-indigo-600 outline-none"
      >
        <option value="gemini-3-flash-preview">Gemini 3 Flash (Fast)</option>
        <option value="gemini-3-pro-preview">Gemini 3 Pro (High Quality)</option>
        <option value="gemini-2.5-flash-lite-latest">Gemini 2.5 Flash Lite</option>
      </select>
    </div>
  );

  return (
    <div className="flex h-screen w-full bg-[#0d0d0d] text-neutral-300 font-sans overflow-hidden">
      <nav className="w-14 bg-[#141414] border-r border-neutral-800 flex flex-col items-center py-4 gap-4">
        <TabButton icon={<ImageIcon size={18} />} active={activeTab === 'vision'} onClick={() => setActiveTab('vision')} label="Vision" />
        <TabButton icon={<BookOpen size={18} />} active={activeTab === 'lore'} onClick={() => setActiveTab('lore')} label="Lore" />
        <TabButton icon={<BrainCircuit size={18} />} active={activeTab === 'brainstorm'} onClick={() => setActiveTab('brainstorm')} label="Hooks" />
        <div className="mt-auto">
          <TabButton icon={<SettingsIcon size={18} />} active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} label="Settings" />
        </div>
      </nav>

      <main className="flex-1 flex flex-col overflow-hidden bg-[#0d0d0d]">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {activeTab === 'vision' && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="flex gap-2">
                  <button 
                    onClick={() => setVisionMode('character')}
                    className={`flex-1 py-1.5 rounded-lg border text-[11px] font-bold uppercase tracking-wider transition-all ${visionMode === 'character' ? 'bg-indigo-600/20 border-indigo-500 text-indigo-400' : 'border-neutral-800 bg-neutral-900 text-neutral-500'}`}
                  >
                    Character
                  </button>
                  <button 
                    onClick={() => setVisionMode('setting')}
                    className={`flex-1 py-1.5 rounded-lg border text-[11px] font-bold uppercase tracking-wider transition-all ${visionMode === 'setting' ? 'bg-indigo-600/20 border-indigo-500 text-indigo-400' : 'border-neutral-800 bg-neutral-900 text-neutral-500'}`}
                  >
                    Setting
                  </button>
                </div>

                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full aspect-square bg-neutral-900 border border-dashed border-neutral-800 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-indigo-500/50 transition-colors overflow-hidden group"
                >
                  {previewImg ? (
                    <img src={previewImg} className="w-full h-full object-contain" alt="Preview" />
                  ) : (
                    <>
                      <Upload size={24} className="text-neutral-700 mb-2 group-hover:text-indigo-400 transition-colors" />
                      <p className="text-xs text-neutral-600 uppercase font-bold tracking-tighter">Upload Visual Reference</p>
                    </>
                  )}
                </div>
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />

              {visionResult && (
                <div className="bg-[#161616] border border-neutral-800 rounded-lg overflow-hidden">
                  <div className="p-2 bg-neutral-800/50 border-b border-neutral-800 flex justify-between items-center">
                    <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-tighter px-1">ST-Prose Description</span>
                    <button 
                      onClick={() => triggerCopy(visionResult, 'vision')}
                      className="p-1 hover:bg-neutral-700 rounded transition-colors text-neutral-400"
                    >
                      {copyFeedback === 'vision' ? <Check size={12} className="text-green-500" /> : <Copy size={12} />}
                    </button>
                  </div>
                  <div className="p-4 text-xs leading-relaxed text-neutral-300 whitespace-pre-wrap max-h-48 overflow-y-auto">
                    {visionResult}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'lore' && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <textarea 
                  value={lorePrompt}
                  onChange={(e) => setLorePrompt(e.target.value)}
                  placeholder="Describe a kingdom, a relic, or an event for a Lorebook entry..."
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-3 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-600 min-h-[100px] resize-none"
                />
                <button 
                  onClick={handleLoreGen}
                  disabled={loading || !lorePrompt.trim()}
                  className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-neutral-800 disabled:text-neutral-600 rounded-lg font-bold text-xs transition-all flex items-center justify-center gap-2"
                >
                  {loading ? <RefreshCw className="animate-spin" size={14} /> : <Sparkles size={14} />}
                  <span>Generate Lore Entry</span>
                </button>

              {generatedLore && (
                <div className="bg-[#161616] border border-neutral-800 rounded-lg overflow-hidden">
                  <div className="p-2 bg-neutral-800/50 border-b border-neutral-800 flex justify-between items-center">
                    <span className="text-[10px] font-bold text-neutral-500 uppercase px-1">Lorebook JSON</span>
                    <button 
                      onClick={() => triggerCopy(JSON.stringify(generatedLore, null, 2), 'lore-json')}
                      className="p-1 hover:bg-neutral-700 rounded transition-colors text-neutral-400"
                    >
                      {copyFeedback === 'lore-json' ? <Check size={12} className="text-green-500" /> : <Copy size={12} />}
                    </button>
                  </div>
                  <pre className="p-4 text-[10px] font-mono text-indigo-400 bg-neutral-950 overflow-x-auto max-h-40">
                    {JSON.stringify(generatedLore, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}

          {activeTab === 'brainstorm' && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <textarea 
                  value={historyInput}
                  onChange={(e) => setHistoryInput(e.target.value)}
                  placeholder="Paste chat history to get plot hook suggestions..."
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-3 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-600 min-h-[120px] resize-none"
                />
                <button 
                  onClick={handleBrainstorm}
                  disabled={loading || !historyInput.trim()}
                  className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-neutral-800 disabled:text-neutral-600 rounded-lg font-bold text-xs transition-all flex items-center justify-center gap-2"
                >
                  {loading ? <RefreshCw className="animate-spin" size={14} /> : <BrainCircuit size={14} />}
                  <span>Generate Plot Hooks</span>
                </button>

                <div className="space-y-2">
                  {hooks.map((hook, idx) => (
                    <div key={idx} className="bg-neutral-900 border border-neutral-800 p-3 rounded-lg group relative hover:border-indigo-500/30 transition-all">
                      <p className="text-[11px] leading-snug pr-6">{hook}</p>
                      <button 
                        onClick={() => triggerCopy(hook, `hook-${idx}`)}
                        className="absolute right-2 top-2 p-1 opacity-0 group-hover:opacity-100 transition-opacity bg-neutral-800 hover:bg-neutral-700 rounded text-neutral-400"
                      >
                        {copyFeedback === `hook-${idx}` ? <Check size={10} className="text-green-500" /> : <Copy size={10} />}
                      </button>
                    </div>
                  ))}
                </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <section className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <Cpu size={14} className="text-indigo-500" />
                  <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-200">Model Configuration</h3>
                </div>
                
                <ModelSelect 
                  label="Vision & Analysis Model" 
                  value={settings.visionModel} 
                  onChange={(val) => updateSetting('visionModel', val)} 
                />
                
                <ModelSelect 
                  label="Lore Generation Model" 
                  value={settings.loreModel} 
                  onChange={(val) => updateSetting('loreModel', val)} 
                />

                <ModelSelect 
                  label="Brainstorming Model" 
                  value={settings.brainstormModel} 
                  onChange={(val) => updateSetting('brainstormModel', val)} 
                />

                <ModelSelect 
                  label="Chat Assistant Model" 
                  value={settings.chatModel} 
                  onChange={(val) => updateSetting('chatModel', val)} 
                />
              </section>

              <section className="p-4 bg-indigo-600/10 border border-indigo-500/20 rounded-xl space-y-2">
                <div className="flex items-center gap-2 text-indigo-400">
                  <Info size={14} />
                  <span className="text-[10px] font-bold uppercase tracking-wider">About API Keys</span>
                </div>
                <p className="text-[10px] text-neutral-500 leading-relaxed">
                  The API key is managed externally via your environment or SillyTavern plugin settings. This extension uses the system-provided key for all Gemini requests.
                </p>
              </section>
            </div>
          )}
        </div>

        <footer className="h-6 bg-[#1a1a1a] border-t border-neutral-800 px-3 flex items-center justify-between text-[9px] text-neutral-600 font-mono">
          <div>EXT_CONNECTED</div>
          <div className="flex gap-2">
            <span>{settings.chatModel.toUpperCase()}</span>
          </div>
        </footer>
      </main>

      {loading && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-[1px] z-[100] flex items-center justify-center pointer-events-none">
          <div className="bg-[#1a1a1a] border border-neutral-800 p-3 rounded-lg flex items-center gap-2 shadow-2xl">
            <RefreshCw className="animate-spin text-indigo-500" size={14} />
            <span className="text-[10px] font-bold tracking-widest text-neutral-400 uppercase">Consulting AI...</span>
          </div>
        </div>
      )}
    </div>
  );
};

interface TabButtonProps {
  icon: React.ReactNode;
  active?: boolean;
  onClick: () => void;
  label: string;
}

const TabButton: React.FC<TabButtonProps> = ({ icon, active, onClick, label }) => (
  <button 
    onClick={onClick}
    title={label}
    className={`p-2 rounded-lg transition-all relative group ${
      active ? 'bg-indigo-600/20 text-indigo-500' : 'text-neutral-600 hover:text-neutral-300 hover:bg-neutral-800'
    }`}
  >
    {icon}
    {active && <div className="absolute left-[-1rem] w-1 h-4 bg-indigo-500 rounded-r-full" />}
  </button>
);

export default App;
