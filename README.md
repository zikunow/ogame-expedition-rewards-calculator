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

Resource and fleet boosts must be kept separate. Total bonuses are entered manually, including applicable technology, T18 and item effects. The collapsible pro settings calculate bonuses from summed T4/T5/T11/T18 levels, a shared lifeform experience level and building boost. Editing technology levels immediately applies their calculated bonuses to the percentage fields. Editing those percentages manually uses the supplied values instead. There is no mode checkbox. Investment-cost calculation is not implemented. Fleet value is not the same as liquid resources; adjust the realization percentage for scrapping. Fuel, losses and computer effects are explicit assumptions. Dark matter, items and combat income are excluded.

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

## Pro technology settings

Sum each technology across all planets; 18 planets with level 20 means 360. Shared amplification is A = 1 + experience × 0.001 + building boost / 100. T4 adds 0.002 × summed levels × A to fleet yield; T5 and T11 add the same amount to resource yield. T18 adds 0.002 × summed levels × A as a separate factor multiplying both yields. This follows the empirically reported live-game stacking in the [Polish community measurements](https://forum.pl.ogame.gameforge.com/forum/thread/19167-18-slot-bada%C5%84-form-wzmocnienie-odkrywca/), rather than the intended-only-50%-class-bonus interpretation also discussed in older sources.

Final multipliers relative to the unboosted Discoverer/Pathfinder baseline are (1 + resource bonus) × (1 + T18 bonus) and (1 + fleet bonus) × (1 + T18 bonus). Technology names and 0.2% per-level effects are documented in the [official forum expedition guide](https://board.en.ogame.gameforge.com/index.php?thread/858580-expeditions-you-the-advanced-guide/).

If planet boosts differ, enter effective weighted levels and leave shared amplification at zero. Expedition count remains an explicit input including any T18 slots. Items are not inferred in pro mode; use total percentage mode or manual final caps to model them.
