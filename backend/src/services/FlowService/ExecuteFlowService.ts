import axios from "axios";
import Flow from "../../models/Flow";
import FlowExecution, { FlowLogEntry } from "../../models/FlowExecution";
import Contact from "../../models/Contact";
import formatBody from "../../helpers/Mustache";
import { assertUrlIsSafe } from "../../helpers/SsrfGuard";
import { whatsappProvider } from "../../providers/WhatsApp";
import { logger } from "../../utils/logger";

interface FlowNode {
  id: string;
  type: string;
  data: Record<string, any>;
}

interface FlowEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string | null;
}

const MAX_STEPS = 50;
const MAX_DELAY_SECONDS = 300;

const sleep = (ms: number) =>
  new Promise<void>(resolve => {
    setTimeout(resolve, ms);
  });

// Resolves a dot-path like "message.body" against the execution context.
const resolvePath = (source: Record<string, any>, path: string): unknown => {
  if (!path) return undefined;
  return path
    .split(".")
    .reduce<any>(
      (acc, key) => (acc === null || acc === undefined ? undefined : acc[key]),
      source
    );
};

const evaluateCondition = (
  context: Record<string, any>,
  data: Record<string, any>
): boolean => {
  const actual = resolvePath(context, data.field);
  const expected = data.value;

  switch (data.operator) {
    case "exists":
      return actual !== undefined && actual !== null && actual !== "";
    case "contains":
      return String(actual ?? "")
        .toLowerCase()
        .includes(String(expected ?? "").toLowerCase());
    case "equals":
    default:
      return String(actual ?? "") === String(expected ?? "");
  }
};

const ExecuteFlowService = async (
  flowId: number,
  executionId: number,
  companyId: number
): Promise<void> => {
  const flow = await Flow.findOne({ where: { id: flowId, companyId } });
  const execution = await FlowExecution.findOne({
    where: { id: executionId, companyId }
  });

  if (!flow || !execution) {
    logger.warn(
      `ExecuteFlowService: flow ${flowId} or execution ${executionId} not found for company ${companyId}`
    );
    return;
  }

  const nodes = (flow.nodes || []) as FlowNode[];
  const edges = (flow.edges || []) as FlowEdge[];
  const log: FlowLogEntry[] = [];

  // The execution context starts as the trigger input and accumulates data
  // produced by nodes along the way (e.g. `context.http` from httpRequest).
  const context: Record<string, any> = { ...(execution.input || {}) };

  const appendLog = async (entry: Omit<FlowLogEntry, "at">) => {
    log.push({ ...entry, at: new Date().toISOString() });
    await execution.update({ log: [...log] });
  };

  const findNextNode = (currentId: string, handle?: string): FlowNode | null => {
    const edge = edges.find(e => {
      if (e.source !== currentId) return false;
      if (handle === undefined) return true;
      return (e.sourceHandle || "") === handle;
    });
    if (!edge) return null;
    return nodes.find(n => n.id === edge.target) || null;
  };

  await execution.update({ status: "running" });

  let current = nodes.find(n => n.type === "trigger") || null;

  if (!current) {
    await appendLog({
      nodeId: "-",
      type: "trigger",
      status: "failed",
      message: "Nenhum nó de gatilho encontrado no fluxo."
    });
    await execution.update({ status: "failed", finishedAt: new Date() });
    return;
  }

  let steps = 0;

  try {
    while (current && steps < MAX_STEPS) {
      steps += 1;
      const node = current;
      const data = node.data || {};

      switch (node.type) {
        case "trigger": {
          await appendLog({
            nodeId: node.id,
            type: node.type,
            status: "ok",
            message: `Fluxo iniciado (${data.triggerType || "manual"}).`
          });
          current = findNextNode(node.id);
          break;
        }

        case "sendMessage": {
          const rawNumber = String(data.number || "").replace(/\D/g, "");
          if (!data.whatsappId || !rawNumber) {
            throw new Error(
              "Nó de envio sem conexão ou número configurado."
            );
          }
          const chatId = `${rawNumber}@c.us`;
          const body = formatBody(
            String(data.body || ""),
            { name: context.name || "" } as Contact
          );
          await whatsappProvider.sendMessage(
            Number(data.whatsappId),
            chatId,
            body
          );
          await appendLog({
            nodeId: node.id,
            type: node.type,
            status: "ok",
            message: `Mensagem enviada para ${rawNumber}.`
          });
          current = findNextNode(node.id);
          break;
        }

        case "delay": {
          const seconds = Math.min(
            Math.max(Number(data.seconds) || 0, 0),
            MAX_DELAY_SECONDS
          );
          await appendLog({
            nodeId: node.id,
            type: node.type,
            status: "ok",
            message: `Aguardando ${seconds}s.`
          });
          await sleep(seconds * 1000);
          current = findNextNode(node.id);
          break;
        }

        case "condition": {
          const result = evaluateCondition(context, data);
          await appendLog({
            nodeId: node.id,
            type: node.type,
            status: "ok",
            message: `Condição "${data.field} ${data.operator} ${
              data.value ?? ""
            }" avaliada como ${result ? "verdadeira" : "falsa"}.`
          });
          current = findNextNode(node.id, result ? "true" : "false");
          break;
        }

        case "httpRequest": {
          const url = String(data.url || "");
          await assertUrlIsSafe(url);
          const method = String(data.method || "GET").toUpperCase();
          const response = await axios.request({
            url,
            method: method === "POST" ? "POST" : "GET",
            data: method === "POST" ? data.body : undefined,
            timeout: 10000,
            validateStatus: () => true
          });
          context.http = { status: response.status, data: response.data };
          await appendLog({
            nodeId: node.id,
            type: node.type,
            status: "ok",
            message: `${method} ${url} respondeu ${response.status}.`
          });
          current = findNextNode(node.id);
          break;
        }

        default: {
          await appendLog({
            nodeId: node.id,
            type: node.type || "desconhecido",
            status: "skipped",
            message: `Tipo de nó não suportado, ignorado.`
          });
          current = findNextNode(node.id);
          break;
        }
      }
    }

    if (steps >= MAX_STEPS) {
      await appendLog({
        nodeId: "-",
        type: "engine",
        status: "failed",
        message: `Limite de ${MAX_STEPS} passos atingido (possível ciclo).`
      });
      await execution.update({ status: "failed", finishedAt: new Date() });
      return;
    }

    await execution.update({ status: "completed", finishedAt: new Date() });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    logger.error({ info: "ExecuteFlowService failed", flowId, err });
    await appendLog({
      nodeId: current?.id || "-",
      type: current?.type || "engine",
      status: "failed",
      message
    });
    await execution.update({ status: "failed", finishedAt: new Date() });
  }
};

export default ExecuteFlowService;
