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
        <div className={`min-h-screen transition-colors duration-500 ${isDark ? 'bg-[#0a0c14] text-zinc-100' : 'bg-zinc-50 text-zinc-900'}`}>

            {/* Barra de Controle Superior */}
            <header className={`sticky top-0 z-50 flex items-center justify-between px-6 py-4 border-b backdrop-blur-xl ${isDark ? 'bg-[#0a0c14]/90 border-white/5' : 'bg-white/90 border-zinc-200'}`}>
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="hover:bg-white/10 rounded-full">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div className="hidden md:block">
                        <h1 className="font-bold text-sm tracking-tight">{sermon.title}</h1>
                        <p className="text-[10px] uppercase tracking-widest opacity-40 font-bold">{sermon.series}</p>
                    </div>
                </div>

                {/* Cronômetro Central Premium */}
                <div className={`flex items-center gap-6 px-6 py-2 rounded-full border shadow-2xl transition-all ${isDark ? 'bg-[#161b2c] border-white/10 shadow-black/40' : 'bg-white border-zinc-200'}`}>
                    <div className="flex items-center gap-3 border-r pr-4 border-white/5">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-full hover:bg-white/10"
                            onClick={() => setIsRunning(!isRunning)}
                        >
                            {isRunning ? <Pause className="h-4 w-4 fill-current" /> : <Play className="h-4 w-4 ml-0.5 fill-current" />}
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-full hover:bg-destructive/20 text-destructive/80"
                            onClick={() => { setIsRunning(false); setTime(0); }}
                        >
                            <RotateCcw className="h-4 w-4" />
                        </Button>
                    </div>
                    <span className={`font-mono text-3xl font-black tabular-nums tracking-tighter ${isRunning ? 'text-blue-400 drop-shadow-[0_0_15px_rgba(96,165,250,0.5)]' : 'opacity-30'}`}>
                        {formatTime(time)}
                    </span>
                </div>

                {/* Controles da Direita */}
                <div className="flex items-center gap-3">
                    <div className="hidden lg:flex items-center gap-3 bg-white/5 px-4 py-1.5 rounded-full border border-white/5">
                        <Type className="h-3 w-3 opacity-40" />
                        <div className="w-20">
                            <Slider
                                value={[fontSize]}
                                min={18}
                                max={40}
                                step={1}
                                onValueChange={(val) => setFontSize(val[0])}
                            />
                        </div>
                    </div>

                    <Button variant="ghost" size="icon" onClick={() => setIsDark(!isDark)} className="rounded-full hover:bg-white/10">
                        {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                    </Button>

                    <Sheet>
                        <SheetTrigger asChild>
                            <Button variant="outline" size="sm" className="rounded-full gap-2 bg-blue-500/10 border-blue-500/20 text-blue-400 hover:bg-blue-500 hover:text-white transition-all">
                                <Lightbulb className="h-4 w-4" />
                                <span className="hidden sm:inline font-bold">Insights</span>
                            </Button>
                        </SheetTrigger>
                        <SheetContent className={`w-[400px] border-l ${isDark ? 'bg-[#0f121d] border-white/5 text-zinc-100' : ''}`}>
                            <SheetHeader>
                                <SheetTitle className={isDark ? 'text-zinc-100' : ''}>Insights para a Pregação</SheetTitle>
                            </SheetHeader>
                            <div className="mt-8 space-y-6">
                                <div className="p-5 rounded-[2rem] bg-blue-500/5 border border-blue-500/10">
                                    <p className="font-serif text-lg italic mb-3 opacity-90 leading-relaxed">"Onde abundou o pecado, superabundou a graça."</p>
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">Romanos 5:20</span>
                                </div>
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>
            </header>

            {/* Conteúdo do Sermão Premium */}
            <main className="max-w-4xl mx-auto px-6 py-16 pb-40">
                <article className="space-y-12 transition-all duration-300" style={{ fontSize: `${fontSize}px` }}>

                    {/* Introdução Estilizada */}
                    <section className="relative">
                        <div className="absolute -left-6 top-0 bottom-0 w-1 bg-gradient-to-b from-amber-500 to-transparent rounded-full opacity-50" />
                        <h2 className="text-[0.5em] font-black uppercase tracking-[0.3em] text-amber-500 mb-6 flex items-center gap-3">
                            <span className="h-px w-8 bg-amber-500/30" />
                            Introdução
                        </h2>
                        <p className="leading-relaxed font-medium opacity-90 first-letter:text-5xl first-letter:font-bold first-letter:mr-3 first-letter:float-left">
                            {sermon.content.intro}
                        </p>
                    </section>

                    {/* Tópicos no padrão Anexo 2 */}
                    <div className="space-y-8">
                        {sermon.content.topics.map((topic: string, index: number) => (
                            <section key={index} className={`relative p-8 rounded-[2.5rem] border transition-all duration-500 overflow-hidden group ${isDark ? 'bg-[#121624] border-white/5 hover:border-blue-500/30' : 'bg-white border-zinc-200 shadow-xl'}`}>
                                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-blue-500 transition-all group-hover:w-2" />

                                <span className="text-[0.45em] font-black uppercase tracking-[0.2em] text-blue-500 mb-4 block opacity-70">
                                    Ponto {(index + 1).toString().padStart(2, '0')}
                                </span>

                                <h3 className="font-bold leading-tight text-zinc-100 drop-shadow-sm" style={{ fontSize: '1.2em' }}>
                                    {topic}
                                </h3>
                            </section>
                        ))}
                    </div>

                    {/* Conclusão Estilizada */}
                    <section className="relative p-10 rounded-[3rem] bg-gradient-to-br from-green-500/10 to-transparent border border-green-500/10">
                        <h2 className="text-[0.5em] font-black uppercase tracking-[0.3em] text-green-500 mb-6">Conclusão</h2>
                        <p className="leading-relaxed font-bold italic opacity-90 border-l-2 border-green-500/30 pl-6">
                            {sermon.content.conclusion}
                        </p>
                    </section>
                </article>
            </main>

        </div>
    );
}
