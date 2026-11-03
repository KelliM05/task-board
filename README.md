# Task Board

A Kanban-style task management application built with React, TypeScript, and Supabase. This application allows users to create, organize, track, and manage tasks across four workflow stages.

## Features

- **Kanban Board:** Four columns — To Do, In Progress, In Review, and Done.
- **Drag and Drop:** Move tasks between columns using drag-and-drop functionality.
- **Task Management:** Create and delete tasks.
- **Task Details:** Add descriptions, priorities, and due dates.
- **Priority Tracking:** Organize tasks by priority.
- **Due Date Indicators:** Identify tasks that are overdue or due soon.
- **Dashboard Statistics:** View task totals and status and priority breakdowns.
- **Guest Authentication:** Automatically create an anonymous guest session.
- **Database Persistence:** Store tasks in Supabase.
- **Responsive Design:** Adapt the board to different screen sizes.

## Technologies

- React
- TypeScript
- Vite
- Supabase (Authentication and PostgreSQL Database)
- CSS
- @dnd-kit/core
- Git and GitHub

## Getting Started

### Prerequisites

- Node.js and npm
- A Supabase account

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/KelliM05/task-board.git
   ```

2. Navigate to the project directory:

   ```bash
   cd task-board
   ```

3. Install dependencies:

   ```bash
   npm install
   ```

4. Create a `.env` file in the project root and add your Supabase project credentials:

   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_publishable_or_anon_key
   ```

5. Start the development server:

   ```bash
   npm run dev
   ```

6. Open the local URL displayed in your terminal.

## Supabase Configuration

The application uses Supabase for anonymous authentication and task storage.

Configure your Supabase project to:
- Enable anonymous sign-ins.
- Create the `tasks` table with the fields required by the application.
- Enable Row Level Security (RLS).
- Configure policies so users can access only their own tasks.

Do not put your Supabase service-role key or other secret credentials in the frontend `.env` file.

## Project Purpose

Developed as part of a Software Development Internship Assessment to demonstrate frontend development, database integration, authentication, and interactive task management.
