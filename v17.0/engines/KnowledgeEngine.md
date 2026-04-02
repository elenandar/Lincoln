### 4.3 Secrets and Knowledge System (KnowledgeEngine)

#### Overview

The **KnowledgeEngine** introduces a sophisticated secret management system that controls which information is visible to the AI based on which characters are currently in focus. This creates opportunities for dramatic irony, misunderstandings, and plot-driven reveals.

**Key capabilities:**
1. **Secret Management** - Store information known only to specific characters
2. **Scene-Aware Filtering** - Secrets only appear in context when relevant characters are in focus
3. **Manual Control** - Use `/secret` command to add secrets during gameplay
4. **Context Integration** - Secrets appear as `⟦SECRET⟧` tags with high priority
5. **Multi-Character Secrets** - A secret can be known by multiple characters

#### State Structure

Secrets are stored as an array in `state.lincoln.secrets`:

```javascript
state.lincoln.secrets = [
  {
    id: "secret_1234_abc",
    text: "Директор подделывает оценки учеников",
    known_by: ["Максим"]
  },
  {
    id: "secret_5678_xyz",
    text: "Хлоя и Эшли планируют тайную вечеринку",
    known_by: ["Хлоя", "Эшли"]
  }
]
```

**Secret Object Properties:**
- `id` - Unique identifier (auto-generated)
- `text` - The secret information (5+ characters)
- `known_by` - Array of character names who know this secret

#### Adding Secrets: /secret Command

**Syntax:**
```
/secret <secret text> known_by: <Name1>, <Name2>, ...
```

**Examples:**

Add a secret known only to Максим:
```
/secret Директор крадёт деньги из школьного фонда known_by: Максим
```

Add a secret known to multiple characters:
```
/secret План побега был раскрыт директором known_by: Максим, Хлоя, Эшли
```

**Response:**
```
⟦SYS⟧ 🤫 Secret added (known by: Максим, Хлоя)
```

**Validation Rules:**
- Secret text must be at least 5 characters long
- Must specify at least one character in `known_by`
- Character names are comma-separated
- Case-insensitive matching for character names

#### Scene Focus and Secret Visibility

Secrets are intelligently filtered based on the current scene focus. The system checks the `⟦SCENE⟧ Focus on:` line in the context to determine which characters are currently active.

**Logic Flow:**
1. System identifies which characters are in focus (last seen ≤3 turns)
2. For each secret, check if any focus character is in `known_by` array
3. Only matching secrets appear in context as `⟦SECRET⟧` entries

#### Context Integration

Secrets appear in the context overlay with **priority weight 740** (between GOAL at 750 and MOOD at 725):

```
⟦CANON⟧ Максим и Хлоя are friends. Максим: suspicious of principal.
⟦GOAL⟧ Цель Максим: узнать правду о директоре
⟦SECRET⟧ Директор подделывает оценки учеников
⟦MOOD⟧ Максим зол из-за ссоры
⟦SCENE⟧ Focus on: Максим, Хлоя
```

**Priority Order:**
1. `⟦INTENT⟧` (1000)
2. `⟦TASK⟧` (900)
3. `⟦CANON⟧` (800)
4. `⟦GOAL⟧` (750)
5. **`⟦SECRET⟧` (740)** ← Secrets appear here
6. `⟦MOOD⟧` (725)
7. `⟦OPENING⟧` (700)
8. `⟦SCENE⟧ Focus` (600)

#### Practical Examples

**Example 1: Secret Visible When Character in Focus**

State:
```javascript
L.secrets = [
  {
    id: "secret_001",
    text: "Максим знает о подделке оценок директором",
    known_by: ["Максим"]
  }
];

L.characters = {
  "Максим": { lastSeen: 10 },  // In focus (hot)
  "Хлоя": { lastSeen: 8 }
};
```

Context includes:
```
⟦SECRET⟧ Максим знает о подделке оценок директором
⟦SCENE⟧ Focus on: Максим
```

AI can reference this secret in Максим's thoughts and actions.

---

**Example 2: Secret Hidden When Character Not in Focus**

Same secret, but different active characters:

State:
```javascript
L.characters = {
  "Хлоя": { lastSeen: 10 },    // In focus
  "Эшли": { lastSeen: 9 },     // In focus
  "Максим": { lastSeen: 5 }    // Not in hot focus
};
```

