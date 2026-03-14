import React, { useState, useRef, useEffect } from 'react';
import { Play, Download, Loader2, Volume2, History, Settings, Type, Sparkles, Pause, Square, Save, Check } from 'lucide-react';
import { generateSpeech } from './services/geminiService';
import { addWavHeader } from './utils/audioUtils';
import { AudioRecord, VOICES, ACCENTS, STYLES, SPEEDS, TAGS } from './types';

export default function App() {
  const [text, setText] = useState("");
  const [voiceId, setVoiceId] = useState(VOICES[0].id);
  const [accent, setAccent] = useState(ACCENTS[0]);
  const [style, setStyle] = useState(STYLES[0]);
  const [speed, setSpeed] = useState(SPEEDS[2]);
  const [pitch, setPitch] = useState(50);
  
  const [history, setHistory] = useState<AudioRecord[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isTestingVoice, setIsTestingVoice] = useState(false);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [error, setError] = useState("");
  
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('tts_history');
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse history", e);
      }
    }

    const savedSettings = localStorage.getItem('tts_settings');
    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings);
        if (settings.voiceId) setVoiceId(settings.voiceId);
        if (settings.accent) setAccent(settings.accent);
        if (settings.style) setStyle(settings.style);
        if (settings.speed) setSpeed(settings.speed);
        if (settings.pitch !== undefined) setPitch(settings.pitch);
      } catch (e) {
        console.error("Failed to parse settings", e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('tts_history', JSON.stringify(history));
  }, [history]);

  const handleGenerate = async () => {
    if (!text.trim()) {
      setError("Por favor, introduce algún texto.");
      return;
    }
    
    setError("");
    setIsGenerating(true);
    
    try {
      const selectedVoice = VOICES.find(v => v.id === voiceId)!;
      const base64Audio = await generateSpeech(
        text,
        selectedVoice.baseVoice,
        selectedVoice.desc,
        accent,
        style,
        speed,
        pitch
      );
      
      const audioWithHeader = addWavHeader(base64Audio);
      
      const newRecord: AudioRecord = {
        id: Date.now().toString(),
        text,
        audioBase64: audioWithHeader,
        createdAt: Date.now(),
        settings: {
          voice: selectedVoice.name,
          accent,
          style,
          speed,
          pitch
        }
      };
      
      setHistory(prev => [newRecord, ...prev]);
      playAudio(newRecord.id, base64Audio);
      
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Ocurrió un error al generar el audio.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleTestVoice = async () => {
    setIsTestingVoice(true);
    setError("");
    
    try {
      const selectedVoice = VOICES.find(v => v.id === voiceId)!;
      const testText = "Hola, esta es una prueba de mi nueva voz.";
      const base64Audio = await generateSpeech(
        testText,
        selectedVoice.baseVoice,
        selectedVoice.desc,
        accent,
        style,
        speed,
        pitch
      );
      
      playAudio('test-voice', base64Audio);
    } catch (err: any) {
      console.error(err);
      setError("Error al probar la voz: " + (err.message || "desconocido"));
    } finally {
      setIsTestingVoice(false);
    }
  };

  const handleSaveSettings = () => {
    setIsSavingSettings(true);
    const settings = { voiceId, accent, style, speed, pitch };
    localStorage.setItem('tts_settings', JSON.stringify(settings));
    
    setTimeout(() => {
      setIsSavingSettings(false);
    }, 2000);
  };

  const playAudio = (id: string, base64: string) => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    
    const audioWithHeader = addWavHeader(base64);
    const audio = new Audio(`data:audio/wav;base64,${audioWithHeader}`);
    audioRef.current = audio;
    
    audio.onended = () => setCurrentlyPlaying(null);
    audio.play().catch(e => {
      console.error("Audio play error:", e);
      setError("Error al reproducir el audio. Es posible que el formato no sea compatible con tu navegador.");
      setCurrentlyPlaying(null);
    });
    setCurrentlyPlaying(id);
  };

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setCurrentlyPlaying(null);
    }
  };

  const togglePlay = (id: string, base64: string) => {
    if (currentlyPlaying === id) {
      stopAudio();
    } else {
      playAudio(id, base64);
    }
  };

  const downloadAudio = (record: AudioRecord) => {
    const audioWithHeader = addWavHeader(record.audioBase64);
    const link = document.createElement('a');
    link.href = `data:audio/wav;base64,${audioWithHeader}`;
    link.download = `audio_${record.id}.wav`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const insertTag = (tag: string) => {
    setText(prev => prev + (prev.endsWith(' ') || prev === '' ? '' : ' ') + tag + ' ');
  };

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 font-sans">
      <header className="bg-white border-b border-neutral-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-sm">
            <Volume2 size={24} />
          </div>
          <h1 className="text-xl font-semibold tracking-tight">Generador de Voz IA</h1>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Controls */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-200">
            <div className="flex items-center gap-2 mb-6 text-indigo-600">
              <Settings size={20} />
              <h2 className="text-lg font-medium text-neutral-900">Ajustes de Voz</h2>
            </div>

            <div className="space-y-5">
              {/* Voice Selector */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">Voz</label>
                <select 
                  value={voiceId} 
                  onChange={(e) => setVoiceId(e.target.value)}
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
                >
                  {VOICES.map(v => (
                    <option key={v.id} value={v.id}>{v.name}</option>
                  ))}
                </select>
              </div>

              {/* Accent Selector */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">Acento</label>
                <select 
                  value={accent} 
                  onChange={(e) => setAccent(e.target.value)}
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
                >
                  {ACCENTS.map(a => (
                    <option key={a} value={a}>{a}</option>
                  ))}
                </select>
              </div>

              {/* Style Selector */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">Estilo</label>
                <select 
                  value={style} 
                  onChange={(e) => setStyle(e.target.value)}
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
                >
                  {STYLES.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              {/* Speed Selector */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">Velocidad</label>
                <select 
                  value={speed} 
                  onChange={(e) => setSpeed(e.target.value)}
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
                >
                  {SPEEDS.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              {/* Pitch Selector */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-sm font-medium text-neutral-700">Tono</label>
                  <span className="text-xs text-neutral-500 font-mono">{pitch}</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  value={pitch} 
                  onChange={(e) => setPitch(parseInt(e.target.value))}
                  className="w-full accent-indigo-600"
                />
                <div className="flex justify-between text-xs text-neutral-400 mt-1">
                  <span>Grave</span>
                  <span>Agudo</span>
                </div>
              </div>

              {/* Test Voice Button */}
              <div className="pt-2 flex flex-col gap-2">
                <button
                  onClick={handleTestVoice}
                  disabled={isTestingVoice}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-sm font-medium transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isTestingVoice ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Volume2 size={16} />
                  )}
                  Probar Voz
                </button>

                <button
                  onClick={handleSaveSettings}
                  className={`w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-medium transition-all cursor-pointer border ${
                    isSavingSettings 
                      ? "bg-emerald-50 border-emerald-200 text-emerald-700" 
                      : "bg-white border-neutral-200 text-neutral-700 hover:bg-neutral-50 hover:border-neutral-300"
                  }`}
                >
                  {isSavingSettings ? (
                    <>
                      <Check size={16} />
                      ¡Ajustes Guardados!
                    </>
                  ) : (
                    <>
                      <Save size={16} />
                      Guardar Ajustes
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Input & History */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Text Input Area */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-200 flex flex-col h-[400px]">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-indigo-600">
                <Type size={20} />
                <h2 className="text-lg font-medium text-neutral-900">Texto a Voz</h2>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              {TAGS.map(tag => (
                <button
                  key={tag.tag}
                  onClick={() => insertTag(tag.tag)}
                  className="px-2.5 py-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-medium rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                  title={tag.desc}
                >
                  <Sparkles size={12} className="text-indigo-500" />
                  {tag.tag}
                </button>
              ))}
            </div>

            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Escribe aquí el texto que deseas convertir en voz..."
              className="flex-1 w-full bg-neutral-50 border border-neutral-200 rounded-xl p-4 text-neutral-800 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
            />

            {error && (
              <div className="mt-4 p-3 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100">
                {error}
              </div>
            )}

            <div className="mt-4 flex justify-end">
              <button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white px-6 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-colors shadow-sm cursor-pointer"
              >
                {isGenerating ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Generando...
                  </>
                ) : (
                  <>
                    <Play size={18} fill="currentColor" />
                    Generar Audio
                  </>
                )}
              </button>
            </div>
          </div>

          {/* History Area */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-200">
            <div className="flex items-center gap-2 mb-6 text-indigo-600">
              <History size={20} />
              <h2 className="text-lg font-medium text-neutral-900">Historial</h2>
            </div>

            {history.length === 0 ? (
              <div className="text-center py-12 text-neutral-400 text-sm">
                Aún no has generado ningún audio.
              </div>
            ) : (
              <div className="space-y-3">
                {history.map(record => (
                  <div key={record.id} className="p-4 border border-neutral-100 bg-neutral-50 rounded-xl hover:border-neutral-200 transition-colors">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-neutral-800 line-clamp-2 mb-2">
                          {record.text}
                        </p>
                        <div className="flex flex-wrap gap-2 text-xs text-neutral-500">
                          <span className="bg-white px-2 py-0.5 rounded-md border border-neutral-200">{record.settings.voice}</span>
                          <span className="bg-white px-2 py-0.5 rounded-md border border-neutral-200">{record.settings.accent}</span>
                          <span className="bg-white px-2 py-0.5 rounded-md border border-neutral-200">{record.settings.style}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => togglePlay(record.id, record.audioBase64)}
                          className="w-10 h-10 flex items-center justify-center bg-white border border-neutral-200 text-neutral-700 hover:text-indigo-600 hover:border-indigo-200 rounded-full transition-colors shadow-sm cursor-pointer"
                        >
                          {currentlyPlaying === record.id ? (
                            <Square size={16} fill="currentColor" />
                          ) : (
                            <Play size={16} fill="currentColor" className="ml-0.5" />
                          )}
                        </button>
                        <button
                          onClick={() => downloadAudio(record)}
                          className="w-10 h-10 flex items-center justify-center bg-white border border-neutral-200 text-neutral-700 hover:text-indigo-600 hover:border-indigo-200 rounded-full transition-colors shadow-sm cursor-pointer"
                          title="Descargar audio"
                        >
                          <Download size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}
