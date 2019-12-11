function prettyJSON(x: any) {
  return JSON.stringify(x, null, "  ");
}

function isEqual(x: any, y: any) {
  const xStr = prettyJSON(x);
  const yStr = prettyJSON(y);

  if (xStr !== yStr) {
    console.log("x:", x);
    console.log("y:", y);
    throw {
      message: `\`${x.toString()}\` does not equal \`${y.toString()}\``,
      x: x,
      y: y,
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
      message: `fn is not a function. fn: \`${fn.toString()}\``,
      fn: fn.toString(),
    };
  }
}

export { isEqual, isTrue, isFalse, prettyJSON, isFunction };
