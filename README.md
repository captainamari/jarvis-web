# Jarvis Web

A modern web frontend for **Project Jarvis** - a multi-agent task execution system with real-time streaming, human-in-the-loop approval, and task management.

Built with [Next.js 14](https://nextjs.org), [TypeScript](https://www.typescriptlang.org/), [Tailwind CSS](https://tailwindcss.com/), and [shadcn/ui](https://ui.shadcn.com/).

> **Version**: 5.1.0 | **Last Updated**: 2026-02-01

## ✨ Features

### 📊 Dashboard
- **Stats Cards**: Active tasks, completed tasks, token usage, and total cost
- **Status Distribution Chart**: Visual bar chart of tasks by status
- **Recent Activity**: Quick access to latest tasks

### 💬 Workbench (Chat Interface)
- **Real-time SSE Streaming**: Live updates from agent execution
- **Task History Loading**: Load and display conversation history when selecting a task
- **Message Types**: User messages, assistant responses, thoughts, tool calls, tool results, and review feedback
- **Markdown Rendering**: Rich text formatting with react-markdown v10 (wrapped div pattern)
- **Auto-scroll**: Smart scrolling with manual override
- **Loading States**: Visual feedback during history loading

### 🤖 Task Management
- **Create Tasks**: Assign tasks to different agents (Secretary, Python Dev, Investor)
- **Task List**: Filter by status, search, and sort
- **Task Details**: View full execution history and artifacts

### 🖐️ Human-in-the-Loop (HITL 2.0)
- **Suspended Tasks**: Approve or reject agent requests (HITL 1.0)
- **Review Workflow**: M5 验收流程 - Approve & archive or reject with feedback
- **Action Banners**: Context-aware UI for different task states
- **Token Statistics**: Real-time token consumption and cost tracking

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn or pnpm
- Backend API running at `http://localhost:8000` (see [project-jarvis](../project-jarvis))

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

### Backend Service

The frontend requires the Jarvis backend API. Start the backend first:

```powershell
# 1. Activate virtual environment and start backend (from project-jarvis directory)
cd d:\eh\projects\project-jarvis
c:\virtualenv\aiagent\Scripts\activate
python -m src.server.app

# 2. Verify backend is running
curl http://localhost:8000/health
# Expected: {"status":"healthy","version":"5.0.0"}
```

### Environment Configuration

The app uses Next.js rewrites to proxy API requests, avoiding CORS issues:

**`next.config.mjs`**:
```javascript
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://127.0.0.1:8000/:path*',
      },
    ];
  },
};
```

**`src/config/index.ts`**:
```typescript
export const API_CONFIG = {
  // Uses relative path, proxied via Next.js rewrites
  baseUrl: process.env.NEXT_PUBLIC_API_URL || '/api',
  // ...
};
```

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── page.tsx           # Dashboard
│   └── workbench/         # Chat workbench
├── components/
│   ├── dashboard/         # Stats cards, charts, activity
│   ├── layout/            # Main layout, sidebar, header
│   ├── tasks/             # Task list, card, dialogs
│   ├── ui/                # shadcn/ui components
│   └── workbench/         # Chat messages, banners, inputs
├── hooks/
│   └── use-task-stream.ts # SSE streaming hook
├── lib/
│   ├── api.ts             # API client functions
│   ├── constants.ts       # Status configs, navigation
│   └── utils.ts           # Utility functions
├── types/
│   ├── task.ts            # Task types (API models)
│   ├── sse.ts             # SSE event types
│   ├── hitl.ts            # HITL types
│   └── index.ts           # UI types
└── config/
    └── index.ts           # App configuration
```

## 🛠️ Tech Stack

| Category | Technology |
|----------|------------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| UI Components | shadcn/ui |
| Charts | Recharts |
| Markdown | react-markdown v10 |
| State | React Hooks + TanStack Query |
| Real-time | Server-Sent Events (SSE) |

## 📱 Pages

### Dashboard (`/`)
Overview of agent performance with:
- 4 key metrics cards
- Task distribution chart
- Recent activity feed

### Workbench (`/workbench`)
Chat interface for task execution:
- Sidebar with task list
- Task history loading with loading state
- Real-time message streaming
- HITL approval banners
- Review feedback display
- Archive summary dialogs

## 🔌 API Integration

The frontend connects to the Jarvis backend API via Next.js proxy:

### System Endpoints
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Health check |
| `/test/sse` | GET | SSE test stream |

### Task Management
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/tasks` | POST | Create new task |
| `/tasks/{id}` | GET | Get task details |
| `/tasks/{id}/run` | POST | Execute task |
| `/tasks/{id}/stream` | GET | SSE event stream |
| `/tasks/{id}/events` | GET | Event history |

### M5 Review & Archive
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/tasks/{id}/review` | POST | Submit review (approve/reject) |
| `/tasks/{id}/archive` | POST | Archive task |

### User Endpoints
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/users/{id}/tasks` | GET | User's task list |
| `/users/{id}/stats` | GET | User statistics |

## 📡 SSE Event Types

| Event | Description |
|-------|-------------|
| `connected` | Connection established |
| `thought` | Agent thinking process |
| `tool_call` | Tool invocation |
| `tool_result` | Tool execution result |
| `message` | Final response |
| `status_change` | Task status changed |
| `token_update` | Token consumption update |
| `heartbeat` | Keep-alive signal |
| `error` | Error occurred |
| `close` | Connection closing |

## 🎯 Task Status Flow

```
PENDING → RUNNING → AWAITING_REVIEW → ARCHIVED
                ↓           ↓
           SUSPENDED    (reject) → RUNNING
                ↓
           ARCHIVED/FAILED
```

### Status Types
- `pending` - Waiting to execute
- `running` - Currently executing
- `suspended` - HITL 1.0 - Awaiting user input
- `awaiting_review` - M5 - Agent completed, awaiting user review
- `archived` - Task completed and archived
- `failed` - Execution failed

## 🎨 UI Components

### Custom Components
- `StatsCard` - Metric display card
- `StatusChart` - Task distribution chart
- `MessageBubble` - Chat message with markdown
- `ThoughtLog` - Collapsible thinking process
- `ToolCallLog` - Tool invocation display
- `ActionBanner` - Status-based action UI
- `TaskCard` - Task list item
- `CreateTaskDialog` - Task creation modal (controlled/uncontrolled)
- `Markdown` - Markdown renderer (react-markdown v10 compatible, uses wrapper div)

### shadcn/ui Components
- Accordion, Button, Card, Dialog
- Input, ScrollArea, Separator
- Badge, Avatar, Skeleton
- Select, Textarea, Label

## 📄 License

MIT

## 📝 Changelog

### v5.1.0 (2026-02-01)
- **Task History Loading**: Fixed conversation history display when selecting tasks in workbench
  - Added `setHistoryMessages` method to `useTaskStream` hook
  - Fixed empty loop in `handleSelectTask` that prevented history from displaying
  - Added `isLoadingHistory` state with loading UI
- **Markdown Component Fix**: Updated for react-markdown v10 compatibility
  - Removed deprecated `className` prop from `<ReactMarkdown>`
  - Wrapped with `<div>` for styling (required by react-markdown v9+)
  - Added safety checks for empty/null content
- **Review Feedback Support**: Added `review_feedback` message type rendering in chat
- **Assistant Message Parsing**: Properly parse Claude API JSON response format for assistant messages

### v5.0.0 (2026-01-31)
- Initial release with full HITL 2.0 support
- M5 review workflow implementation
- SSE streaming for real-time updates

## 🔗 Related Projects

- [project-jarvis](../project-jarvis) - Backend API server (Python + FastAPI)
