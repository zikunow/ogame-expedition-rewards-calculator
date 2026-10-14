# OGame Expedition Rewards Calculator

A browser-based calculator for expected resource and fleet rewards per expedition, wave, day, and selected period. The interface is in Russian and includes minimal and cosmic themes.

## Features

- Maximum finds for a Discoverer with a Pathfinder, based on economy speed and rank-one points.
- Independent total resource and ship yield bonuses, or manually supplied maximum finds.
- Default expected returns of 5.6% for resources and 2.19% for fleet, relative to the appropriate metal-equivalent maximum.
- An optional probability-based model with editable event probabilities and fleet valuation.
- Explicit computer multiplier, fuel costs, average losses and fleet realization percentage.
- Shareable settings in the page URL.

## Model

MSU = metal + 1.5 × crystal + 3 × deuterium.

The default coefficients are estimates from the linked community discussion. The probability model assumes 90% small, 9% medium and 1% large finds, with mean size 0.17675 of the relevant maximum. With resource probability 34.5%, ship probability 16.5%, and fleet MSU/structure factor 1.5, it yields 5.58971875% resource MSU and 2.18728125% fleet MSU per dispatched expedition.

Resource and fleet boosts must be kept separate. Total bonuses are entered manually, including applicable technology, T18 and item effects. Technology-level and investment-cost calculations are not implemented. Fleet value is not the same as liquid resources; adjust the realization percentage for scrapping. Fuel, losses and computer effects are explicit assumptions. Dark matter, items and combat income are excluded.

## Development

No build or dependencies are required. Serve this directory with any static web server.

```sh
node --test tests/*.test.cjs
```

## Deployment

The workflow tests the calculator and publishes the static files to GitHub Pages. If automatic Pages enablement is unavailable, select **Settings → Pages → Source → GitHub Actions**, then rerun the workflow.

## Sources

- [Russian community discussion, page 22](https://board.ru.ogame.gameforge.com/index.php?thread/108739/&pageNo=22)
- [GhostR1der calculations, page 23](https://board.ru.ogame.gameforge.com/index.php?thread/108739/&pageNo=23)
- [Expedition questions, English forum](https://board.en.ogame.gameforge.com/index.php?thread/849973-expedition-questions/)
