# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

`pocket_wallet` is a custom **Frappe v15 app** ("Pocket Wallet") for tracking personal/daily cash flow. It is one app in a Frappe bench at `/Users/d-code/dentora`, installed on the default site `dent.local`. Unlike the sibling `dentora` app, it has **no frontend SPA** — the entire UI is the standard Frappe Desk (forms, list views, a workspace, dashboard charts and number cards). It depends only on `frappe`; it does not use erpnext or healthcare.

## Data model & the one invariant that governs everything

Four DocTypes (under `pocket_wallet/pocket_wallet/doctype/`):

- **My Wallet** — the transaction ledger; the only DocType with real logic. Fields: `date`, `time`, `amount`, `type` (Expense/Income/Transfer), `category`, `account`, `to_account`, `note`, `status`. Auto-named `format:{type}-{account}-{DD}-{MM}-{#####}`, with `track_changes` on.
- **Wallet Account** — an account holding a denormalized running `account_balance`. Named by `account_name`.
- **Wallet Category** — Expense/Income categories (with icon + color). Named by `category`; has a `category_type` (Expense/Income).
- **Pocket Wallet Settings** — a Single doctype holding `default_account` / `default_category` (used by the My Wallet client script to prefill new transactions).

**The core invariant:** `Wallet Account.account_balance` is a *derived running total*, never edited directly in normal use. It is mutated only as a side-effect of My Wallet's document lifecycle, in [my_wallet.py](pocket_wallet/pocket_wallet/doctype/my_wallet/my_wallet.py):

- `on_update` → if editing an existing doc, **reverse the pre-save version** (`get_doc_before_save()`) first, then **apply** the current one. This reverse-then-reapply is what keeps balances correct across edits — preserve it in any change to transaction handling.
- `on_trash` → reverse the transaction.
- Apply/reverse rules: **Income** credits `account`; **Expense**/**Transfer** debit `account`; **Transfer** additionally credits `to_account`.

Because of this, never write `account_balance` directly from new code — go through a My Wallet transaction, or you'll desync the ledger from the balance. `Wallet Account` and `Wallet Category` both block deletion (`on_trash`) when linked My Wallet rows exist.

Validation lives in `My Wallet.validate` (no side-effects there): amount must be > 0; Expense/Income require a `category` whose `category_type` matches `type`; Transfer requires a distinct `to_account`.

Client behavior in [my_wallet.js](pocket_wallet/pocket_wallet/doctype/my_wallet/my_wallet.js): filters the `category` link to the current `type`, prefills account/category from Pocket Wallet Settings on new docs, and clears `category` when `type` changes.

Roles: `System Manager`, `Pocket Manager`, `Pocket User`.

## Commands

All `bench` commands run from the **bench root** (`/Users/d-code/dentora`), not this app folder. Default site is `dent.local`.

```bash
bench start                                   # full dev stack
bench --site dent.local migrate               # after editing DocType JSON / patches.txt
bench --site dent.local install-app pocket_wallet
bench build --app pocket_wallet               # rebuild bundled assets
bench --site dent.local console               # Python REPL with Frappe loaded
```

### Tests

Frappe `unittest`-based tests (`test_*.py` next to each controller; currently boilerplate stubs).

```bash
bench --site dent.local run-tests --app pocket_wallet
bench --site dent.local run-tests --doctype "My Wallet"
bench --site dent.local run-tests --module "pocket_wallet.pocket_wallet.doctype.my_wallet.test_my_wallet"
```

Requires MariaDB + Redis running. CI ([.github/workflows/ci.yml](.github/workflows/ci.yml)) spins these up and runs `run-tests --app pocket_wallet` on pushes to `develop` and on PRs.

## Conventions

- This is a real git repo (remote `upstream` → `D-codE-Hub/pocket_wallet`); local work is on `main` / `pocket_main`, but CI targets the `develop` branch.
- Source uses **tab indentation** (Frappe default) — match it; there is no ruff/pre-commit config in this app, so formatting is by convention, not enforced.
- DocTypes are PascalCase with spaces ("My Wallet"); the stored table is `tab<DocType>`. New DocTypes belong under `pocket_wallet/pocket_wallet/doctype/` and the `Pocket Wallet` module (`modules.txt`).
- Wire new behavior through DocType controllers/hooks, not ad-hoc scripts. `hooks.py` is currently bare scaffold — register doc events / scheduler jobs there if needed.
