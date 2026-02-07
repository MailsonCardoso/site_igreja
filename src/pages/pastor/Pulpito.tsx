import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    ArrowLeft,
    Play,
    Pause,
    RotateCcw,
    Sun,
    Moon,
    Type,
    Minimize,
    Maximize,
    Lightbulb,
    X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { mockSermons } from "./Altar"; // Importando dados mockados

export default function Pulpito() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [sermon, setSermon] = useState<any>(null);

    // Controles de Púlpito
    const [fontSize, setFontSize] = useState(24);
    const [isDark, setIsDark] = useState(true); // Padrão escuro para púlpito (menos cansaço visual)
    const [isFullscreen, setIsFullscreen] = useState(false);

    // Cronômetro
    const [time, setTime] = useState(0);
    const [isRunning, setIsRunning] = useState(false);

    useEffect(() => {
        // Carregar sermão (simulado)
        const foundSermon = mockSermons.find(s => s.id === Number(id));
        if (foundSermon) {
            setSermon(foundSermon);
        }
    }, [id]);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isRunning) {
            interval = setInterval(() => {
                setTime((prevTime) => prevTime + 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isRunning]);

    useEffect(() => {
        // Aplicar tema escuro/claro no body para o modo púlpito
        if (isDark) {
            document.documentElement.classList.add("dark");
        } else {
            document.documentElement.classList.remove("dark");
        }
        return () => {
            // Limpar ao sair (assumindo que o app usa dark mode do sistema ou preferência do usuário)
            // Para simplificar, não removemos a classe dark se o sistema já for dark, 
            // mas garantimos que ao sair voltamos ao estado anterior (seria ideal ter um context de tema)
            document.documentElement.classList.remove("dark"); // Reset forçado para evitar conflito
        };
    }, [isDark]);

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
            setIsFullscreen(true);
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
                setIsFullscreen(false);
            }
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    if (!sermon) return <div className="flex items-center justify-center h-screen">Carregando sermão...</div>;

    return (
        <div className={`min-h-screen transition-colors duration-300 ${isDark ? 'bg-zinc-950 text-zinc-100' : 'bg-white text-zinc-900'}`}>

            {/* Barra de Controle Superior (Flutuante/Sticky) */}
            <header className={`sticky top-0 z-50 flex items-center justify-between px-4 py-3 border-b backdrop-blur-md ${isDark ? 'bg-zinc-950/80 border-zinc-800' : 'bg-white/80 border-zinc-200'}`}>
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="hover:bg-zinc-800/20">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div className="hidden md:block">
                        <h1 className="font-bold text-sm truncate max-w-[200px]">{sermon.title}</h1>
                        <p className="text-xs opacity-60 font-serif">{sermon.verse}</p>
                    </div>
                </div>

                {/* Cronômetro Central */}
                <div className={`absolute left-1/2 -translate-x-1/2 flex items-center gap-3 px-4 py-1.5 rounded-full border ${isDark ? 'bg-zinc-900 border-zinc-700' : 'bg-zinc-100 border-zinc-200'}`}>
                    <span className={`font-mono text-2xl font-bold tabular-nums ${isRunning ? 'text-green-500' : 'opacity-70'}`}>
                        {formatTime(time)}
                    </span>
                    <div className="flex gap-1 border-l pl-2 border-zinc-700/20">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 rounded-full hover:bg-zinc-500/20"
                            onClick={() => setIsRunning(!isRunning)}
                        >
                            {isRunning ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5 ml-0.5" />}
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 rounded-full hover:bg-zinc-500/20 text-destructive"
                            onClick={() => { setIsRunning(false); setTime(0); }}
                        >
                            <RotateCcw className="h-3.5 w-3.5" />
                        </Button>
                    </div>
                </div>

                {/* Controles da Direita */}
                <div className="flex items-center gap-2">

                    {/* Ajuste de Fonte */}
                    <div className="hidden sm:flex items-center gap-2 mr-2 px-2 py-1 rounded-lg hover:bg-zinc-500/10 transition-colors group relative">
                        <Type className="h-4 w-4 opacity-50" />
                        <div className="w-24">
                            <Slider
                                value={[fontSize]}
                                min={16}
                                max={48}
                                step={2}
                                onValueChange={(val) => setFontSize(val[0])}
                                className="cursor-pointer"
                            />
                        </div>
                    </div>

                    <Button variant="ghost" size="icon" onClick={() => setIsDark(!isDark)} className="hover:bg-zinc-500/20">
                        {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                    </Button>

                    <Button variant="ghost" size="icon" onClick={toggleFullscreen} className="hover:bg-zinc-500/20 hidden sm:flex">
                        {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
                    </Button>

                    {/* Gaveta de Insights */}
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button variant="outline" size="sm" className={`gap-2 border-dashed ${isDark ? 'border-zinc-700 hover:bg-zinc-800' : 'border-zinc-300'}`}>
                                <Lightbulb className="h-4 w-4 text-amber-500" />
                                <span className="hidden sm:inline">Insights</span>
                            </Button>
                        </SheetTrigger>
                        <SheetContent className={`w-[400px] border-l ${isDark ? 'bg-zinc-900 border-zinc-800 text-zinc-100' : ''}`}>
                            <SheetHeader>
                                <SheetTitle className={isDark ? 'text-zinc-100' : ''}>Banco de Insights</SheetTitle>
                            </SheetHeader>
                            <div className="mt-6 space-y-4">
                                <div className={`p-4 rounded-lg ${isDark ? 'bg-zinc-800' : 'bg-amber-50 border border-amber-100'}`}>
                                    <p className="font-serif text-sm italic mb-2">"A fé é o firme fundamento das coisas que se esperam..."</p>
                                    <span className="text-xs opacity-50 font-bold uppercase">Hebreus 11:1</span>
                                </div>
                                <div className={`p-4 rounded-lg relative ${isDark ? 'bg-zinc-800' : 'bg-yellow-50 border border-yellow-100 shadow-sm'}`}>
                                    <div className="absolute top-0 right-0 w-3 h-3 bg-yellow-400/50 rounded-bl-lg"></div>
                                    <h4 className="font-bold text-xs mb-1 uppercase tracking-wider opacity-70">Ilustração</h4>
                                    <p className="text-sm">Contar a história do equilibrista nas Cataratas do Niágara sobre confiança vs crença.</p>
                                </div>
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>
            </header>

            {/* Conteúdo do Sermão */}
            <main className="max-w-4xl mx-auto px-6 py-12 pb-32">
                <ScrollArea className="h-full">
                    <article className="prose prose-zinc dark:prose-invert max-w-none transition-all duration-300" style={{ fontSize: `${fontSize}px`, lineHeight: 1.6 }}>

                        {/* Cabeçalho do Texto */}
                        <div className="mb-12 text-center border-b border-zinc-500/20 pb-8">
                            <span className={`inline-block px-3 py-1 rounded-full text-[0.4em] font-bold uppercase tracking-widest mb-4 border ${isDark ? 'border-zinc-700 bg-zinc-900' : 'border-zinc-200 bg-zinc-50'}`}>
                                {sermon.series}
                            </span>
                            <h1 className="font-display font-bold leading-tight mb-4" style={{ fontSize: '1.8em' }}>
                                {sermon.title}
                            </h1>
                            <p className="font-serif italic opacity-80" style={{ fontSize: '0.8em' }}>
                                Baseado em {sermon.verse}
                            </p>
                        </div>

                        {/* Corpo do Texto */}
                        <div className="space-y-8">
                            <section>
                                <h2 className="font-bold uppercase tracking-wider opacity-50 text-[0.6em] mb-4 border-l-4 border-amber-500 pl-3">
                                    Introdução
                                </h2>
                                <p>{sermon.content.intro}</p>
                            </section>

                            {sermon.content.topics.map((topic: string, index: number) => (
                                <section key={index} className={`p-6 rounded-xl border-l-4 ${isDark ? 'bg-zinc-900/50 border-zinc-700' : 'bg-zinc-50 border-zinc-300'}`}>
                                    <h3 className="font-bold mb-3 flex items-center gap-3">
                                        <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-[0.6em]">
                                            {index + 1}
                                        </span>
                                        {topic}
                                    </h3>
                                    <p className="opacity-80">
                                        [O pastor deve desenvolver este ponto aqui. Adicionar notas e referências cruzadas...]
                                    </p>
                                </section>
                            ))}

                            <section>
                                <h2 className="font-bold uppercase tracking-wider opacity-50 text-[0.6em] mb-4 border-l-4 border-green-500 pl-3">
                                    Conclusão
                                </h2>
                                <p>{sermon.content.conclusion}</p>
                            </section>
                        </div>
                    </article>
                </ScrollArea>
            </main>

        </div>
    );
}
