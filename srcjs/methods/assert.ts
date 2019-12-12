function prettyJSON(x: any) {
  return JSON.stringify(x, null, "  ");
}

function shortString(xStr: string, maxLength = 20) {
  if (xStr.length <= maxLength) {
    return xStr;
  }
  return `${xStr.slice(0, maxLength)}...`;
}

function isEqual(x: any, y: any) {
  const xStr = prettyJSON(x);
  const yStr = prettyJSON(y);

  if (xStr != yStr) {
    console.log("x:", x);
    console.log("y:", y);
    throw {
      message: `${shortString(xStr)} does not equal ${shortString(yStr)}`,
      x: x,
      y: y,
      xStr: xStr,
      yStr: yStr,
    };
  }
  return true;
}

function isTrue(x: any) {
  return isEqual(x, true);
}

function isFalse(x: any) {
  return isEqual(x, false);
}

function isFunction(fn: any) {
  if (typeof fn !== "function") {
    console.log("fn: ", fn);
    throw {
      message: `fn is not a function. fn: ${shortString(fn.toString())}`,
      fn: fn.toString(),
    };
  }
}

export { isEqual, isTrue, isFalse, prettyJSON, isFunction };
