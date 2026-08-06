# Independent derivation for tests/scenarios/non-viable-and-edge-cases.test.ts (golden
# scenario C — non-viable purchase, 1-year useful life). Same first-principles
# NPV/IRR/payback re-implementation as scenario-a-derivation.py (no import from
# /formulas); see that file's header for the general approach.
#
# Run with: python3 tests/scenarios/derivations/scenario-c-derivation.py

PURCHASE_COST = 5_000_000
INSTALLATION_COST = 500_000
INITIAL_INVESTMENT = PURCHASE_COST + INSTALLATION_COST  # 5,500,000

USAGE_PER_DAY = 2  # deliberately far below break-even
BILLED_TARIFF_PER_USE = 1000
REALIZATION_PCT = 90
WORKING_DAYS_PER_MONTH = 25

VARIABLE_COST_PER_USE = 400
STAFF_COST_PER_MONTH = 200_000  # disproportionate to volume, deliberately
ELECTRICITY_COST_PER_MONTH = 20_000
DISCOUNT_RATE_PCT = 12.5


def npv(discount_rate_pct, initial_investment, cash_flows):
    rate = discount_rate_pct / 100
    total = sum(cf / (1 + rate) ** (i + 1) for i, cf in enumerate(cash_flows))
    return total - initial_investment


def simple_payback(initial_investment, flat_annual_cash_flow):
    if flat_annual_cash_flow <= 0:
        return float("inf")
    return initial_investment / flat_annual_cash_flow


def discounted_payback(initial_investment, cash_flows, discount_rate_pct):
    rate = discount_rate_pct / 100
    cumulative = 0.0
    for year_index, cf in enumerate(cash_flows):
        discounted_cf = cf / (1 + rate) ** (year_index + 1)
        shortfall = initial_investment - cumulative
        if discounted_cf > 0 and cumulative + discounted_cf >= initial_investment:
            return year_index + shortfall / discounted_cf
        cumulative += discounted_cf
    return None


if __name__ == "__main__":
    realized_per_use = BILLED_TARIFF_PER_USE * (REALIZATION_PCT / 100)  # 900
    monthly_realized = USAGE_PER_DAY * realized_per_use * WORKING_DAYS_PER_MONTH  # 45,000
    annual_realized = monthly_realized * 12  # 540,000
    annual_variable_cost = USAGE_PER_DAY * VARIABLE_COST_PER_USE * WORKING_DAYS_PER_MONTH * 12  # 240,000
    annual_fixed_cost = (STAFF_COST_PER_MONTH + ELECTRICITY_COST_PER_MONTH) * 12  # 2,640,000
    annual_operating_surplus = annual_realized - annual_variable_cost - annual_fixed_cost

    contribution_per_use = realized_per_use - VARIABLE_COST_PER_USE  # 500
    break_even_usage_per_day = (annual_fixed_cost / 12) / contribution_per_use / WORKING_DAYS_PER_MONTH

    print("realized revenue per use:", realized_per_use)  # expect 900
    print("annual realized revenue:", annual_realized)  # expect 540,000
    print("annual variable cost:", annual_variable_cost)  # expect 240,000
    print("annual fixed cost:", annual_fixed_cost)  # expect 2,640,000
    print("annual operating surplus:", annual_operating_surplus)  # expect -2,340,000
    print("contribution per use:", contribution_per_use)  # expect 500
    print("break-even usage/day:", round(break_even_usage_per_day, 4))  # expect ~17.6

    result_npv = npv(DISCOUNT_RATE_PCT, INITIAL_INVESTMENT, [annual_operating_surplus])
    print("NPV @ 12.5% (1-year horizon):", round(result_npv, 2))  # expect ~-7,580,000

    print("simple payback:", simple_payback(INITIAL_INVESTMENT, annual_operating_surplus))  # expect inf
    print("discounted payback:", discounted_payback(INITIAL_INVESTMENT, [annual_operating_surplus], DISCOUNT_RATE_PCT))  # expect None

    roi_cash_flow = (annual_operating_surplus / INITIAL_INVESTMENT) * 100
    print("ROI (cash-flow view):", round(roi_cash_flow, 4))  # expect ~-42.5455
