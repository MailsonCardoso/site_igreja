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
import { PastoralStore, Sermon } from "@/data/pastoral-store";

export default function Pulpito() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [sermon, setSermon] = useState<Sermon | null>(null);

    // Controles de Púlpito
    const [fontSize, setFontSize] = useState(24);
    const [isDark, setIsDark] = useState(true);
    const [isFullscreen, setIsFullscreen] = useState(false);

    // Cronômetro
    const [time, setTime] = useState(0);
    const [isRunning, setIsRunning] = useState(false);

    useEffect(() => {
        // Carregar sermão do store real
        const sermons = PastoralStore.getSermons();
        const foundSermon = sermons.find(s => s.id === Number(id));
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

            {/* Barra de Controle Superior */}
            <header className={`sticky top-0 z-50 flex items-center justify-between px-6 py-4 border-b backdrop-blur-md ${isDark ? 'bg-zinc-950/80 border-zinc-800' : 'bg-white/80 border-zinc-200'}`}>
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="hover:bg-zinc-500/20 rounded-full">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div className="hidden md:block">
                        <h1 className="font-bold text-sm truncate max-w-[200px] font-display">{sermon.title}</h1>
                        <p className="text-xs opacity-60 font-serif">{sermon.verse}</p>
                    </div>
                </div>

                {/* Cronômetro Central */}
                <div className={`flex items-center gap-6 px-6 py-2 rounded-full border shadow-sm transition-all ${isDark ? 'bg-zinc-900 border-zinc-700' : 'bg-zinc-100 border-zinc-200'}`}>
                    <div className="flex items-center gap-3 border-r pr-4 border-zinc-700/20">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-full hover:bg-zinc-500/20"
                            onClick={() => setIsRunning(!isRunning)}
                        >
                            {isRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 ml-0.5" />}
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-full hover:bg-zinc-500/20 text-destructive"
                            onClick={() => { setIsRunning(false); setTime(0); }}
                        >
                            <RotateCcw className="h-4 w-4" />
                        </Button>
                    </div>
                    <span className={`font-mono text-3xl font-bold tabular-nums ${isRunning ? 'text-primary' : 'opacity-40'}`}>
                        {formatTime(time)}
                    </span>
                </div>

                {/* Controles da Direita */}
                <div className="flex items-center gap-3">
                    <div className="hidden sm:flex items-center gap-3 bg-zinc-500/5 px-4 py-1.5 rounded-full border border-zinc-500/10">
                        <Type className="h-3 w-3 opacity-40" />
                        <div className="w-20">
                            <Slider
                                value={[fontSize]}
                                min={18}
                                max={48}
                                step={2}
                                onValueChange={(val) => setFontSize(val[0])}
                            />
                        </div>
                    </div>

                    <Button variant="ghost" size="icon" onClick={() => setIsDark(!isDark)} className="hover:bg-zinc-500/20 rounded-full">
                        {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                    </Button>

                    <Button variant="ghost" size="icon" onClick={toggleFullscreen} className="hover:bg-zinc-500/20 rounded-full hidden sm:flex">
                        {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
                    </Button>

                    <Sheet>
                        <SheetTrigger asChild>
                            <Button variant="outline" size="sm" className={`gap-2 border-dashed rounded-full ${isDark ? 'border-zinc-700 hover:bg-zinc-800' : 'border-zinc-300'}`}>
                                <Lightbulb className="h-4 w-4 text-amber-500" />
                                <span className="hidden sm:inline">Insights</span>
                            </Button>
                        </SheetTrigger>
                        <SheetContent className={`w-[400px] border-l ${isDark ? 'bg-zinc-900 border-zinc-800 text-zinc-100' : ''}`}>
                            <SheetHeader>
                                <SheetTitle className={isDark ? 'text-zinc-100' : ''}>Banco de Insights</SheetTitle>
                            </SheetHeader>
                            <div className="mt-8 space-y-6">
                                <div className={`p-5 rounded-2xl ${isDark ? 'bg-zinc-800' : 'bg-amber-50 border border-amber-100'}`}>
                                    <p className="font-serif text-lg italic mb-3">"A fé é o firme fundamento das coisas que se esperam..."</p>
                                    <span className="text-xs opacity-50 font-bold uppercase tracking-widest">Hebreus 11:1</span>
                                </div>
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>
            </header>

            {/* Conteúdo do Sermão */}
            <main className="max-w-4xl mx-auto px-6 py-12 pb-32">
                <article className="space-y-12 transition-all duration-300" style={{ fontSize: `${fontSize}px` }}>

                    {/* Introdução */}
                    <section>
                        <h2 className="text-[0.5em] font-bold uppercase tracking-[0.3em] text-amber-500 mb-6 border-l-4 border-amber-500 pl-3">
                            Introdução
                        </h2>
                        <p className="leading-relaxed opacity-90">{sermon.content.intro}</p>
                    </section>

                    {/* Tópicos Revertidos */}
                    <div className="space-y-8">
                        {sermon.content.topics.map((topic: string, index: number) => (
                            <section key={index} className={`p-8 rounded-2xl border-l-4 ${isDark ? 'bg-zinc-900/50 border-zinc-700' : 'bg-zinc-50 border-zinc-200'} transition-all`}>
                                <span className="text-[0.45em] font-bold uppercase tracking-widest text-primary mb-3 block opacity-60">
                                    Ponto {(index + 1).toString().padStart(2, '0')}
                                </span>
                                <h3 className="font-bold leading-tight" style={{ fontSize: '1.2em' }}>
                                    {topic}
                                </h3>
                            </section>
                        ))}
                    </div>

                    {/* Conclusão */}
                    <section>
                        <h2 className="text-[0.5em] font-bold uppercase tracking-[0.3em] text-green-500 mb-6 border-l-4 border-green-500 pl-3">
                            Conclusão
                        </h2>
                        <p className="leading-relaxed opacity-90 font-medium italic">{sermon.content.conclusion}</p>
                    </section>
                </article>
            </main>

        </div>
    );
}
