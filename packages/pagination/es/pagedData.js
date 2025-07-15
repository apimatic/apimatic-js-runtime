import { __spreadArray, __read, __awaiter, __generator, __assign } from './_virtual/_tslib.js';
import { StrategySelector } from './strategySelector.js';
function createPagedData(executor, createPagedResponse, extractItems) {
  var paginationStrategies = [];
  for (var _i = 3; _i < arguments.length; _i++) {
    paginationStrategies[_i - 3] = arguments[_i];
  }
  return function (request, updater) {
    return new (PagedData.bind.apply(PagedData, __spreadArray([void 0, request, executor, updater, createPagedResponse, extractItems], __read(paginationStrategies), false)))();
  };
}
var PagedData =
/*#__PURE__*/
/** @class */
function () {
  function PagedData(request, requestExecutor, requestUpdater, pagedResponseCreator, itemsCreator) {
    var _a;
    var paginationStrategies = [];
    for (var _i = 5; _i < arguments.length; _i++) {
      paginationStrategies[_i - 5] = arguments[_i];
    }
    var _this = this;
    this.request = request;
    this.requestExecutor = requestExecutor;
    this.requestUpdater = requestUpdater;
    this.pagedResponseCreator = pagedResponseCreator;
    this.itemsCreator = itemsCreator;
    this.pages = (_a = {}, _a[Symbol.asyncIterator] = function () {
      return _this.createAsyncIterator(_this.getNextPage.bind(_this));
    }, _a);
    this.paginationStrategies = paginationStrategies;
  }
  PagedData.prototype[Symbol.asyncIterator] = function () {
    return this.createAsyncIterator(this.getNextItem.bind(this));
  };
  PagedData.prototype.createAsyncIterator = function (getNext) {
    var state = {
      requestUpdater: this.requestUpdater,
      request: this.request,
      response: null,
      itemIndex: 0,
      items: [],
      strategySelector: new StrategySelector(this.paginationStrategies)
    };
    return {
      next: function () {
        return getNext(state);
      }
    };
  };
  PagedData.prototype.getNextItem = function (state) {
    return __awaiter(this, void 0, void 0, function () {
      var _a;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _a = state.itemIndex < state.items.length;
            if (_a) return [3 /*break*/, 2];
            return [4 /*yield*/, this.tryFetchingPage(state)];
          case 1:
            _a = _b.sent();
            _b.label = 2;
          case 2:
            if (_a) {
              return [2 /*return*/, {
                done: false,
                value: state.items[state.itemIndex++]
              }];
            }
            return [2 /*return*/, {
              done: true,
              value: undefined
            }];
        }
      });
    });
  };
  PagedData.prototype.getNextPage = function (state) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            return [4 /*yield*/, this.tryFetchingPage(state)];
          case 1:
            if (_a.sent()) {
              return [2 /*return*/, {
                done: false,
                value: this.pagedResponseCreator(state.response)
              }];
            }
            return [2 /*return*/, {
              done: true,
              value: undefined
            }];
        }
      });
    });
  };
  PagedData.prototype.tryFetchingPage = function (state) {
    return __awaiter(this, void 0, void 0, function () {
      var strategy, response, items;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            strategy = state.strategySelector.select(state);
            if (strategy === null) {
              return [2 /*return*/, false];
            }
            return [4 /*yield*/, this.requestExecutor(state.request)];
          case 1:
            response = _a.sent();
            items = this.itemsCreator(response);
            if (!items || items.length === 0) {
              return [2 /*return*/, false];
            }
            state.itemIndex = 0;
            state.items = items;
            state.response = strategy.applyMetaData(__assign(__assign({}, response), {
              items: items
            }));
            return [2 /*return*/, true];
        }
      });
    });
  };
  return PagedData;
}();
export { createPagedData };