import { __read, __values } from './_virtual/_tslib.js';
function extractQueryParams(link) {
  var e_1, _a;
  var result = {};
  var _b = __read(link.split('?'), 2),
    query = _b[1];
  var decodedEqualsQuery = decodeURIComponent(query);
  var queryParams = decodedEqualsQuery.split('&');
  var _loop_1 = function (queryParam) {
    var _c = __read(queryParam.split('='), 2),
      key = _c[0],
      value = _c[1];
    if (key) {
      var queryPointer = '$request.query#/' + decodeURIComponent(key);
      result[queryPointer] = function () {
        return decodeURIComponent(value || '');
      };
    }
  };
  try {
    for (var queryParams_1 = __values(queryParams), queryParams_1_1 = queryParams_1.next(); !queryParams_1_1.done; queryParams_1_1 = queryParams_1.next()) {
      var queryParam = queryParams_1_1.value;
      _loop_1(queryParam);
    }
  } catch (e_1_1) {
    e_1 = {
      error: e_1_1
    };
  } finally {
    try {
      if (queryParams_1_1 && !queryParams_1_1.done && (_a = queryParams_1.return)) _a.call(queryParams_1);
    } finally {
      if (e_1) throw e_1.error;
    }
  }
  return result;
}
function getValueByJsonPointer(response, pointer) {
  var _a = __read(pointer.split('#'), 2),
    prefix = _a[0],
    jsonPath = _a[1];
  if (prefix === '$response.body') {
    return extractFromResponseBody(response.body, jsonPath);
  }
  if (prefix === '$response.headers') {
    return extractValueFromJsonPointer(response.headers, jsonPath);
  }
  return null;
}
function extractFromResponseBody(body, jsonPath) {
  if (typeof body !== 'string') {
    return null;
  }
  try {
    body = JSON.parse(body);
  } catch (_a) {
    // ignore error
  }
  return extractValueFromJsonPointer(body, jsonPath);
}
function extractValueFromJsonPointer(obj, pointer) {
  var e_2, _a;
  if (pointer === '') {
    return obj;
  }
  var pathParts = pointer.split('/').filter(Boolean);
  var result = obj;
  try {
    for (var pathParts_1 = __values(pathParts), pathParts_1_1 = pathParts_1.next(); !pathParts_1_1.done; pathParts_1_1 = pathParts_1.next()) {
      var key = pathParts_1_1.value;
      if (!result || typeof result !== 'object' || !(key in result)) {
        return null;
      }
      result = result[key];
    }
  } catch (e_2_1) {
    e_2 = {
      error: e_2_1
    };
  } finally {
    try {
      if (pathParts_1_1 && !pathParts_1_1.done && (_a = pathParts_1.return)) _a.call(pathParts_1);
    } finally {
      if (e_2) throw e_2.error;
    }
  }
  return result;
}
export { extractQueryParams, getValueByJsonPointer };