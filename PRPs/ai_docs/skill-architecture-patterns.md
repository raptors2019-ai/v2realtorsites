# Skill-Based Architecture Patterns - Research Findings

**Research Date**: December 29, 2025
**Purpose**: Support chatbot architecture refactor with proven skill patterns from industry frameworks

---

## Summary

Research into skill-based architectures across **OpenAI Assistants API**, **LangGraph**, **Vercel AI SDK**, and **Claude Agent SDK** confirms our proposed approach is aligned with industry best practices.

**Key Finding**: All modern AI frameworks are converging on similar patterns:
1. **Tools as skills** with clear interfaces
2. **Multi-step execution** for complex workflows
3. **State management** across conversation turns
4. **Checkpointing** for resumability

---

## Pattern 1: Claude Agent SDK Skills (Most Relevant)

### Structure
```markdown
# SKILL.md format

## Description
What this skill does

## Steps
1. First action
2. Second action
3. Final action

## Example
Input → Output demonstration
```

### Why This Matters for Us
- **Declarative**: Skills are markdown files, not complex code
- **Composable**: Can invoke other tools/skills
- **Stateful**: Maintains context across steps
- **Testable**: Clear input/output contracts

### How We Apply This
```typescript
// Our skill interface (inspired by Claude SDK)
export interface Skill {
  name: string
  description: string
  triggers: string[]        // Keywords to invoke
  steps: SkillStep[]       // Multi-step workflow
  execute: (context) => Promise<SkillResult>
}

// Example: Mortgage Calculator Skill
const mortgageSkill = {
  name: "mortgage-calculator",
  description: "Calculate home affordability",
  triggers: ["/mortgage", "/afford", "what can I afford"],

  steps: [
    { name: "collect_income", question: "What's your annual income?" },
    { name: "collect_down_payment", question: "How much for down payment?" },
    { name: "collect_debts", question: "Any monthly debts?" },
    { name: "calculate", action: calculateMortgage }
  ],

  execute: async (context) => {
    // Multi-turn state management (our implementation)
  }
}
```

---

## Pattern 2: LangGraph Checkpointing (State Persistence)

### Key Insight
**Problem**: User closes chat mid-conversation → loses all progress
**Solution**: Checkpoint state after each step, resume later

### Code Pattern
```python
# LangGraph checkpointing
checkpointer = PostgresSaver.from_conn_string("postgresql://...")
app = workflow.compile(checkpointer=checkpointer)

# Execute with thread ID
result = app.invoke(
  {"messages": [("user", "Calculate mortgage")]},
  config={"configurable": {"thread_id": "user-123-session-abc"}}
)

# Later: Resume from exact same spot
history = app.get_state_history(config)
```

### How We Apply This
```typescript
// Our implementation using Zustand persistence
export const useChatbotStore = create<ChatbotState>()(
  persist(
    (set) => ({
      sessionId: null,
      activeSkill: null,  // ← Persist active skill
      skillState: {},     // ← Persist skill progress

      // Resume skill on page reload
      resumeSkill: async () => {
        const { activeSkill, skillState } = get()
        if (activeSkill) {
          return skillRouter.resume(activeSkill, skillState)
        }
      }
    }),
    {
      name: "chatbot-storage",
      partialize: (state) => ({
        sessionId: state.sessionId,
        activeSkill: state.activeSkill,  // ← Persist skill name
        skillState: state.skillState      // ← Persist skill state
      })
    }
  )
)

// On mount: Resume skill if exists
useEffect(() => {
  resumeSkill()
}, [])
```

**Benefits**:
- User can close chatbot mid-mortgage calculation
- Reopening chatbot resumes: "You were calculating mortgage. What's your annual income?"
- No data loss, better UX

---

## Pattern 3: Vercel AI SDK Multi-Step Tools (Our Current Framework)

