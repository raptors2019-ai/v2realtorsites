# MVP Tool Design: Obsidian AI Agent

## Design Philosophy

Based on [Anthropic's best practices for writing tools for agents](https://www.anthropic.com/engineering/writing-tools-for-agents), our MVP uses **3 consolidated, workflow-oriented tools** instead of many single-purpose tools.

**Core Principle:** "Fewer, smarter tools beat many simple ones"

### Key Design Principles

1. **Consolidate operations into high-impact tools** - Group related operations by workflow, not just CRUD actions
2. **Match user workflows, not just APIs** - Tools should represent how users think about their tasks
3. **Clear namespacing** - All Obsidian-specific tools prefixed with `obsidian_`
4. **Response format flexibility** - Support detailed vs concise responses to manage token usage
5. **Natural language over IDs** - Use human-readable paths and names to reduce hallucinations
6. **Helpful error messages** - Guide agents toward correct patterns with actionable feedback

---

## The Three-Tool Architecture

```
1. obsidian_query_vault       → Discovery & Search (read-only)
2. obsidian_vault_manager     → All Modifications (notes + folders + bulk)
3. obsidian_get_context       → Reading with Context (workflow-oriented reading)
```

**Why 3 Tools?**

- ✅ Cleanest separation: discover → read → modify
- ✅ Fewest tools following Anthropic's guidance
- ✅ Bulk operations naturally integrated via parameters
- ✅ Folder operations integrated (they're vault organization, not separate workflow)
- ✅ Each tool has clear, distinct purpose
- ✅ Reduces agent confusion about tool selection

---

## Tool 1: `obsidian_query_vault`

### Purpose

All discovery, search, and listing operations (read-only). Use this tool when you need to **find** something in the vault.

### When to Use

- Finding notes by content or metadata
- Exploring vault structure
- Discovering relationships between notes
- Listing recently changed files

### Parameters

```typescript
/**
 * Query the Obsidian vault for discovery and search operations.
 *
 * This is a read-only tool for finding and discovering vault content.
 * Use obsidianGetContext to read the actual content of notes.
 *
 * @example
 * // 1. Find notes about machine learning
 * await obsidianQueryVault({
 *   queryType: "semantic_search",
 *   query: "machine learning"
 * })
 *
 * @example
 * // 2. List all files in Projects folder
 * await obsidianQueryVault({
 *   queryType: "list_structure",
 *   path: "Projects"
 * })
 *
 * @example
 * // 3. Find notes related to "Architecture Decisions.md"
 * await obsidianQueryVault({
 *   queryType: "find_related",
 *   referenceNote: "Architecture Decisions.md"
 * })
 *
 * @example
 * // 4. Find notes tagged 'urgent' from last week
 * await obsidianQueryVault({
 *   queryType: "search_by_metadata",
 *   filters: { tags: ["urgent"], dateRange: { days: 7 } }
 * })
 *
 * @example
 * // 5. See what files changed recently
 * await obsidianQueryVault({
 *   queryType: "recent_changes",
 *   limit: 20
 * })
 */
export async function obsidianQueryVault({
  queryType,
  query = null,
  path = "",
  referenceNote = null,
  filters = null,
  limit = 10,
  responseFormat = "detailed"
}: {
  queryType: "semantic_search" | "list_structure" | "find_related" | "search_by_metadata" | "recent_changes";
  query?: string | null;              // Search query (required for semantic_search, search_by_metadata)
  path?: string;                       // Specific folder path (for list_structure)
  referenceNote?: string | null;       // Note path for finding related (find_related)
  filters?: Record<string, any> | null; // Metadata filters: {tags: [...], dateRange: {...}}
  limit?: number;                      // Max results to return
  responseFormat?: "detailed" | "concise";
}): Promise<QueryResult> {
  // Implementation
}
```

### Response Format

```typescript
interface QueryResult {
  results: NoteInfo[];
  totalFound: number;
  truncated: boolean;
  suggestion?: string;  // If truncated: "Try narrowing by date or tags"
}

interface NoteInfo {
  // Always included (concise mode)
  path: string;           // "Projects/ML Project.md"
  title: string;          // "ML Project"
  relevance: number;      // 0.95 (for semantic search)

  // Detailed mode only
  excerpt?: string;       // First 200 chars or matching context
  tags?: string[];
  created?: string;
  modified?: string;
}
```

### Token Efficiency

- **Concise mode**: ~50 tokens per result
- **Detailed mode**: ~200 tokens per result
- 67% token reduction when using concise mode for large result sets

### Error Handling Examples

```typescript
// No results found
{
  results: [],
  totalFound: 0,
  truncated: false,
  suggestion: "No notes found matching 'quantum physics'. Try broader terms like 'physics' or check spelling."
}

// Results truncated
{
  results: [...],  // First 10 results
  totalFound: 247,
  truncated: true,
  suggestion: "Showing 10 of 247 results. Try narrowing your search with filters={ tags: ['specific-tag'] } or a more specific query."
}
```

---

## Tool 2: `obsidian_vault_manager`

### Purpose

All modification operations (notes, folders, organization). Use this tool when you need to **change** something in the vault.

### When to Use

- Creating, updating, deleting notes
- Creating, deleting, moving folders
- Moving notes between folders
- Bulk operations on multiple notes/folders
- Organizing vault structure

### Parameters

```typescript
type VaultOperation =
  // Note operations
  | "create_note"
  | "update_note"
  | "append_note"
  | "delete_note"
  | "move_note"
  // Folder operations
  | "create_folder"
  | "delete_folder"
  | "move_folder"
  // Bulk operations
  | "bulk_tag"              // Add/remove tags from multiple notes
  | "bulk_move"             // Move multiple notes to folder
  | "bulk_update_metadata"; // Update frontmatter on multiple notes

/**
 * Manage notes, folders, and perform bulk operations on the Obsidian vault.
 *
 * This tool handles all vault modifications. Use obsidianQueryVault first
 * to find notes you want to modify.
 *
 * @example
 * // 1. Create note with frontmatter
 * await obsidianVaultManager({
 *   operation: "create_note",
 *   target: "Projects/New Project.md",
 *   content: "# New Project\n\nProject details...",
 *   metadata: { tags: ["project", "active"], status: "planning" }
 * })
 *
 * @example
 * // 2. Append to daily note
 * await obsidianVaultManager({
 *   operation: "append_note",
 *   target: "Daily/2025-01-15.md",
 *   content: "\n## Meeting Notes\n- Discussed architecture"
 * })
 *
 * @example
 * // 3. Update entire note
 * await obsidianVaultManager({
 *   operation: "update_note",
 *   target: "Draft.md",
 *   content: "# Revised Draft\n\nCompletely new content..."
 * })
 *
 * @example
 * // 4. Move note to archive
 * await obsidianVaultManager({
 *   operation: "move_note",
 *   target: "Old Project.md",
 *   destination: "Archive/2024"
 * })
 *
 * @example
 * // 5. Bulk tag multiple notes
 * await obsidianVaultManager({
 *   operation: "bulk_tag",
 *   targets: ["note1.md", "note2.md", "note3.md"],
 *   metadata: { tags: ["reviewed"] }
 * })
 *
 * @example
 * // 6. Create nested folder structure
 * await obsidianVaultManager({
 *   operation: "create_folder",
 *   target: "Projects/2025/Q1",
 *   createFolders: true
 * })
 *
 * @example
 * // 7. Delete note (requires confirmation)
 * await obsidianVaultManager({
 *   operation: "delete_note",
 *   target: "Draft.md",
 *   confirmDestructive: true
 * })
 *
 * @example
 * // 8. Bulk move notes to new folder
 * await obsidianVaultManager({
 *   operation: "bulk_move",
 *   targets: ["note1.md", "note2.md"],
 *   destination: "Archive/Old Projects"
 * })
 */
export async function obsidianVaultManager({
  operation,
  target = null,
  targets = null,
  content = null,
  destination = null,
  metadata = null,
  metadataChanges = null,
  confirmDestructive = false,
  createFolders = true
}: {
  operation: VaultOperation;
  target?: string | null;           // Note/folder path for single operations
  targets?: string[] | null;        // Multiple paths for bulk operations
  content?: string | null;          // Note content (create, update, append)
  destination?: string | null;      // Target folder (move operations)
  metadata?: Record<string, any> | null;        // Frontmatter: {tags: [...], title: "...", ...}
  metadataChanges?: Record<string, any> | null; // For bulk_update_metadata
  confirmDestructive?: boolean;     // Required true for delete operations
  createFolders?: boolean;          // Auto-create parent folders if missing
}): Promise<OperationResult> {
  // Implementation
}
```

### Response Format

```typescript
interface OperationResult {
  success: boolean;
  operation: string;
  affectedCount: number;        // Number of items affected
  affectedPaths: string[];      // Paths that were modified
  message: string;              // Human-readable summary
  warnings?: string[];          // Any non-fatal issues

  // For bulk operations
  partialSuccess?: boolean;     // True if some succeeded, some failed
  failures?: Array<{            // Failed items with reasons
    path: string;
    reason: string;
  }>;
}
```

### Error Handling Examples

```typescript
// Missing confirmation for destructive operation
{
  success: false,
  message: "Invalid operation: delete_note requires confirmDestructive=true. This prevents accidental data loss. Set confirmDestructive=true to proceed.",
  affectedCount: 0,
  affectedPaths: []
}

// Missing parent folder
{
  success: false,
  message: "Cannot create note at 'Projects/Q1/note.md': folder 'Projects/Q1' doesn't exist. Set createFolders=true to automatically create missing folders, or use operation='create_folder' first.",
  affectedCount: 0,
  affectedPaths: []
}

// Partial bulk operation success
{
  success: true,
  partialSuccess: true,
  operation: "bulk_tag",
  affectedCount: 3,
  affectedPaths: ["note3.md", "note4.md", "note5.md"],
  message: "Bulk operation partially completed: 3 of 5 notes updated successfully.",
  failures: [
    { path: "note1.md", reason: "File not found" },
    { path: "note2.md", reason: "Permission denied" }
  ]
}
```

### Safety Mechanisms

1. **Destructive operations require confirmation**: Delete operations must set `confirmDestructive=true`
2. **Partial success reporting**: Bulk operations report which items succeeded and which failed
3. **Automatic folder creation**: Optional `createFolders` parameter prevents multi-step workflows
4. **Clear warnings**: Non-fatal issues reported in `warnings` field

---

## Tool 3: `obsidian_get_context`

### Purpose

Workflow-oriented reading that compiles relevant context. Use this tool when you need to **read** content with surrounding context.

### When to Use

- Reading note content with metadata
- Gathering related information for synthesis
- Reading multiple notes together
- Exploring note relationships via backlinks
- Getting daily notes

### Parameters

```typescript
type ContextType =
  | "read_note"           // Read single note with metadata
  | "read_multiple"       // Read several specific notes
  | "gather_related"      // Read note + its related notes
  | "daily_note"          // Get today's (or specific) daily note
  | "note_with_backlinks"; // Read note + all notes linking to it

/**
 * Retrieve note content with optional context for analysis and synthesis.
 *
 * This tool is optimized for reading workflows where you need content
 * plus surrounding context (metadata, related notes, backlinks).
 *
 * Use obsidianQueryVault to find notes first, then use this tool
 * to read their content.
 *
 * @example
 * // 1. Read single note with metadata
 * await obsidianGetContext({
 *   contextType: "read_note",
 *   target: "Projects/ML Project.md",
 *   includeMetadata: true
 * })
 *
 * @example
 * // 2. Read note and its related notes
 * await obsidianGetContext({
 *   contextType: "gather_related",
 *   target: "Architecture.md",
 *   maxRelated: 5
 * })
 *
 * @example
 * // 3. Get today's daily note
 * await obsidianGetContext({
 *   contextType: "daily_note",
 *   date: "today"
 * })
 *
 * @example
 * // 4. Read multiple notes for comparison
 * await obsidianGetContext({
 *   contextType: "read_multiple",
 *   targets: ["note1.md", "note2.md", "note3.md"]
 * })
 *
 * @example
 * // 5. Read note with all backlinks
 * await obsidianGetContext({
 *   contextType: "note_with_backlinks",
 *   target: "Concepts/Zettelkasten.md"
 * })
 *
 * @example
 * // 6. Read note in concise format (save tokens)
 * await obsidianGetContext({
 *   contextType: "read_note",
 *   target: "Long Article.md",
 *   responseFormat: "concise"
 * })
 */
export async function obsidianGetContext({
  contextType,
  target = null,
  targets = null,
  date = null,
  includeMetadata = true,
  includeBacklinks = false,
  maxRelated = 3,
  responseFormat = "detailed"
}: {
  contextType: ContextType;
  target?: string | null;           // Primary note path
  targets?: string[] | null;        // Multiple note paths (read_multiple)
  date?: string | null;             // For daily_note: "2025-01-15" or "today"
  includeMetadata?: boolean;        // Include frontmatter
  includeBacklinks?: boolean;       // Include linking note info
  maxRelated?: number;              // Max related notes to include
  responseFormat?: "detailed" | "concise";
}): Promise<ContextResult> {
  // Implementation
}
```

### Response Format

```typescript
interface ContextResult {
  primaryNote: NoteContent;
  relatedNotes?: NoteContent[];
  backlinks?: BacklinkInfo[];
  metadataSummary?: Record<string, any>;  // Compiled metadata (tags, dates, etc.)
  tokenEstimate: number;                  // Approximate tokens in response
}

interface NoteContent {
  path: string;
  title: string;
  content: string;
  metadata?: Record<string, any>;
  wordCount: number;
}

interface BacklinkInfo {
  notePath: string;
  noteTitle: string;
  context: string;  // Surrounding text where link appears
}
```

### Why Separate from `obsidian_query_vault`?

**Key Difference:**

- `obsidian_query_vault` returns **summaries** and **excerpts** (discovery)
- `obsidian_get_context` returns **full content** (reading)

This separation:

- ✅ Prevents token waste from reading full notes during search
- ✅ Follows Anthropic's pattern of `search_logs` (summaries) vs `get_customer_context` (full data)
- ✅ Enables two-step workflow: find → read
- ✅ Provides workflow-oriented context (related notes, backlinks)

---

## Rationale: Why These 3 Tools?

### 1. Follows Anthropic's Core Principle

> "Fewer, smarter tools beat many simple ones"

Three tools is the minimum viable set covering all workflows:

- **Query** (find things) → `obsidian_query_vault`
- **Read** (get content) → `obsidian_get_context`
- **Modify** (change things) → `obsidian_vault_manager`

### 2. Bulk Operations Belong in Manager

Bulk is just a parameter variation, not a separate workflow:

```python
# Single operation
operation="update_note", target="note.md"

# Bulk operation
operation="bulk_update_metadata", targets=["note1.md", "note2.md", "note3.md"]
```

**Benefits:**

- ✅ No artificial tool separation
- ✅ Agent doesn't choose between similar tools
- ✅ Consistent parameter patterns
- ✅ Follows Anthropic's consolidation principle

### 3. Folders Are Part of Vault Management

Folders don't have distinct workflows from notes:

- Creating notes often creates folders: `create_note(target="Projects/2025/note.md", create_folders=True)`
- Moving notes IS organizing folders
- Folders exist to organize notes

**Benefits:**

- ✅ Single tool for all organization
- ✅ No confusion about which tool to use
- ✅ Natural parameter model

### 4. Each Tool Has Clear Purpose

Mental model is simple:

- **Need to find?** → `obsidian_query_vault`
- **Need to read?** → `obsidian_get_context`
- **Need to change?** → `obsidian_vault_manager`

### 5. Real-World Usage Patterns

Common workflows naturally map to these tools:

**Workflow: "Find my notes about Python and summarize them"**

```typescript
// Step 1: Find notes
const results = await obsidianQueryVault({
  queryType: "semantic_search",
  query: "Python programming"
});

// Step 2: Read content
const context = await obsidianGetContext({
  contextType: "read_multiple",
  targets: results.results.slice(0, 3).map(r => r.path)
});

// Step 3: Agent synthesizes summary
```

**Workflow: "Create a new project note in the 2025 folder"**

```typescript
await obsidianVaultManager({
  operation: "create_note",
  target: "Projects/2025/New Project.md",
  content: "# New Project\n\nProject goals...",
  metadata: { tags: ["project", "2025"], status: "planning" },
  createFolders: true
});
```

**Workflow: "Tag all my meeting notes from last week as 'reviewed'"**

```typescript
// Step 1: Find meeting notes
const results = await obsidianQueryVault({
  queryType: "search_by_metadata",
  filters: { folder: "Meetings", dateRange: { days: 7 } }
});

// Step 2: Bulk tag them
await obsidianVaultManager({
  operation: "bulk_tag",
  targets: results.results.map(r => r.path),
  metadata: { tags: ["reviewed"] }
});
```

---

## Implementation Structure

```
app/features/
├── vault_query/              # Discovery operations
│   ├── __init__.py
│   ├── tools.py              # obsidian_query_vault
│   └── models.py             # QueryResult, NoteInfo
│
├── vault_context/            # Reading with context
│   ├── __init__.py
│   ├── tools.py              # obsidian_get_context
│   └── models.py             # ContextResult, NoteContent, BacklinkInfo
│
└── vault_management/         # All modifications
    ├── __init__.py
    ├── tools.py              # obsidian_vault_manager
    └── models.py             # OperationResult
```

---

## Key Anthropic Principles Applied

### 1. Token Efficiency

- **Response format parameter**: `"detailed"` vs `"concise"` (67% token reduction)
- **Pagination & limits**: Sensible defaults with override capability
- **Truncation guidance**: Clear suggestions when results are truncated

### 2. Natural Language Over IDs

- Use human-readable paths: `"Projects/ML Project.md"`
- Not cryptic identifiers: `"uuid-abc-123-def-456"`
- Reduces hallucinations and improves precision

### 3. Helpful Error Messages

```python
# ✅ Good: Specific, actionable guidance
"Cannot create note at 'Projects/Q1/note.md': folder 'Projects/Q1' doesn't exist.
Set create_folders=True to automatically create missing folders, or use
operation='create_folder' first."

# ❌ Bad: Opaque error
"Error: ENOENT"
```

### 4. Clear Parameter Naming

- `target` not `file` (explicit about what it refers to)
- `confirm_destructive` not `force` (clear about safety)
- `max_related` not `limit` (specific about what's being limited)

### 5. Workflow Consolidation

- `schedule_event` pattern: Combines find availability + book meeting
- Our `gather_related`: Combines read note + find related + read related
- Our `bulk_tag`: Combines validate paths + update metadata on all