Context does NOT include the secret:
```
⟦SCENE⟧ Focus on: Хлоя, Эшли
```

AI doesn't have access to Максим's secret, creating dramatic irony.

---

**Example 3: Multiple Secrets with Different Visibility**

State:
```javascript
L.secrets = [
  {
    id: "s1",
    text: "Максим видел как директор удалял файлы",
    known_by: ["Максим"]
  },
  {
    id: "s2",
    text: "Хлоя и Эшли знают о тайной вечеринке",
    known_by: ["Хлоя", "Эшли"]
  },
  {
    id: "s3",
    text: "Все знают об увольнении миссис Грейсон",
    known_by: ["Максим", "Хлоя", "Эшли"]
  }
];

L.characters = {
  "Максим": { lastSeen: 10 },  // In focus
  "Хлоя": { lastSeen: 9 },     // In focus
  "Эшли": { lastSeen: 7 }      // Not in hot focus (>3)
};
```

Context includes only visible secrets:
```
⟦SECRET⟧ Максим видел как директор удалял файлы
⟦SECRET⟧ Все знают об увольнении миссис Грейсон
⟦SCENE⟧ Focus on: Максим, Хлоя
```

Secret #2 is hidden because neither Хлоя nor Эшли is in `known_by` AND in current hot focus together.

#### Use Cases and Storytelling Benefits

**1. Dramatic Irony**
- Reader knows something characters don't
- Creates tension and anticipation
- Example: Only Максим knows the truth, but Хлоя is making decisions without this knowledge

**2. Character Knowledge Asymmetry**
- Different characters have different information
- Enables misunderstandings and conflict
- Example: Максим thinks Хлоя betrayed him, but Хлоя doesn't know what Максим saw

**3. Mystery and Investigation**
- Gradually reveal secrets as characters learn them
- Track who knows what
- Example: Add a character to `known_by` when they discover the secret

**4. Plot-Driven Reveals**
- Control when information becomes available to the AI
- Create structured story progression
- Example: Remove a secret when it's publicly revealed

#### Architecture

The secret system integrates across multiple layers:

```
User enters: /secret <text> known_by: <names>
    ↓
Library v16.0.8.patched.txt (CommandsRegistry)
    ↓ Parse command
    ↓ Create secret object
    ↓ Push to L.secrets array
state.lincoln.secrets
    ↓
Library v16.0.8.patched.txt (composeContextOverlay)
    ↓ Get active characters (HOT focus ≤3 turns)
    ↓ Filter secrets by known_by
    ↓ Add matching secrets as ⟦SECRET⟧ entries
Context v16.0.8.patched.txt
    → AI sees only relevant secrets
```

#### Impact on AI Behavior

**Without Secrets:**
```
"Максим и Хлоя встретились в библиотеке. Они обсудили предстоящую 
контрольную и разошлись."
```

**With Secrets (⟦SECRET⟧ Максим знает о подделке оценок, но Хлоя не знает):**
```
"Максим увидел Хлою у полок с учебниками. Он вспомнил то, что узнал 
вчера о директоре — подделка оценок, коррупция. Ему хотелось 
рассказать Хлое, но что, если она не поверит? Или хуже — расскажет 
кому-то? Он подошёл к ней, но так и не решился заговорить о главном."
```

The AI naturally creates tension based on asymmetric knowledge.

#### Configuration

| Parameter | Value | Location | Description |
|-----------|-------|----------|-------------|
| Min secret length | 5 characters | `/secret` command | Minimum text length |
| Priority weight | 740 | `composeContextOverlay()` | Context priority |
| Focus threshold | 3 turns | `composeContextOverlay()` | HOT character window |

#### Advanced Techniques

**Updating Secrets:**
Secrets are immutable once created, but you can:
1. Add the same secret with updated `known_by` list
2. Create a new secret representing the new information state

**Removing Secrets:**
Currently secrets persist indefinitely. To "remove" a secret:
1. Keep it in state but remove all characters from `known_by`
2. Or use the system as-is (old secrets don't appear unless characters in focus)

**Secret Lifecycle:**
```
User: /secret <info> known_by: Максим
    ↓
Secret stored in L.secrets
    ↓
When Максим in focus → Secret visible
When Максим not in focus → Secret hidden
    ↓
(Secret persists until manually managed)
```

---
