const { Client } = require("@modelcontextprotocol/sdk/client/index.js");
const { StdioClientTransport } = require("@modelcontextprotocol/sdk/client/stdio.js");

async function main() {
    const transport = new StdioClientTransport({
        command: "node",
        args: ["src/index.js"],
    });

    const client = new Client(
        {
            name: "example-client",
            version: "1.0.0",
        },
        {
            capabilities: {},
        }
    );

    console.log("Connecting to server...");
    await client.connect(transport);
    console.log("Connected.");

    // List tools
    const tools = await client.listTools();
    console.log("Available tools:", tools.tools.map(t => t.name));

    console.log("\n--- Listing Employees (Expect empty or list) ---");
    // Call list_employees
    try {
        const result = await client.callTool({
            name: "list_employees",
            arguments: {}
        });
        console.log("Result:", result.content[0].text);
    } catch (e) {
        console.error("Error listing employees (likely Auth needed):", e.message);
        if (e.message.includes("Authentication required")) {
            console.log("\nIMPORTANT: You need to run 'node src/auth_setup.js' to authenticate with Google first.");
        }
    }

    // We won't run mutative operations automatically in this test script to avoid polluting the DB endlessly,
    // but if the list works, the connection is solid.

    await client.close();
}

main().catch((err) => {
    // If it fails with "Authentication required" inside the stdio transport, it might just crash or log to stderr.
    console.error("Client error:", err);
});
