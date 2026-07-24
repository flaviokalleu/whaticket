import React from "react";
import {
  MessageSquare,
  Users2,
  Zap,
  BarChart3,
  Check,
  CheckCheck,
} from "lucide-react";

const Feature = ({ icon: Icon, title, description }) => (
  <div className="flex items-start gap-3.5">
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/15">
      <Icon className="h-5 w-5 text-emerald-300" />
    </div>
    <div>
      <p className="text-sm font-semibold text-white">{title}</p>
      <p className="mt-0.5 text-sm leading-relaxed text-slate-400">
        {description}
      </p>
    </div>
  </div>
);

const AuthLayout = ({ children }) => {
  return (
    <div className="flex min-h-screen bg-background">
      {/* Painel de marca */}
      <div className="relative hidden w-1/2 overflow-hidden bg-slate-950 lg:flex lg:flex-col">
        {/* fundo decorativo */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage:
              "radial-gradient(ellipse 80% 60% at 20% -10%, rgba(37,99,235,0.45), transparent 60%), radial-gradient(ellipse 60% 50% at 100% 110%, rgba(16,185,129,0.35), transparent 60%)",
          }}
        />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.6) 1px, transparent 1px)",
            backgroundSize: "56px 56px",
          }}
        />

        <div className="relative z-10 flex h-full flex-col justify-between p-12">
          {/* logo */}
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/40">
              <MessageSquare className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-lg font-bold tracking-tight text-white">
                WhaTicket
              </p>
              <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-slate-500">
                Central de atendimento
              </p>
            </div>
          </div>

          {/* mockup de conversa */}
          <div className="animate-in fade-in slide-in-from-bottom-6 my-10 space-y-3 duration-700">
            <div className="max-w-[75%] rounded-2xl rounded-tl-md bg-white/10 px-4 py-3 ring-1 ring-white/10 backdrop-blur">
              <p className="text-sm text-slate-200">
                Olá! Preciso de ajuda com meu pedido 🙋
              </p>
              <p className="mt-1 text-right text-[10px] text-slate-500">09:41</p>
            </div>
            <div className="ml-auto max-w-[75%] rounded-2xl rounded-tr-md bg-emerald-600/90 px-4 py-3 shadow-lg shadow-emerald-900/30">
              <p className="text-sm text-white">
                Claro! Já localizei aqui, seu pedido sai hoje para entrega 🚚
              </p>
              <p className="mt-1 flex items-center justify-end gap-1 text-right text-[10px] text-emerald-200">
                09:41 <CheckCheck className="h-3 w-3" />
              </p>
            </div>
            <div className="flex items-center gap-2 pl-1 pt-1">
              <span className="flex h-6 items-center gap-1 rounded-full bg-white/10 px-2.5 text-[11px] font-medium text-slate-300 ring-1 ring-white/10">
                <Check className="h-3 w-3 text-emerald-400" /> Atendido em 32s
              </span>
              <span className="flex h-6 items-center rounded-full bg-white/10 px-2.5 text-[11px] font-medium text-slate-300 ring-1 ring-white/10">
                Fila: Suporte
              </span>
            </div>
          </div>

          {/* features */}
          <div className="space-y-6">
            <Feature
              icon={Users2}
              title="Multiatendimento em equipe"
              description="Vários atendentes no mesmo número, com filas, equipes e distribuição automática de conversas."
            />
            <Feature
              icon={Zap}
              title="Automação e campanhas"
              description="Respostas rápidas, mensagens agendadas e campanhas em massa com controle de envio."
            />
            <Feature
              icon={BarChart3}
              title="Gestão completa"
              description="CRM com funil de vendas, kanban de tarefas, SLA, avaliações e relatórios em tempo real."
            />
          </div>

          {/* rodapé */}
          <p className="mt-10 text-xs text-slate-600">
            © {new Date().getFullYear()} WhaTicket — Plataforma de atendimento
            via WhatsApp
          </p>
        </div>
      </div>

      {/* Painel do formulário */}
      <div className="flex w-full items-center justify-center px-4 py-10 lg:w-1/2">
        <div className="animate-in fade-in slide-in-from-bottom-4 w-full max-w-md duration-500">
          {children}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
