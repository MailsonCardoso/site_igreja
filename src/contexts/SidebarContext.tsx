import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface SidebarContextType {
    collapsed: boolean;
    setCollapsed: (collapsed: boolean) => void;
    toggleCollapsed: () => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: ReactNode }) {
    // Inicializa do localStorage ou false por padrão
    const [collapsed, setCollapsedState] = useState<boolean>(() => {
        const saved = localStorage.getItem("sidebar-collapsed");
        return saved === "true";
    });

    // Salva no localStorage quando muda
    useEffect(() => {
        localStorage.setItem("sidebar-collapsed", String(collapsed));
    }, [collapsed]);

    const setCollapsed = (value: boolean) => {
        setCollapsedState(value);
    };

    const toggleCollapsed = () => {
        setCollapsedState(prev => !prev);
    };

    return (
        <SidebarContext.Provider value={{ collapsed, setCollapsed, toggleCollapsed }}>
            {children}
        </SidebarContext.Provider>
    );
}

export function useSidebar() {
    const context = useContext(SidebarContext);
    if (context === undefined) {
        throw new Error("useSidebar must be used within a SidebarProvider");
    }
    return context;
}
