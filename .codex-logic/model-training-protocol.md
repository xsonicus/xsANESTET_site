# Model Training Protocol - xsANESTET_site

Use this protocol whenever a trading bot, model, score, weight, ranking policy, or self-learning component is added or changed.

## Required Provenance

- Model / weight name:
- Code owner module:
- Data sources:
- Symbol universe:
- Timeframe and bar source:
- Feature columns:
- Label definition:
- Train period:
- Validation period:
- Test / holdout period:
- Walk-forward schedule:
- Retraining cadence:
- Promotion criteria:
- Rollback criteria:

## Anti-Fake / Anti-Lookahead Rules

- Do not train on future bars relative to the simulated decision timestamp.
- Do not use final candle values before candle close.
- Do not normalize features with statistics computed from the future.
- Do not select symbols using future performance from the same evaluation window.
- Include fees, spread, slippage, funding, order fill assumptions, and missed-fill logic.
- Keep backtest, paper, shadow, and live execution paths comparable.
- Record every intentional exception here with rationale.

## Monthly Self-Learning Loop

1. Freeze the previous production policy.
2. Train candidates only on data available before the training cutoff.
3. Validate on the next chronological window.
4. Run out-of-sample / walk-forward replay with realistic costs.
5. Compare against baseline and previous production policy.
6. Promote only if profit, drawdown, turnover, and operational safety improve together.
7. Record the decision in `.codex-logic/logic-ledger.jsonl` and `.codex-versioning/`.