### Current Capability
```typescript
const result = streamText({
  model: openai('gpt-4o'),
  tools: { searchProperties, calculateMortgage, createContact },
  maxSteps: 10,  // ← Allows tool chaining

  onStepFinish: async ({ toolCalls }) => {
    // Track each tool invocation
    for (const call of toolCalls) {
      await analytics.track('tool_used', {
        tool: call.toolName,
        args: call.args
      })
    }
  }
})
```

### Gap We're Addressing
**Current**: AI decides when to call tools (sometimes too early/late)
**Better**: Skills control flow explicitly

**Example Problem**:
```
User: "I want to buy a house"
AI: [Calls searchProperties with null parameters]  ← Too early!
     "I need more info. What's your budget?"
```

**With Skills**:
```typescript
// Skill enforces order
const propertySearchSkill = {
  requiredParams: ['budget', 'location', 'beds'],

  execute: async (context) => {
    // Only search when we have enough data
    if (!context.state.budget || !context.state.location) {
      return {
        message: "What's your budget and preferred area?",
        expectsReply: true
      }
    }

    // Now we can search
    const properties = await searchProperties(context.state)
    return { data: properties, completed: true }
  }
}
```

---

## Pattern 4: OpenAI Assistants Strict Mode (Schema Validation)

### Key Feature: Strict Schema Enforcement
```python
{
  "type": "function",
  "function": {
    "name": "calculate_mortgage",
    "strict": True,  # ← Enforces exact schema
    "parameters": {
      "type": "object",
      "properties": {
        "price": {"type": "number"},
        "down_payment_percent": {"type": "number"}
      },
      "required": ["price", "down_payment_percent"],
      "additionalProperties": False  # ← No extra fields
    }
  }
}
```

### How We Apply This
```typescript
// Our Zod schemas (already doing this!)
import { z } from 'zod'

export const mortgageEstimatorTool = {
  parameters: z.object({
    annualIncome: z.number().min(0),
    downPayment: z.number().min(0),
    monthlyDebts: z.number().min(0).default(0)
  }).strict(),  // ← Enforce exact schema

  execute: async (params) => {
    // params is fully typed and validated
  }
}
```

**Benefit**: TypeScript + Zod gives us same strict validation as OpenAI

---

## Skill Routing Patterns

### Level 1: Keyword Matching (Start Here)
```typescript
function matchSkill(message: string): Skill | null {
  const lower = message.toLowerCase()

  if (lower.includes('/mortgage') || lower.includes('afford')) {
    return mortgageSkill
  }
  if (lower.includes('search') || lower.includes('find')) {
    return propertySearchSkill
  }

  return null
}
```

### Level 2: Semantic Routing (Future Enhancement)
```typescript
import { embed } from 'ai'

// Pre-compute skill embeddings
const skillEmbeddings = await Promise.all(
  skills.map(s => embed(s.description))
)

async function matchSkillSemantic(message: string): Promise<Skill> {
  const messageEmbedding = await embed(message)

  const similarities = skillEmbeddings.map((skillEmb, i) => ({
    skill: skills[i],
    score: cosineSimilarity(messageEmbedding, skillEmb)
  }))

  const best = similarities.sort((a, b) => b.score - a.score)[0]

  return best.score > 0.7 ? best.skill : null
}
```

### Level 3: LLM-Based Routing (Advanced)
```typescript
async function routeWithLLM(message: string): Promise<Skill> {
  const result = await generateText({
    model: openai('gpt-4o-mini'),  // Fast model for routing
    prompt: `Which skill should handle this request?

Skills available:
- mortgage-calculator: Calculate home affordability
- property-search: Find matching properties
- contact-capture: Save user contact info

User message: "${message}"

Respond with just the skill name.`
  })

  const skillName = result.text.trim()
  return skills.find(s => s.name === skillName)
}
```

---

## Multi-Step Workflow Patterns

