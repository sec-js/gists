import type { Plugin } from "@opencode-ai/plugin";

export const DelegateToolPlugin: Plugin = async ({ app, client }) => {
  // Register the delegate custom tool
  app.tools.register(
    "delegate",
    {
      description: "Delegate execution to an existing custom command, optionally resuming an existing task",
      args: {
        command: app.zod
          .string()
          .describe("Name of the custom command to execute (without leading /)"),
        task_id: app.zod
          .string()
          .optional()
          .describe("Optional existing task ID to resume execution with the command")
      },
      async execute({ command, task_id }) {
        // Get command from official OpenCode command registry
        const targetCommand = app.commands.get(command);
        if (!targetCommand) {
          const availableCommands = app.commands.list().map(c => c.name).join(", ");
          throw new Error(`Command '${command}' not found. Available commands: ${availableCommands}`);
        }

        // Validate command has content
        if (!targetCommand.content) {
          throw new Error(`Command '${command}' has no defined prompt content`);
        }

        // Invoke the built-in task tool with command configuration
        const taskResult = await client.tools.task({
          subagent_type: targetCommand.agent || "explore",
          description: targetCommand.description || `Execute ${command} command`,
          prompt: targetCommand.content,
          command: command,
          ...(task_id ? { task_id } : {})
        });

        // Pass full native task tool result directly with 100% fidelity
        return taskResult;
      }
    }
  );

  return {};
};
