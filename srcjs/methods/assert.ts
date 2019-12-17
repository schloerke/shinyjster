import stringify from "util-inspect";

function prettyJSON(x: any) {
  return stringify(x, { depth: 4 });
}

function shortString(xStr: string, maxLength = 20) {
  if (xStr.length <= maxLength) {
    return xStr;
  }
  return `${xStr.slice(0, maxLength)}...`;
}

function isEqual(x: any, y: any, contextObj: any = undefined) {
  const xStr = prettyJSON(x);
  const yStr = prettyJSON(y);

  if (xStr != yStr) {
    console.log("x:", x);
    console.log("y:", y);
    const throwObj: {
      message: string;
      x: any;
      y: any;
      xStr: string;
      yStr: string;
      contextStr?: string;
    } = {
      message: `${shortString(xStr)} does not equal ${shortString(yStr)}`,
      x: x,
      y: y,
      xStr: xStr,
      yStr: yStr,
    };

    if (contextObj) {
      console.log("context: ", contextObj);
      throwObj.contextStr = prettyJSON(contextObj);
    }

    throw throwObj;
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
