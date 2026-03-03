# update-memory

## Workflow Steps

1. **Get commit input from user**
   - Ask user to specify which git commits to analyze
   - Accept formats:
     - Single commit ID (e.g., `abc123`)
     - Range format (e.g., `last 3`, `last 5`)
     - Commit range (e.g., `abc123..def456`)

2. **Resolve commit IDs**
   - If user provides "last N", execute `git log -n N --format="%H"` to get commit IDs
   - If user provides single commit ID, use it directly
   - If user provides commit range, parse and get all commits in range
   - Store all commit IDs in an array

3. **Analyze commits (batch processing)**
   - For each commit ID:
     - Get commit message: `git log -1 --format="%B" <commit-id>`
     - Get commit diff: `git show <commit-id> --stat` and `git show <commit-id>`
     - Analyze both commit message and code changes
   - **Batch processing logic:**
     - If more than 5-6 commits OR total diff lines > 2000 OR too many files changed:
       - Process in smaller batches (3-4 commits at a time)
       - Process each batch sequentially
   - **Merge related commits:**
     - If multiple commits touch the same section/feature:
       - Group them together
       - Merge their changes into a single update

4. **Extract changes from diffs**
   - Analyze all types of changes:
     - New dependencies (package.json changes)
     - New files/components/routes
     - Schema changes (database, types)
     - Configuration changes
     - New features/endpoints
     - Documentation updates
     - Environment variable changes
   - Map changes to relevant memory sections:
     - Tech Stack (dependencies, versions)
     - Project Structure (new files/directories)
     - Database Schema (schema changes)
     - Available Scripts (new scripts)
     - Environment Variables (new env vars)
     - Key Features (new features/routes/endpoints)
     - Code Conventions (formatting/linting changes)

5. **Prepare memory updates**
   - For each affected section:
     - **Update existing sections:** Replace outdated content with new information
     - **Append new sections:** Add new information that doesn't exist
   - Follow existing memory structure and formatting
   - Create/update "Recent Changes" section at the end with last 3 changes summary

6. **Handle conflicts**
   - Before updating, check if changes conflict with existing content
   - If conflicts detected:
     - Ask user: "Conflict detected in [section]. Existing: [content]. Proposed: [content]. How should I proceed?"
     - Wait for user response before proceeding

7. **Update memory file**
   - Directly update `CLAUDE.md` file
   - Apply all changes (auto-apply, no preview)
   - Do NOT auto-save (let user review and save manually)
   - Preserve file structure and formatting
