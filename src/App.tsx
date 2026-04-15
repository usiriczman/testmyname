/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo, useEffect } from 'react';
import { Search, Layers, Palette, Info, Play, Zap, ChevronRight, RotateCcw, Eye, Check, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import cardsData from './cartas.json';

interface Carta {
  palabra_clave: string;
  azul: string;
  azul_a?: string;
  azul_b?: string;
  verde: string;
  verde_a?: string;
  verde_b?: string;
  rojo: string;
  rojo_a?: string;
  rojo_b?: string;
}

interface SetDeCartas {
  imagen: number;
  cartas: Carta[];
}

type GameMode = 'normal' | 'relampago' | null;
type Category = 'rojo' | 'verde' | 'azul' | null;

export default function App() {
  const [view, setView] = useState<'menu' | 'category-select' | 'game' | 'library' | 'game-over'>('menu');
  const [gameMode, setGameMode] = useState<GameMode>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category>(null);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showDescriptionB, setShowDescriptionB] = useState(false);
  const [showAllTitles, setShowAllTitles] = useState(false);
  const [shuffledCards, setShuffledCards] = useState<(Carta & { setImagen: number })[]>([]);

  // Library state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSet, setSelectedSet] = useState<number | 'all'>('all');

  const allCards = useMemo(() => {
    return (cardsData as SetDeCartas[]).flatMap(set => 
      set.cartas.map(carta => ({ ...carta, setImagen: set.imagen }))
    );
  }, []);

  const filteredCards = useMemo(() => {
    return allCards.filter(card => {
      const matchesSearch = 
        card.palabra_clave.toLowerCase().includes(searchTerm.toLowerCase()) ||
        card.azul.toLowerCase().includes(searchTerm.toLowerCase()) ||
        card.verde.toLowerCase().includes(searchTerm.toLowerCase()) ||
        card.rojo.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesSet = selectedSet === 'all' || card.setImagen === selectedSet;
      return matchesSearch && matchesSet;
    });
  }, [searchTerm, selectedSet, allCards]);

  const sets = useMemo(() => {
    return Array.from(new Set((cardsData as SetDeCartas[]).map(s => s.imagen))).sort((a, b) => a - b);
  }, []);

  const startGame = (mode: GameMode) => {
    setGameMode(mode);
    const shuffled = [...allCards].sort(() => Math.random() - 0.5);
    setShuffledCards(shuffled);
    setCurrentCardIndex(0);
    setIsFlipped(false);
    setShowDescriptionB(false);
    setShowAllTitles(false);
    
    if (mode === 'normal') {
      setView('category-select');
    } else {
      setSelectedCategory('rojo');
      setView('game');
    }
  };

  const nextCard = () => {
    if (currentCardIndex < shuffledCards.length - 1) {
      // Primero iniciamos el giro hacia el frente
      setIsFlipped(false);
      
      // Esperamos a que la carta esté de perfil (aprox 250-300ms) 
      // para cambiar el contenido sin que se note el salto
      setTimeout(() => {
        setCurrentCardIndex(prev => prev + 1);
        setShowDescriptionB(false);
        setShowAllTitles(false);
      }, 300);
    } else {
      setView('game-over');
    }
  };

  const currentCard = shuffledCards[currentCardIndex];

  return (
    <div className="min-h-screen bg-bg text-text-main font-sans selection:bg-accent/20">
      <AnimatePresence mode="wait">
        {view === 'menu' && (
          <motion.div 
            key="menu"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex flex-col items-center justify-center min-h-[100dvh] p-4 text-center"
          >
            <div className="mb-8 sm:mb-12">
              <div className="w-16 h-16 sm:w-24 sm:h-24 bg-accent rounded-[1.5rem] sm:rounded-[2rem] flex items-center justify-center shadow-2xl shadow-accent/40 mx-auto mb-4 sm:mb-8">
                <Layers className="text-white w-8 h-8 sm:w-12 sm:h-12" />
              </div>
              <h1 className="text-3xl sm:text-5xl font-black tracking-tight mb-2 sm:mb-4">Trivia Flashcards</h1>
              <p className="text-text-sec text-base sm:text-lg max-w-xs mx-auto leading-relaxed">Elige un modo y pon a prueba tu ingenio.</p>
            </div>

            <div className="grid gap-3 sm:gap-4 w-full max-w-sm">
              <button 
                onClick={() => startGame('normal')}
                className="group relative flex items-center gap-4 sm:gap-5 p-4 sm:p-6 bg-card-bg border border-border rounded-2xl sm:rounded-3xl text-left hover:border-accent hover:shadow-xl transition-all active:scale-[0.98]"
              >
                <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-accent/10 flex items-center justify-center group-hover:bg-accent group-hover:text-white transition-colors">
                  <Play className="w-5 h-5 sm:w-7 sm:h-7" />
                </div>
                <div>
                  <h3 className="font-bold text-lg sm:text-xl">Modo Normal</h3>
                  <p className="text-xs sm:text-sm text-text-sec">Adivina por descripción.</p>
                </div>
                <ChevronRight className="ml-auto text-border group-hover:text-accent transition-colors" />
              </button>

              <button 
                onClick={() => startGame('relampago')}
                className="group relative flex items-center gap-4 sm:gap-5 p-4 sm:p-6 bg-card-bg border border-border rounded-2xl sm:rounded-3xl text-left hover:border-game-red hover:shadow-xl transition-all active:scale-[0.98]"
              >
                <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-game-red/10 flex items-center justify-center group-hover:bg-game-red group-hover:text-white transition-colors">
                  <Zap className="w-5 h-5 sm:w-7 sm:h-7" />
                </div>
                <div>
                  <h3 className="font-bold text-lg sm:text-xl">Modo Relámpago</h3>
                  <p className="text-xs sm:text-sm text-text-sec">Adivina desde el título rojo.</p>
                </div>
                <ChevronRight className="ml-auto text-border group-hover:text-game-red transition-colors" />
              </button>

              <button 
                onClick={() => setView('library')}
                className="group relative flex items-center gap-4 sm:gap-5 p-4 sm:p-6 bg-card-bg border border-border rounded-2xl sm:rounded-3xl text-left hover:border-text-main hover:shadow-xl transition-all active:scale-[0.98]"
              >
                <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-border flex items-center justify-center group-hover:bg-text-main group-hover:text-white transition-colors">
                  <Search className="w-5 h-5 sm:w-7 sm:h-7" />
                </div>
                <div>
                  <h3 className="font-bold text-lg sm:text-xl">Biblioteca</h3>
                  <p className="text-xs sm:text-sm text-text-sec">Explora todas las cartas.</p>
                </div>
                <ChevronRight className="ml-auto text-border group-hover:text-text-main transition-colors" />
              </button>
            </div>
          </motion.div>
        )}

        {view === 'category-select' && (
          <motion.div 
            key="category-select"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            className="flex flex-col items-center justify-center min-h-[100dvh] p-4"
          >
            <button 
              onClick={() => setView('menu')}
              className="absolute top-6 left-6 flex items-center gap-2 text-text-sec hover:text-text-main transition-colors font-medium text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Volver</span>
            </button>

            <h2 className="text-2xl sm:text-4xl font-black mb-8 sm:mb-16 tracking-tight">Elige una Categoría</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-8 w-full max-w-4xl">
              {[
                { id: 'rojo', label: 'Rojo', color: 'bg-game-red', desc: 'Películas y Series' },
                { id: 'verde', label: 'Verde', color: 'bg-game-green', desc: 'Personajes y Figuras' },
                { id: 'azul', label: 'Azul', color: 'bg-game-blue', desc: 'Obras y Arte' }
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => {
                    setSelectedCategory(cat.id as Category);
                    setView('game');
                  }}
                  className="group relative flex flex-row sm:flex-col items-center gap-4 sm:gap-6 p-4 sm:p-10 bg-card-bg border border-border rounded-2xl sm:rounded-[3rem] hover:shadow-2xl hover:-translate-y-2 transition-all active:scale-95"
                >
                  <div className={`w-12 h-12 sm:w-24 sm:h-24 rounded-full ${cat.color} shadow-xl shadow-black/10 group-hover:scale-110 transition-transform shrink-0`} />
                  <div className="text-left sm:text-center">
                    <span className="font-black text-lg sm:text-2xl block mb-0.5 sm:mb-1">{cat.label}</span>
                    <span className="text-xs sm:text-sm text-text-sec font-medium">{cat.desc}</span>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {view === 'game' && currentCard && (
          <motion.div 
            key="game"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center min-h-[100dvh] p-4 overflow-hidden"
          >
            <div className="absolute top-4 sm:top-8 left-4 sm:left-8 right-4 sm:right-8 flex items-center justify-between">
              <button 
                onClick={() => setView('menu')}
                className="flex items-center gap-2 text-text-sec hover:text-text-main transition-colors font-medium text-sm"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Salir</span>
              </button>
              <div className="text-[10px] sm:text-sm font-bold bg-white border border-border px-3 sm:px-4 py-1 sm:py-1.5 rounded-full text-text-main shadow-sm">
                {currentCardIndex + 1} / {shuffledCards.length}
              </div>
            </div>

            <div className="card-container mb-6 sm:mb-12 mt-8 sm:mt-0">
              <div className={`card-inner ${isFlipped ? 'rotate-y-180' : ''}`}>
                {/* Front */}
                <div className="card-face bg-white p-6 sm:p-10 flex flex-col items-center justify-center text-center doodle-pattern">
                  <div className="w-full h-full flex flex-col items-center justify-center">
                    <div className={`w-12 h-12 sm:w-20 sm:h-20 rounded-full mb-6 sm:mb-10 shadow-inner ${
                      selectedCategory === 'rojo' ? 'bg-game-red' : 
                      selectedCategory === 'verde' ? 'bg-game-green' : 'bg-game-blue'
                    }`} />
                    
                    <div className="space-y-4 sm:space-y-8 max-w-[280px]">
                      {gameMode === 'normal' ? (
                        <p className="text-lg sm:text-2xl font-bold leading-tight text-text-main">
                          {showDescriptionB ? currentCard[`${selectedCategory}_b` as keyof Carta] : currentCard[`${selectedCategory}_a` as keyof Carta]}
                        </p>
                      ) : (
                        <div className="space-y-4 sm:space-y-6">
                          <p className="text-[10px] sm:text-sm font-bold text-text-sec uppercase tracking-widest">Adivina los otros títulos</p>
                          <div className="bg-game-red text-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl font-black text-xl sm:text-2xl shadow-xl shadow-game-red/20">
                            {currentCard.rojo}
                          </div>
                          {showAllTitles && (
                            <motion.div 
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="space-y-3 sm:space-y-4"
                            >
                              <div className="bg-game-green text-white p-3 sm:p-4 rounded-xl sm:rounded-2xl font-bold text-lg sm:text-xl shadow-lg shadow-game-green/10">
                                {currentCard.verde}
                              </div>
                              <div className="bg-game-blue text-white p-3 sm:p-4 rounded-xl sm:rounded-2xl font-bold text-lg sm:text-xl shadow-lg shadow-game-blue/10">
                                {currentCard.azul}
                              </div>
                            </motion.div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Back */}
                <div className="card-face card-back doodle-pattern">
                  {/* Red Section */}
                  <div className="bg-game-red h-[22%] flex flex-col items-center justify-center relative px-6 sm:px-8 text-center border-b border-white/10">
                    <h3 className="text-white font-black text-lg sm:text-2xl uppercase tracking-tight drop-shadow-md">
                      {currentCard.rojo}
                    </h3>
                    <div className="absolute bottom-2 sm:bottom-3 right-3 sm:right-5 flex items-center gap-1 sm:gap-1.5">
                      <span className="text-[8px] sm:text-[10px] text-white/80 font-bold uppercase tracking-widest">
                        {currentCard.rojo_a?.split('.')[0] || 'Categoría'}
                      </span>
                      <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white/30 rounded-sm" />
                    </div>
                  </div>
                  
                  {/* Green Section */}
                  <div className="bg-game-green h-[22%] flex flex-col items-center justify-center relative px-6 sm:px-8 text-center border-b border-white/10">
                    <h3 className="text-white font-black text-lg sm:text-2xl uppercase tracking-tight drop-shadow-md">
                      {currentCard.verde}
                    </h3>
                    <div className="absolute bottom-2 sm:bottom-3 right-3 sm:right-5 flex items-center gap-1 sm:gap-1.5">
                      <span className="text-[8px] sm:text-[10px] text-white/80 font-bold uppercase tracking-widest">
                        {currentCard.verde_a?.split('.')[0] || 'Categoría'}
                      </span>
                      <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white/30 rounded-sm" />
                    </div>
                  </div>

                  {/* Blue Section */}
                  <div className="bg-game-blue h-[22%] flex flex-col items-center justify-center relative px-6 sm:px-8 text-center border-b border-white/10">
                    <h3 className="text-white font-black text-lg sm:text-2xl uppercase tracking-tight drop-shadow-sm">
                      {currentCard.azul}
                    </h3>
                    <div className="absolute bottom-2 sm:bottom-3 right-3 sm:right-5 flex items-center gap-1 sm:gap-1.5">
                      <span className="text-[8px] sm:text-[10px] text-white/80 font-bold uppercase tracking-widest">
                        {currentCard.azul_a?.split('.')[0] || 'Categoría'}
                      </span>
                      <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white/30 rounded-sm" />
                    </div>
                  </div>

                  {/* Keyword Section */}
                  <div className="bg-white h-[34%] flex flex-col items-center justify-center relative px-6 sm:px-8 text-center">
                    <span className="text-[10px] sm:text-[12px] font-black text-text-main uppercase tracking-[0.2em] sm:tracking-[0.3em] mb-1 sm:mb-3">Palabra Clave</span>
                    <h3 className="text-game-red font-black text-2xl sm:text-4xl uppercase tracking-tighter leading-none">
                      {currentCard.palabra_clave}
                    </h3>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3 sm:gap-4 w-full max-w-[340px]">
              {!isFlipped ? (
                <>
                  {gameMode === 'normal' ? (
                    <>
                      <button 
                        onClick={() => setShowDescriptionB(!showDescriptionB)}
                        className="flex-1 flex flex-col items-center justify-center gap-1 py-3 sm:py-4 bg-card-bg border border-border rounded-2xl sm:rounded-3xl font-bold hover:bg-bg transition-all active:scale-95"
                      >
                        <Eye className="w-5 h-5 sm:w-6 sm:h-6 text-text-sec" />
                        <span className="text-[10px] uppercase tracking-widest">{showDescriptionB ? 'Ver A' : 'Ver B'}</span>
                      </button>
                      <button 
                        onClick={() => setIsFlipped(true)}
                        className="flex-[2] flex items-center justify-center gap-2 py-3 sm:py-4 bg-accent text-white rounded-2xl sm:rounded-3xl font-black text-base sm:text-lg shadow-xl shadow-accent/20 hover:bg-accent/90 transition-all active:scale-95"
                      >
                        <Check className="w-5 h-5 sm:w-6 sm:h-6" />
                        Confirmar
                      </button>
                    </>
                  ) : (
                    <>
                      <button 
                        onClick={() => setShowAllTitles(true)}
                        className="flex-1 flex flex-col items-center justify-center gap-1 py-3 sm:py-4 bg-card-bg border border-border rounded-2xl sm:rounded-3xl font-bold hover:bg-bg transition-all active:scale-95"
                      >
                        <Layers className="w-5 h-5 sm:w-6 sm:h-6 text-text-sec" />
                        <span className="text-[10px] uppercase tracking-widest">Completa</span>
                      </button>
                      <button 
                        onClick={() => {
                          setShowAllTitles(true);
                          setIsFlipped(true);
                        }}
                        className="flex-[2] flex items-center justify-center gap-2 py-3 sm:py-4 bg-game-red text-white rounded-2xl sm:rounded-3xl font-black text-base sm:text-lg shadow-xl shadow-game-red/20 hover:bg-game-red/90 transition-all active:scale-95"
                      >
                        <Check className="w-5 h-5 sm:w-6 sm:h-6" />
                        Confirmar
                      </button>
                    </>
                  )}
                </>
              ) : (
                <button 
                  onClick={nextCard}
                  className="w-full flex items-center justify-center gap-2 sm:gap-3 py-4 sm:py-5 bg-text-main text-white rounded-2xl sm:rounded-3xl font-black text-lg sm:text-xl shadow-2xl shadow-black/20 hover:bg-text-main/90 transition-all active:scale-95"
                >
                  Siguiente
                  <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
              )}
            </div>
          </motion.div>
        )}

        {view === 'game-over' && (
          <motion.div 
            key="game-over"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            className="flex flex-col items-center justify-center min-h-[100dvh] p-4 text-center"
          >
            <div className="w-16 h-16 sm:w-24 sm:h-24 bg-game-green rounded-2xl sm:rounded-[2rem] flex items-center justify-center shadow-2xl shadow-game-green/40 mx-auto mb-6 sm:mb-8">
              <RotateCcw className="text-white w-8 h-8 sm:w-12 sm:h-12" />
            </div>
            <h2 className="text-3xl sm:text-5xl font-black mb-2 sm:mb-4 tracking-tight">¡Fin del Juego!</h2>
            <p className="text-text-sec text-base sm:text-lg mb-8 sm:mb-12 max-w-xs mx-auto">Has completado todas las cartas de este set.</p>
            
            <div className="grid gap-3 sm:gap-4 w-full max-w-sm">
              <button 
                onClick={() => setView('menu')}
                className="flex items-center justify-center gap-2 sm:gap-3 py-4 sm:py-5 bg-accent text-white rounded-2xl sm:rounded-3xl font-black text-lg sm:text-xl shadow-xl shadow-accent/20 hover:bg-accent/90 transition-all active:scale-95"
              >
                Volver al Menú
              </button>
              <button 
                onClick={() => startGame(gameMode)}
                className="flex items-center justify-center gap-2 sm:gap-3 py-4 sm:py-5 bg-card-bg border border-border rounded-2xl sm:rounded-3xl font-bold text-lg sm:text-xl hover:bg-bg transition-all active:scale-95"
              >
                Jugar de Nuevo
              </button>
            </div>
          </motion.div>
        )}

        {view === 'library' && (
          <motion.div 
            key="library"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col h-[100dvh] overflow-hidden bg-bg"
          >
            {/* Header */}
            <header className="h-20 sm:h-24 px-4 sm:px-10 flex items-center justify-between border-b border-border bg-card-bg shrink-0">
              <div className="flex items-center gap-3 sm:gap-6">
                <button 
                  onClick={() => setView('menu')}
                  className="p-2 sm:p-3 hover:bg-bg rounded-xl sm:rounded-2xl transition-colors border border-transparent hover:border-border"
                >
                  <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
                <h1 className="text-lg sm:text-2xl font-black tracking-tight text-text-main">Biblioteca</h1>
              </div>
              <div className="flex items-center gap-2 sm:gap-4 flex-1 justify-end">
                <div className="relative w-full max-w-[160px] sm:max-w-xs">
                  <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-text-sec w-4 h-4 sm:w-5 sm:h-5" />
                  <input
                    type="text"
                    placeholder="Buscar..."
                    className="bg-bg border border-border px-3 sm:px-5 py-2 sm:py-3 pl-9 sm:pl-12 rounded-xl sm:rounded-2xl w-full text-xs sm:text-sm font-medium text-text-main focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </header>

            <div className="flex flex-1 overflow-hidden">
              {/* Sidebar */}
              <aside className="w-64 sm:w-80 bg-card-bg border-r border-border p-4 sm:p-8 flex flex-col gap-6 sm:gap-8 overflow-y-auto hidden md:flex">
                <div className="space-y-4">
                  <p className="text-[10px] sm:text-[11px] font-black uppercase text-text-sec tracking-[0.2em]">Sets de Imágenes</p>
                  <div className="flex flex-col gap-1.5 sm:gap-2">
                    <button
                      onClick={() => setSelectedSet('all')}
                      className={`flex items-center justify-between px-3 sm:px-4 py-2 sm:py-3 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                        selectedSet === 'all' 
                          ? 'bg-accent text-white shadow-lg shadow-accent/20' 
                          : 'text-text-sec hover:bg-bg hover:text-text-main'
                      }`}
                    >
                      <span>Todos</span>
                      <span className={`text-[9px] sm:text-[10px] px-1.5 sm:px-2 py-0.5 rounded-full font-black ${selectedSet === 'all' ? 'bg-white/20' : 'bg-border'}`}>
                        {allCards.length}
                      </span>
                    </button>
                    {sets.map(setNum => (
                      <button
                        key={setNum}
                        onClick={() => setSelectedSet(setNum)}
                        className={`flex items-center justify-between px-3 sm:px-4 py-2 sm:py-3 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                          selectedSet === setNum 
                            ? 'bg-accent text-white shadow-lg shadow-accent/20' 
                            : 'text-text-sec hover:bg-bg hover:text-text-main'
                        }`}
                      >
                        <span>Set {setNum}</span>
                        <span className={`text-[9px] sm:text-[10px] px-1.5 sm:px-2 py-0.5 rounded-full font-black ${selectedSet === setNum ? 'bg-white/20' : 'bg-border'}`}>
                          {allCards.filter(c => c.setImagen === setNum).length}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-auto pt-6 sm:pt-8 border-t border-border">
                  <p className="text-[10px] sm:text-[11px] font-black uppercase text-text-sec tracking-[0.2em] mb-2 sm:mb-3">Estadísticas</p>
                  <div className="bg-bg p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-border">
                    <p className="text-2xl sm:text-4xl font-black text-text-main">{filteredCards.length}</p>
                    <p className="text-[10px] sm:text-sm text-text-sec font-medium">Cartas filtradas</p>
                  </div>
                </div>
              </aside>

              {/* Viewport Area */}
              <main className="flex-1 p-4 sm:p-10 overflow-y-auto">
                {/* Mobile Set Selector */}
                <div className="flex md:hidden gap-2 overflow-x-auto pb-4 mb-4 border-b border-border no-scrollbar">
                  <button
                    onClick={() => setSelectedSet('all')}
                    className={`whitespace-nowrap px-4 py-2 rounded-full text-xs font-bold transition-all ${
                      selectedSet === 'all' 
                        ? 'bg-accent text-white shadow-md shadow-accent/20' 
                        : 'bg-card-bg border border-border text-text-sec'
                    }`}
                  >
                    Todos ({allCards.length})
                  </button>
                  {sets.map(setNum => (
                    <button
                      key={setNum}
                      onClick={() => setSelectedSet(setNum)}
                      className={`whitespace-nowrap px-4 py-2 rounded-full text-xs font-bold transition-all ${
                        selectedSet === setNum 
                          ? 'bg-accent text-white shadow-md shadow-accent/20' 
                          : 'bg-card-bg border border-border text-text-sec'
                      }`}
                    >
                      Set {setNum} ({allCards.filter(c => c.setImagen === setNum).length})
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-8">
                  <AnimatePresence mode="popLayout">
                    {filteredCards.map((card, index) => (
                      <motion.div
                        key={`${card.setImagen}-${card.palabra_clave}`}
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.3, delay: index * 0.02 }}
                        className="bg-card-bg border border-border rounded-2xl sm:rounded-[2.5rem] p-5 sm:p-8 flex flex-col gap-4 sm:gap-6 shadow-sm hover:shadow-xl transition-all"
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-black text-[9px] sm:text-[10px] text-accent bg-accent/10 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full uppercase tracking-widest">SET {card.setImagen}</span>
                          <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-game-green animate-pulse" />
                        </div>

                        <div>
                          <h2 className="text-xl sm:text-2xl font-black text-text-main mb-3 sm:mb-6">{card.palabra_clave}</h2>
                          <div className="space-y-4 sm:space-y-6">
                            <div className="space-y-1.5 sm:space-y-2">
                              <div className="flex items-center gap-2 sm:gap-3">
                                <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-blue-500 shadow-lg shadow-blue-500/20" />
                                <p className="text-base sm:text-lg font-bold text-text-main">{card.azul}</p>
                              </div>
                              <div className="ml-4 sm:ml-6 space-y-1">
                                {card.azul_a && <p className="text-xs sm:text-sm text-text-sec leading-relaxed"><span className="font-black text-accent/80 mr-1.5 sm:mr-2">A</span> {card.azul_a}</p>}
                                {card.azul_b && <p className="text-xs sm:text-sm text-text-sec leading-relaxed"><span className="font-black text-text-sec/80 mr-1.5 sm:mr-2">B</span> {card.azul_b}</p>}
                              </div>
                            </div>
                            <div className="space-y-1.5 sm:space-y-2">
                              <div className="flex items-center gap-2 sm:gap-3">
                                <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-green-500 shadow-lg shadow-green-500/20" />
                                <p className="text-base sm:text-lg font-bold text-text-main">{card.verde}</p>
                              </div>
                              <div className="ml-4 sm:ml-6 space-y-1">
                                {card.verde_a && <p className="text-xs sm:text-sm text-text-sec leading-relaxed"><span className="font-black text-accent/80 mr-1.5 sm:mr-2">A</span> {card.verde_a}</p>}
                                {card.verde_b && <p className="text-xs sm:text-sm text-text-sec leading-relaxed"><span className="font-black text-text-sec/80 mr-1.5 sm:mr-2">B</span> {card.verde_b}</p>}
                              </div>
                            </div>
                            <div className="space-y-1.5 sm:space-y-2">
                              <div className="flex items-center gap-2 sm:gap-3">
                                <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-red-500 shadow-lg shadow-red-500/20" />
                                <p className="text-base sm:text-lg font-bold text-text-main">{card.rojo}</p>
                              </div>
                              <div className="ml-4 sm:ml-6 space-y-1">
                                {card.rojo_a && <p className="text-xs sm:text-sm text-text-sec leading-relaxed"><span className="font-black text-accent/80 mr-1.5 sm:mr-2">A</span> {card.rojo_a}</p>}
                                {card.rojo_b && <p className="text-xs sm:text-sm text-text-sec leading-relaxed"><span className="font-black text-text-sec/80 mr-1.5 sm:mr-2">B</span> {card.rojo_b}</p>}
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </main>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

