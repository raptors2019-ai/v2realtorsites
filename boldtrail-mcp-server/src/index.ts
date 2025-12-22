#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

// BoldTrail API Configuration (kvCORE Public API V2)
// Documentation: https://developer.insiderealestate.com/publicv2/reference
const BOLDTRAIL_API_BASE = "https://api.kvcore.com/v2/public";
const API_KEY = process.env.BOLDTRAIL_API_KEY;

// Structured logging helpers (log to stderr to not break JSON-RPC)
function logError(domain: string, action: string, details: Record<string, unknown>) {
  console.error(`[${domain}.${action}]`, JSON.stringify(details));
}

function logInfo(domain: string, action: string, details: Record<string, unknown>) {
  console.error(`[${domain}.${action}]`, JSON.stringify(details));
}

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

  // Handle empty responses (common for DELETE requests)
  const text = await response.text();
  if (!text) {
    return { success: true };
  }

  try {
    return JSON.parse(text);
  } catch {
    return { success: true, message: text };
  }
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
      // kvCORE V2 uses singular /contact/{id}
      const data = await boldtrailRequest(`/contact/${contact_id}`);
      logInfo("mcp.boldtrail", "get_contact.success", { contact_id });
      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(data, null, 2),
          },
        ],
      };
    } catch (error) {
      logError("mcp.boldtrail", "get_contact.failed", {
        contact_id,
        error: error instanceof Error ? error.message : String(error),
      });
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
  "Create a new contact/lead in BoldTrail with preferences",
  {
    first_name: z.string().describe("Contact's first name"),
    last_name: z.string().describe("Contact's last name"),
    email: z.string().email().optional().describe("Contact's email"),
    cell_phone: z.string().optional().describe("Contact's cell phone (PRIORITY - most valuable)"),
    phone: z.string().optional().describe("Contact's general phone"),
    source: z.string().optional().describe("Lead source (e.g., 'sri-collective', 'newhomeshow')"),
    lead_type: z
      .enum(["buyer", "seller", "renter", "investor", "general"])
      .optional()
      .describe("Type of lead"),
    average_price: z.number().optional().describe("Target budget for buyers"),
    average_beds: z.number().optional().describe("Desired bedrooms"),
    average_bathrooms: z.number().optional().describe("Desired bathrooms"),
    city: z.string().optional().describe("Preferred city"),
    hashtags: z
      .array(z.string())
      .optional()
      .describe("Tags for property type, preferences (e.g., 'detached', 'pre-approved')"),
    notes: z.string().optional().describe("Additional notes or preferences JSON"),
  },
  async (params) => {
    try {
      // Map to kvCORE V2 field names (based on API response structure)
      // API uses: cell_phone_1, avg_price, avg_beds, avg_baths, deal_type, primary_city
      const payload: Record<string, unknown> = {
        first_name: params.first_name,
        last_name: params.last_name,
        email: params.email,
        source: params.source,
      };

      // Phone fields - kvCORE uses cell_phone_1
      if (params.cell_phone) {
        payload.cell_phone_1 = params.cell_phone;
      }
      if (params.phone) {
        payload.home_phone = params.phone;
      }

      // Lead type - kvCORE uses deal_type
      if (params.lead_type) {
        payload.deal_type = params.lead_type;
      }

      // Buyer preferences - kvCORE uses avg_* and primary_city
      if (params.average_price) {
        payload.avg_price = params.average_price;
      }
      if (params.average_beds) {
        payload.avg_beds = params.average_beds;
      }
      if (params.average_bathrooms) {
        payload.avg_baths = params.average_bathrooms;
      }
      if (params.city) {
        payload.primary_city = params.city;
      }

      // Tags and notes
      if (params.hashtags && params.hashtags.length > 0) {
        payload.hashtags = params.hashtags;
      }
      if (params.notes) {
        payload.notes = params.notes;
      }

      // kvCORE V2 uses singular /contact
      const data = await boldtrailRequest("/contact", "POST", payload);
      logInfo("mcp.boldtrail", "create_contact.success", {
        email: params.email,
        lead_type: params.lead_type,
        has_phone: !!params.cell_phone,
      });
      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(data, null, 2),
          },
        ],
      };
    } catch (error) {
      logError("mcp.boldtrail", "create_contact.failed", {
        email: params.email,
        error: error instanceof Error ? error.message : String(error),
      });
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
      // kvCORE V2 uses /manuallistings
      let endpoint = `/manuallistings?limit=${limit}`;
      if (status !== "all") {
        endpoint += `&status=${status}`;
      }

      const data = await boldtrailRequest(endpoint);
      logInfo("mcp.boldtrail", "get_listings.success", { limit, status });
      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(data, null, 2),
          },
        ],
      };
    } catch (error) {
      logError("mcp.boldtrail", "get_listings.failed", {
        limit,
        status,
        error: error instanceof Error ? error.message : String(error),
      });
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
// TOOL: Get Activities (DEPRECATED - endpoint not documented in kvCORE V2)
// ============================================
// NOTE: This endpoint is not documented in kvCORE Public API V2.
// Commenting out until we confirm the correct endpoint path.
// If you need activities, consider using the BoldTrail web interface.
/*
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
        `/contact/${contact_id}/activities?limit=${limit}`
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
*/

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
      // kvCORE V2 uses PUT /contact/{id}/action-note
      const data = await boldtrailRequest(
        `/contact/${contact_id}/action-note`,
        "PUT",
        { note }
      );
      logInfo("mcp.boldtrail", "add_contact_note.success", { contact_id });
      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(data, null, 2),
          },
        ],
      };
    } catch (error) {
      logError("mcp.boldtrail", "add_contact_note.failed", {
        contact_id,
        error: error instanceof Error ? error.message : String(error),
      });
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
// TOOL: Delete Contact
// ============================================
server.tool(
  "delete_contact",
  "Delete a contact from BoldTrail CRM",
  {
    contact_id: z.string().describe("The contact ID to delete"),
  },
  async ({ contact_id }) => {
    try {
      // kvCORE V2 uses DELETE /contact/{id}
      const data = await boldtrailRequest(`/contact/${contact_id}`, "DELETE");
      logInfo("mcp.boldtrail", "delete_contact.success", { contact_id });
      return {
        content: [
          {
            type: "text" as const,
            text: `Contact ${contact_id} deleted successfully`,
          },
        ],
      };
    } catch (error) {
      logError("mcp.boldtrail", "delete_contact.failed", {
        contact_id,
        error: error instanceof Error ? error.message : String(error),
      });
      return {
        content: [
          {
            type: "text" as const,
            text: `Error deleting contact: ${error instanceof Error ? error.message : String(error)}`,
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
