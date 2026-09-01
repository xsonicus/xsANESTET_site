# Project Logic Graph - xsANESTET_site

This document describes how Graphify and `.codex-logic/` preserve project logic.

## Purpose

- Graphify maps code symbols, files, imports, call paths, and affected logic.
- `.codex-logic/logic-map.md` records the curated architecture narrative.
- `.codex-logic/model-training-protocol.md` records how weights, self-learning rules, and validation windows are formed.
- `.codex-logic/logic-ledger.jsonl` records important logic changes and verification.

## Safety Boundary

The graph may describe where weights are created and how training is controlled, but it must not store raw datasets, private exchange data, binary weights, tokens, secrets, or session files.
