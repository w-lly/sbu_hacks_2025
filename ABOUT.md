# U-mi

## Inspiration
Planning shouldn’t be this hard. SBU’s schedule builder is clunky and Notion takes hours to set up before it’s useful. We wanted a tool that’s visual, intuitive, and flexible—something that lets you plan your week like a schedule builder, but organize your life like Notion.  
That’s how **U-mi** was born: a visual planner that just works, no setup required.

## What it does
U-mi is a lightweight, offline-first planning app that combines **visual scheduling** with **flexible organization**.

**Key Features**
- Drag-and-drop weekly calendar with conflict detection  
- Color-coded blocks and instant visual feedback  
- Create groups for different areas of life  
- Add notes, links, and attachments to any object  
- To-do list and study timer built in  
- Everything saved locally — no login or setup  

Plan, organize, and visualize your week in seconds.

## How we built it
U-mi was built using **React + Vite** for fast development and **IndexedDB (Dexie.js)** for offline storage.  
We used **@dnd-kit** for drag-and-drop interactions, **Zustand** for global state, and **React Router** for navigation.  
**Tailwind CSS** handled styling, and **Lucide React** powered the icons.

**Tech Stack**
- React 18 + Vite  
- Dexie.js (IndexedDB)  
- Zustand  
- React Router v6  
- @dnd-kit  
- Tailwind CSS  

The app uses optimistic UI updates for instant feedback and runs entirely client-side.

## Challenges we ran into
1. **IndexedDB Learning Curve** – Structuring a relational-like schema without SQL joins.  
2. **Router-State Conflicts** – Balancing URL parameters and global state for navigation.  
3. **Drag-and-Drop Bugs** – Handling item collisions and drag overlays in complex layouts.

Our biggest unresolved issue: a small drag lag in split view—likely due to nested scroll contexts.

## Accomplishments that we're proud of
- Built a **fully functional planner** that works offline and feels fast.  
- Designed an **efficient conflict detection algorithm** for scheduling.  
- Integrated multiple layers of state management seamlessly.  
- Created an **intuitive UX** that needs no tutorials—just drag, drop, and plan.

## What we learned
- How to use IndexedDB effectively for structured local storage.  
- Managing React Router with global state for fluid navigation.  
- Optimizing algorithms for real-time scheduling.  
- The value of **simplicity and visual feedback** in user design.

## What's next for U-mi
- Fix drag lag in split view.  
- Add export/import for data backup.  
- Support recurring events.  
- Expand calendar views (daily, monthly).  
- Add collaboration and sync features.  
- Explore AI-powered scheduling suggestions.

---

*U-mi makes planning visual, fast, and effortless—so you can focus on what actually matters.* 🚀
