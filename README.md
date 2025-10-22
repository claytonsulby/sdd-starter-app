# SDD Starter App

## Overview
This repo is a starter kit for building software the "Specification-Driven Development" (SDD) way. Instead of jumping straight into code, you guide the work by describing what needs to happen, capturing decisions, and checking progress through structured Copilot prompts. Think of it as a digital binder that keeps the plan, rules, and automation helpers in one place so the team can stay aligned.

## Step-by-Step Setup and Usage
0. Install Visual Studio Code from https://code.visualstudio.com/ (it is the editor we use).
1. Install Git from https://git-scm.com/downloads so you can clone and version the project.
2. Clone or download this repository onto your computer so the files are available locally.
3. Open the folder in VS Code (`File` → `Open Folder...`) and accept the prompt to install the recommended extensions (GitHub Copilot and Copilot Chat).
4. Sign in to GitHub within VS Code if prompted so Copilot can run.
5. Review the `.specify/` and `.github/prompts/` folders to see the SDD templates and conversation starters; they outline how features should be planned and implemented.
6. Launch Copilot Chat (`View` → `Copilot Chat`) and ask it to run the desired SDD prompt (for example: `/speckit.constitution for a data visualization web app`), then follow the guided steps it returns.

---

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
