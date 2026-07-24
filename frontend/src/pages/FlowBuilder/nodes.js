import React from "react";
import { Handle, Position } from "@xyflow/react";
import { Zap, MessageSquare, Clock, GitBranch, Globe } from "lucide-react";

import { cn } from "../../lib/utils";

const shell =
  "min-w-[190px] rounded-xl border bg-card px-3 py-2.5 shadow-sm transition-shadow";

const NodeShell = ({ selected, accent, icon: Icon, title, summary }) => (
  <div
    className={cn(
      shell,
      selected ? "ring-2 ring-primary ring-offset-2" : "hover:shadow-md"
    )}
  >
    <div className="flex items-center gap-2">
      <span
        className={cn(
          "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg",
          accent
        )}
      >
        <Icon className="h-4 w-4" />
      </span>
      <span className="text-sm font-semibold">{title}</span>
    </div>
    <p className="mt-1 truncate text-xs text-muted-foreground">
      {summary || "Sem configuração"}
    </p>
  </div>
);

export const TriggerNode = ({ data, selected }) => (
  <>
    <NodeShell
      selected={selected}
      accent="bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300"
      icon={Zap}
      title="Gatilho"
      summary={data.triggerType === "webhook" ? "Via webhook" : "Manual"}
    />
    <Handle type="source" position={Position.Bottom} />
  </>
);

export const SendMessageNode = ({ data, selected }) => (
  <>
    <Handle type="target" position={Position.Top} />
    <NodeShell
      selected={selected}
      accent="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
      icon={MessageSquare}
      title="Enviar mensagem"
      summary={data.number ? `Para ${data.number}` : "Sem destinatário"}
    />
    <Handle type="source" position={Position.Bottom} />
  </>
);

export const DelayNode = ({ data, selected }) => (
  <>
    <Handle type="target" position={Position.Top} />
    <NodeShell
      selected={selected}
      accent="bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300"
      icon={Clock}
      title="Atraso"
      summary={`Aguardar ${data.seconds || 0}s`}
    />
    <Handle type="source" position={Position.Bottom} />
  </>
);

export const ConditionNode = ({ data, selected }) => (
  <>
    <Handle type="target" position={Position.Top} />
    <NodeShell
      selected={selected}
      accent="bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300"
      icon={GitBranch}
      title="Condição"
      summary={
        data.field
          ? `${data.field} ${data.operator || "equals"} ${data.value ?? ""}`
          : "Sem regra"
      }
    />
    <div className="mt-1 flex justify-between px-2 text-[10px] font-medium">
      <span className="text-emerald-600">Sim</span>
      <span className="text-rose-600">Não</span>
    </div>
    <Handle
      type="source"
      position={Position.Bottom}
      id="true"
      style={{ left: "25%" }}
    />
    <Handle
      type="source"
      position={Position.Bottom}
      id="false"
      style={{ left: "75%" }}
    />
  </>
);

export const HttpRequestNode = ({ data, selected }) => (
  <>
    <Handle type="target" position={Position.Top} />
    <NodeShell
      selected={selected}
      accent="bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300"
      icon={Globe}
      title="Requisição HTTP"
      summary={data.url ? `${data.method || "GET"} ${data.url}` : "Sem URL"}
    />
    <Handle type="source" position={Position.Bottom} />
  </>
);

export const nodeTypes = {
  trigger: TriggerNode,
  sendMessage: SendMessageNode,
  delay: DelayNode,
  condition: ConditionNode,
  httpRequest: HttpRequestNode,
};

export const NODE_DEFAULTS = {
  sendMessage: { whatsappId: "", number: "", body: "" },
  delay: { seconds: 5 },
  condition: { field: "", operator: "equals", value: "" },
  httpRequest: { method: "GET", url: "", body: "" },
};

export const NODE_LABELS = {
  trigger: "Gatilho",
  sendMessage: "Enviar mensagem",
  delay: "Atraso",
  condition: "Condição",
  httpRequest: "Requisição HTTP",
};
