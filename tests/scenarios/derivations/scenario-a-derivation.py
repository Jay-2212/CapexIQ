# Independent derivation for tests/scenarios/simple-cash-purchase.test.ts (golden
# scenario A). This script re-implements NPV/IRR/EAC/simple-payback/discounted-payback
# from first principles in plain Python — it does NOT import anything from /formulas —
# so the expected values asserted in that test file are checked against a second,
# independent implementation, not just a snapshot of the TypeScript code under test.
#
# Run with: python3 tests/scenarios/derivations/scenario-a-derivation.py
# (No dependencies beyond the standard library. Not run by CI — it's a derivation
# record, not a test; the TypeScript test file is what CI actually executes.)

PURCHASE_COST = 2_000_000
INSTALLATION_COST = 100_000
INITIAL_INVESTMENT = PURCHASE_COST + INSTALLATION_COST  # 2,100,000

USAGE_PER_DAY = 10
BILLED_TARIFF_PER_USE = 800
WORKING_DAYS_PER_MONTH = 25
REALIZATION_PCT = 100  # single cash payer, no claim deduction, no DSO

VARIABLE_COST_PER_USE = 50
STAFF_COST_PER_MONTH = 40_000
ELECTRICITY_COST_PER_MONTH = 5_000

WARRANTY_YEARS = 5
CMC_YEARS = 2
CMC_ANNUAL_COST = 60_000
AMC_ANNUAL_COST = 40_000
USEFUL_LIFE_YEARS = 8
DISCOUNT_RATE_PCT = 12.5


def annual_operating_surplus():
    realized_per_use = BILLED_TARIFF_PER_USE * (REALIZATION_PCT / 100)  # 800
    monthly_realized = USAGE_PER_DAY * realized_per_use * WORKING_DAYS_PER_MONTH  # 200,000
    annual_revenue = monthly_realized * 12  # 2,400,000
    annual_variable_cost = USAGE_PER_DAY * VARIABLE_COST_PER_USE * WORKING_DAYS_PER_MONTH * 12  # 150,000
    annual_fixed_cost = (STAFF_COST_PER_MONTH + ELECTRICITY_COST_PER_MONTH) * 12  # 540,000
    return annual_revenue - annual_variable_cost - annual_fixed_cost  # 1,710,000


def maintenance_cost_for_year(year_number):
    # year_number is 1-indexed
    if year_number <= WARRANTY_YEARS:
        return 0
    if year_number <= WARRANTY_YEARS + CMC_YEARS:
        return CMC_ANNUAL_COST
    return AMC_ANNUAL_COST


def annual_net_cash_flows():
    surplus = annual_operating_surplus()
    return [surplus - maintenance_cost_for_year(y) for y in range(1, USEFUL_LIFE_YEARS + 1)]


def npv(discount_rate_pct, initial_investment, cash_flows):
    rate = discount_rate_pct / 100
    total = sum(cf / (1 + rate) ** (i + 1) for i, cf in enumerate(cash_flows))
    return total - initial_investment


def irr(initial_investment, cash_flows, lo=-0.99, hi=10.0, iterations=200):
    # Plain bisection — independent of formulas/irr.ts's own bisection implementation
    # (different language, different bracket range, same well-defined math problem).
    def npv_at(rate):
        return sum(cf / (1 + rate) ** (i + 1) for i, cf in enumerate(cash_flows)) - initial_investment

    lo_v, hi_v = npv_at(lo), npv_at(hi)
    assert lo_v * hi_v < 0, "no sign change in bracket"
    for _ in range(iterations):
        mid = (lo + hi) / 2
        mid_v = npv_at(mid)
        if abs(mid_v) < 1e-6:
            return mid * 100
        if (mid_v > 0) == (lo_v > 0):
            lo, lo_v = mid, mid_v
        else:
            hi = mid
    return (lo + hi) / 2 * 100


def simple_payback(initial_investment, flat_annual_surplus):
    return initial_investment / flat_annual_surplus


def payback_from_cash_flows(initial_investment, cash_flows):
    cumulative = 0.0
    for year_index, cf in enumerate(cash_flows):
        if cf > 0 and cumulative + cf >= initial_investment:
            return year_index + (initial_investment - cumulative) / cf
        cumulative += cf
    return float("inf")


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


def equivalent_annual_cost(initial_investment, costs_by_year, discount_rate_pct, useful_life_years):
    rate = discount_rate_pct / 100
    present_value_of_costs = initial_investment + sum(
        cost / (1 + rate) ** (i + 1) for i, cost in enumerate(costs_by_year)
    )
    annuity_factor = useful_life_years if rate == 0 else (1 - (1 + rate) ** -useful_life_years) / rate
    return present_value_of_costs / annuity_factor


if __name__ == "__main__":
    surplus = annual_operating_surplus()
    cash_flows = annual_net_cash_flows()
    print("annual operating surplus:", surplus)  # expect 1,710,000
    print("annual net cash flows:", cash_flows)
    print("NPV @ 12.5%:", round(npv(DISCOUNT_RATE_PCT, INITIAL_INVESTMENT, cash_flows), 2))  # expect ~6,176,803.66
    print("IRR:", round(irr(INITIAL_INVESTMENT, cash_flows), 4), "%")  # expect ~80.5921
    print("simple payback:", round(simple_payback(INITIAL_INVESTMENT, surplus), 5))  # expect ~1.22807
    print("cash-flow payback:", round(payback_from_cash_flows(INITIAL_INVESTMENT, cash_flows), 5))
    print("discounted payback:", round(discounted_payback(INITIAL_INVESTMENT, cash_flows, DISCOUNT_RATE_PCT), 5))
    annual_variable_cost = USAGE_PER_DAY * VARIABLE_COST_PER_USE * WORKING_DAYS_PER_MONTH * 12
    annual_fixed_cost = (STAFF_COST_PER_MONTH + ELECTRICITY_COST_PER_MONTH) * 12
    annual_costs = [annual_variable_cost + annual_fixed_cost + maintenance_cost_for_year(y) for y in range(1, USEFUL_LIFE_YEARS + 1)]
    print("EAC:", round(equivalent_annual_cost(INITIAL_INVESTMENT, annual_costs, DISCOUNT_RATE_PCT, USEFUL_LIFE_YEARS), 2))  # expect ~1,134,791.81