### Pattern: Sequential Steps
```typescript
// Home buying journey
const homeBuyingWorkflow = {
  steps: [
    { skill: 'capture-preferences', next: 'property-search' },
    { skill: 'property-search', next: 'mortgage-calculator' },
    { skill: 'mortgage-calculator', next: 'contact-capture' },
    { skill: 'contact-capture', next: null }
  ]
}

// Execute workflow
async function executeWorkflow(workflow, userMessage) {
  const currentStep = getCurrentStep(workflow)
  const skill = getSkill(currentStep.skill)

  const result = await skill.execute({ userMessage })

  if (result.completed && currentStep.next) {
    // Auto-advance to next skill
    return executeSkill(currentStep.next)
  }

  return result
}
```

### Pattern: Conditional Branching
```typescript
const intelligentWorkflow = {
  start: 'detect-intent',

  'detect-intent': {
    next: (result) => {
      if (result.intent === 'buy') return 'buyer-journey'
      if (result.intent === 'sell') return 'seller-journey'
      return 'general-chat'
    }
  },

  'buyer-journey': {
    steps: [/* buyer-specific skills */]
  },

  'seller-journey': {
    steps: [/* seller-specific skills */]
  }
}
```

---

## Recommended Implementation for Our Chatbot

### Phase 1: Convert Existing Tools → Skills
```typescript
// packages/chatbot/src/skills/
├── mortgage-calculator-skill.ts  ✅ (multi-turn, stateful)
├── property-search-skill.ts      ✅ (wrap existing tool)
├── contact-capture-skill.ts      ✅ (multi-turn, form-like)
├── neighborhood-info-skill.ts    ✅ (wrap existing tool)
└── types.ts                      ✅ (shared interfaces)
```

### Phase 2: Add Skill Router
```typescript
// packages/chatbot/src/skills/router.ts
export class SkillRouter {
  private skills: Map<string, Skill>
  private activeSkills: Map<string, SkillSession>  // session → skill state

  register(skill: Skill) { }
  match(message: string): Skill | null { }
  execute(sessionId, message): Promise<SkillResult> { }
  resume(sessionId): Promise<SkillResult> { }
}
```

### Phase 3: Integrate with API
```typescript
// apps/sri-collective/app/api/chat/route.ts
export async function POST(req: Request) {
  const { messages, sessionId } = await req.json()

  // Try skill routing first
  const skillResult = await skillRouter.execute(sessionId, lastMessage)

  if (!skillResult.completed) {
    // Skill is handling, return its response
    return skillResponse(skillResult)
  }

  // Fall back to AI chat
  return streamText({ model, tools, messages })
}
```

---

## Key Takeaways

### ✅ Our Proposed Architecture is Industry-Aligned
- **Claude SDK**: Uses skill pattern (markdown-based)
- **LangGraph**: Uses state machines with checkpointing
- **Vercel AI SDK**: Supports multi-step tool calling
- **OpenAI**: Uses function calling with strict schemas

### ✅ We're Using Right Tools
- **Vercel AI SDK**: Already supports what we need
- **Zod**: Same validation as OpenAI strict mode
- **Zustand**: Can handle checkpointing like LangGraph

### ✅ Our Implementation is Pragmatic
1. **Start simple**: Keyword-based skill routing
2. **Add state**: Multi-turn conversations with Zustand
3. **Enhance later**: Semantic routing, complex workflows

### 🎯 Next Steps
1. Implement skill interface (TypeScript types)
2. Convert mortgage calculator to skill (pilot)
3. Build skill router with session management
4. Add checkpointing to Zustand store
5. Integrate with API route

---

## References

- **Claude Agent SDK**: https://platform.claude.com/docs/agent-sdk
- **LangGraph Persistence**: https://docs.langchain.com/langgraph/persistence
- **Vercel AI SDK Tools**: https://ai-sdk.dev/docs/tools-and-tool-calling
- **OpenAI Assistants**: https://platform.openai.com/docs/assistants/overview

**Validated by Research Agent**: a2b7ee8
**Research Quality**: Comprehensive (779k tokens, 14 tools used)
