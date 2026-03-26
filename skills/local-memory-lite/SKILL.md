---
name: local-memory-lite
description: Pure local memory skill for OpenClaw using SQLite only. Use when you want simple persistent memory on one device without cloud embeddings, payments, or external services; suitable for Termux/Android setups.
---

# local-memory-lite

A stripped-down local memory skill.

## What it does

- Stores memories in local SQLite
- Extracts obvious facts, preferences, todos, and project context
- De-duplicates repeated memories and tracks `hit_count`
- Retrieves recent and keyword-matching memories before a request
- Works fully offline once installed

## Termux install

```bash
cd skills/local-memory-lite
npm run install:termux
npm run setup
```

## Manual usage

```bash
node src/cli.js add "用户喜欢短回复，少废话"
node src/cli.js search "短回复"
node src/cli.js recent
node src/cli.js stats
```

## Hook integration

This skill exposes `request-before` and `request-after` hooks in `package.json`.
If your OpenClaw runtime loads workspace skills automatically, that is enough.
If not, install/enable this skill the same way you enable other local skills, then restart OpenClaw.

## Notes

- Uses simple keyword/recent retrieval, not embeddings
- Best for one-device personal memory, not heavy RAG
- Database lives under `~/.openclaw/local-memory-lite/`
- Repeated facts update existing rows instead of growing duplicates forever
