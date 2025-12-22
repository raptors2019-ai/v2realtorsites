#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

// BoldTrail API Configuration (kvCORE)
const BOLDTRAIL_API_BASE = "https://api.kvcore.com";
const API_KEY = process.env.BOLDTRAIL_API_KEY;

if (!API_KEY) {
  console.error("BOLDTRAIL_API_KEY environment variable is required");
  process.exit(1);
}

// Helper function to make API requests
async function boldtrailRequest(
  endpoint: string,
  method: "GET" | "POST" | "PUT" | "DELETE" = "GET",
  body?: unknown
): Promise<unknown> {
  const url = `${BOLDTRAIL_API_BASE}${endpoint}`;

  const headers: Record<string, string> = {
    Authorization: `Bearer ${API_KEY}`,
    "Content-Type": "application/json",
    Accept: "application/json",
  };

  const options: RequestInit = {
    method,
    headers,
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(url, options);

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`BoldTrail API error: ${response.status} - ${errorText}`);
  }

  return response.json();
}

// Create MCP Server
const server = new McpServer({
  name: "boldtrail",
  version: "1.0.0",
});

// ============================================
// TOOL: Get Contacts (Leads)
// ============================================
server.tool(
  "get_contacts",
  "Get a list of contacts/leads from BoldTrail CRM",
  {
    limit: z
      .number()
      .optional()
      .default(25)
      .describe("Number of contacts to return (max 100)"),
    offset: z.number().optional().default(0).describe("Offset for pagination"),
    search: z.string().optional().describe("Search term to filter contacts"),
  },
  async ({ limit, offset, search }) => {
    try {
      let endpoint = `/contacts?limit=${limit}&offset=${offset}`;
      if (search) {
        endpoint += `&search=${encodeURIComponent(search)}`;
      }

      const data = await boldtrailRequest(endpoint);
      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(data, null, 2),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text" as const,
            text: `Error fetching contacts: ${error instanceof Error ? error.message : String(error)}`,
          },
        ],
        isError: true,
      };
    }
  }
);

// ============================================
// TOOL: Get Single Contact
// ============================================
server.tool(
  "get_contact",
  "Get details for a specific contact by ID",
  {
    contact_id: z.string().describe("The contact/lead ID"),
  },
  async ({ contact_id }) => {
    try {
      const data = await boldtrailRequest(`/contacts/${contact_id}`);
      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(data, null, 2),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text" as const,
            text: `Error fetching contact: ${error instanceof Error ? error.message : String(error)}`,
          },
        ],
        isError: true,
      };
    }
  }
);

// ============================================
// TOOL: Create Contact
// ============================================
server.tool(
  "create_contact",
  "Create a new contact/lead in BoldTrail",
  {
    first_name: z.string().describe("Contact's first name"),
    last_name: z.string().describe("Contact's last name"),
    email: z.string().email().optional().describe("Contact's email"),
    phone: z.string().optional().describe("Contact's phone number"),
    source: z.string().optional().describe("Lead source"),
    notes: z.string().optional().describe("Notes about the contact"),
  },
  async (params) => {
    try {
      const data = await boldtrailRequest("/contacts", "POST", params);
      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(data, null, 2),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text" as const,
            text: `Error creating contact: ${error instanceof Error ? error.message : String(error)}`,
          },
        ],
        isError: true,
      };
    }
  }
);

// ============================================
// TOOL: Get Listings
// ============================================
server.tool(
  "get_listings",
  "Get property listings from BoldTrail",
  {
    limit: z.number().optional().default(25).describe("Number of listings"),
    status: z
      .enum(["active", "pending", "sold", "all"])
      .optional()
      .default("active")
      .describe("Listing status filter"),
  },
  async ({ limit, status }) => {
    try {
      let endpoint = `/listings?limit=${limit}`;
      if (status !== "all") {
        endpoint += `&status=${status}`;
      }

      const data = await boldtrailRequest(endpoint);
      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(data, null, 2),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text" as const,
            text: `Error fetching listings: ${error instanceof Error ? error.message : String(error)}`,
          },
        ],
        isError: true,
      };
    }
  }
);

// ============================================
// TOOL: Get Activities
// ============================================
server.tool(
  "get_activities",
  "Get recent activities/interactions for a contact",
  {
    contact_id: z.string().describe("The contact ID to get activities for"),
    limit: z.number().optional().default(25).describe("Number of activities"),
  },
  async ({ contact_id, limit }) => {
    try {
      const data = await boldtrailRequest(
        `/contacts/${contact_id}/activities?limit=${limit}`
      );
      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(data, null, 2),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text" as const,
            text: `Error fetching activities: ${error instanceof Error ? error.message : String(error)}`,
          },
        ],
        isError: true,
      };
    }
  }
);

// ============================================
// TOOL: Add Note to Contact
// ============================================
server.tool(
  "add_contact_note",
  "Add a note to a contact in BoldTrail",
  {
    contact_id: z.string().describe("The contact ID"),
    note: z.string().describe("The note content to add"),
  },
  async ({ contact_id, note }) => {
    try {
      const data = await boldtrailRequest(
        `/contacts/${contact_id}/notes`,
        "POST",
        { note }
      );
      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(data, null, 2),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text" as const,
            text: `Error adding note: ${error instanceof Error ? error.message : String(error)}`,
          },
        ],
        isError: true,
      };
    }
  }
);

// ============================================
// Start the server
// ============================================
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("BoldTrail MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
