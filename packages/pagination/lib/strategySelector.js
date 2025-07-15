"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StrategySelector = void 0;
var tslib_1 = require("tslib");
var StrategySelector = /** @class */ (function () {
    function StrategySelector(strategies) {
        this.strategies = strategies;
        this.selectedStrategy = null;
    }
    StrategySelector.prototype.select = function (state) {
        if (this.selectedStrategy === null) {
            return this.selectStrategy(state);
        }
        return this.selectedStrategy.tryPreparingRequest(state)
            ? this.selectedStrategy
            : null;
    };
    StrategySelector.prototype.selectStrategy = function (state) {
        var e_1, _a;
        try {
            for (var _b = tslib_1.__values(this.strategies), _c = _b.next(); !_c.done; _c = _b.next()) {
                var strategy = _c.value;
                if (!strategy.tryPreparingRequest(state)) {
                    continue;
                }
                if (state.response !== null) {
                    // select strategy, if not the first API call i.e. response received.
                    this.selectedStrategy = strategy;
                }
                return strategy;
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_1) throw e_1.error; }
        }
        return null;
    };
    return StrategySelector;
}());
exports.StrategySelector = StrategySelector;
