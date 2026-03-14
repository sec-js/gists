import { type Plugin, tool } from "@opencode-ai/plugin"

type CommandInfo = {
  name: string
  description?: string
  agent?: string
  model?: string
  template: string
  subtask?: boolean
}

type AgentInfo = {
  name: string
  mode: "subagent" | "primary" | "all"
  model?: {
    providerID: string
    modelID: string
  }
}

const NUMBERED_PLACEHOLDER_REGEX = /\$\d+/g
const ARGUMENTS_PLACEHOLDER = "$ARGUMENTS"
const SHELL_SUBSTITUTION_REGEX = /!`([^`]+)`/g
const PROMPT_REFERENCE_REGEX = /(?<![\w`])@(\.?[^\s`,.]*(?:\.[^\s`,.]+)*)/g

function parseModel(model: string) {
  const [providerID, ...rest] = model.split("/")
  return {
    providerID,
    modelID: rest.join("/"),
  }
}

function commandUnsupportedReason(command: CommandInfo) {
  if (NUMBERED_PLACEHOLDER_REGEX.test(command.template)) {
    NUMBERED_PLACEHOLDER_REGEX.lastIndex = 0
    return "numbered argument placeholders like $1"
  }
  if (command.template.includes(ARGUMENTS_PLACEHOLDER)) {
    return "$ARGUMENTS placeholder substitution"
  }
  if (SHELL_SUBSTITUTION_REGEX.test(command.template)) {
    SHELL_SUBSTITUTION_REGEX.lastIndex = 0
    return "shell substitutions like !`...`"
  }
  if (PROMPT_REFERENCE_REGEX.test(command.template)) {
    PROMPT_REFERENCE_REGEX.lastIndex = 0
    return "prompt references like @file or @agent"
  }
  return
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error)
}

async function getCommand(client: any, name: string): Promise<CommandInfo | undefined> {
  const result = await client.config.get()
  if (result.error) throw new Error(`Failed to load config: ${getErrorMessage(result.error)}`)

  const match = result.data.command?.[name]
  if (!match) return
  return {
    name,
    description: match.description,
    agent: match.agent,
    model: match.model,
    template: match.template,
    subtask: match.subtask,
  }
}

async function listCommands(client: any) {
  const result = await client.config.get()
  if (result.error) throw new Error(`Failed to load config: ${getErrorMessage(result.error)}`)
  return Object.keys(result.data.command ?? {}).sort()
}

async function getAgents(client: any): Promise<AgentInfo[]> {
  const result = await client.app.agents()
  if (result.error) throw new Error(`Failed to list agents: ${getErrorMessage(result.error)}`)
  return result.data as AgentInfo[]
}

async function getParentAssistantModel(client: any, sessionID: string, messageID: string) {
  const result = await client.session.message({
    path: { id: sessionID, messageID },
  })
  if (result.error) {
    throw new Error(`Failed to load invoking message: ${getErrorMessage(result.error)}`)
  }
  if (result.data.info.role !== "assistant") {
    throw new Error("Delegate tool must be called from an assistant message")
  }
  return {
    providerID: result.data.info.providerID,
    modelID: result.data.info.modelID,
  }
}

async function createChildSession(client: any, parentID: string, title: string) {
  const result = await client.session.create({
    body: {
      parentID,
      title,
    },
  })
  if (result.error) throw new Error(`Failed to create child session: ${getErrorMessage(result.error)}`)
  return result.data
}

async function getReusableSession(client: any, taskID: string) {
  const result = await client.session.get({
    path: { id: taskID },
  })
  if (result.error) return
  return result.data
}

function extractResultText(result: any) {
  return result.parts.findLast((part: any) => part.type === "text")?.text ?? ""
}

export const DelegateToolPlugin: Plugin = async ({ client }) => {
  return {
    tool: {
      delegate: tool({
        description: "Delegate a supported custom command to a child subagent session",
        args: {
          command: tool.schema.string().describe("Name of the custom command to execute without the leading slash"),
          task_id: tool.schema.string().optional().describe("Existing delegated task session ID to resume"),
        },
        async execute(args, context) {
          const command = await getCommand(client, args.command)
          if (!command) {
            const available = (await listCommands(client)).join(", ")
            throw new Error(
              available
                ? `Command '${args.command}' not found. Available commands: ${available}`
                : `Command '${args.command}' not found.`,
            )
          }

          const unsupported = commandUnsupportedReason(command)
          if (unsupported) {
            throw new Error(`Command '${command.name}' is not supported by delegate because it uses ${unsupported}.`)
          }

          if (!command.agent) {
            throw new Error(`Command '${command.name}' is not supported by delegate because it does not specify an agent.`)
          }

          const agents = await getAgents(client)
          const agent = agents.find((item) => item.name === command.agent)
          if (!agent) {
            throw new Error(`Command '${command.name}' references unknown agent '${command.agent}'.`)
          }

          const shouldRunAsSubtask = command.subtask === true || (agent.mode === "subagent" && command.subtask !== false)
          if (!shouldRunAsSubtask) {
            throw new Error(
              `Command '${command.name}' is not supported by delegate because it does not resolve to a subagent task.`,
            )
          }

          const model = command.model
            ? parseModel(command.model)
            : agent.model ?? (await getParentAssistantModel(client, context.sessionID, context.messageID))

          const session = args.task_id
            ? await getReusableSession(client, args.task_id).then(
                (existing) =>
                  existing ??
                  createChildSession(client, context.sessionID, `${command.description ?? command.name} (@${agent.name} subagent)`),
              )
            : await createChildSession(
                client,
                context.sessionID,
                `${command.description ?? command.name} (@${agent.name} subagent)`,
              )

          context.metadata({
            title: command.description ?? command.name,
            metadata: {
              sessionId: session.id,
              agent: agent.name,
              model,
              command: command.name,
            },
          })

          const prompt = await client.session.prompt({
            path: { id: session.id },
            body: {
              agent: agent.name,
              model,
              parts: [
                {
                  type: "text",
                  text: command.template,
                },
              ],
            },
          })

          if (prompt.error) {
            throw new Error(`Delegated command '${command.name}' failed: ${getErrorMessage(prompt.error)}`)
          }

          const text = extractResultText(prompt.data)
          return [
            `task_id: ${session.id} (for resuming to continue this task if needed)`,
            "",
            "<task_result>",
            text,
            "</task_result>",
          ].join("\n")
        },
      }),
    },
  }
}

export default DelegateToolPlugin
