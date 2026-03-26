# local-memory-lite activation

## Install

```bash
cd skills/local-memory-lite
npm run install:termux
npm run setup
```

## Verify DB

```bash
node src/cli.js stats
```

## Add a test memory

```bash
node src/cli.js add "用户喜欢短回复，少废话"
node src/cli.js search "短回复"
```

## Hook path

Hooks are declared in `package.json`:
- `hooks/request-before.js`
- `hooks/request-after.js`

## If hooks are not firing

1. Ensure the skill is loaded by your OpenClaw runtime
2. Restart OpenClaw after install/update
3. Send a few test prompts, then run:

```bash
node src/cli.js recent 10
```

If rows appear, request-after is working.
If injected memory still does not show up in behavior, inspect request-before loading in your runtime.
