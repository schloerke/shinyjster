function escape(str, forR = false) {
  let ret = str.replace(/[^\0-~]/g, function(ch) {
    return "\\u" + ("000" + ch.charCodeAt().toString(16)).slice(-4);
  });

  if (forR) {
    // make all back slashes double back slashes
    ret = ret.replace(/\\u/g, "\\\\u");
  }

  return ret;
}

export { escape };
