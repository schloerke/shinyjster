#' Run many applications with shinyjster enabled
#'
#' @inheritParams run_jster
#' @param debug_port Port for chrome debugger
#' @param browser Browser to be set for testing.  If using `"chrome"` or `"firefox"`, the system application will be used.
#' @param assert Logical which determines if [assert_jster] should be run on the final output
#' @rdname run_headless
#' @export
run_headless <- function(
  apps = apps_to_test(),
  port = 8000,
  host = "127.0.0.1",
  debug_port = NULL,
  browser = c("chrome", "firefox"),
  type = c("lapply", "parallel", "callr"),
  assert = TRUE
) {

  if (missing(browser)) {
    browser <- match.arg(browser)
  }

  if (
    is.character(browser) &&
    length(browser) == 1 &&
    browser %in% c("chrome", "firefox")
  ) {
    system <- gh_actions_system()

    if (is.null(debug_port)) {
      debug_port <- switch(browser,
        "chrome" = 9222,
        "firefox" = 9223,
        9221
      )
    }

    browser <- switch(
      browser,
      "chrome" = local({
        program <- switch(
          system,
          "macOS" = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
          "Linux" = "google-chrome",
          "Windows" = "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
          stop("Google chrome not implemented for system: ", system)
        )
        function(url) {
          browse_url(
            url,
            program,
            c(
              "--headless",
              "--disable-gpu",
              paste0("--remote-debugging-port=", debug_port)
            )
          )
        }
      }),
      "firefox" = local({
        program <- switch(
          system,
          "macOS" = "/Applications/Firefox.app/Contents/MacOS/firefox-bin",
          "Linux" = "firefox",
          stop("Firefox not implemented for system: ", system)
        )
        function(url) {
          browse_url(
            url,
            program,
            c(
              "-P", "headless",
              "-headless", # it is a single dash
              "-new-tab",
              # https://developer.mozilla.org/en-US/docs/Tools/Remote_Debugging/Debugging_Firefox_Desktop
              # Note: in Windows, the start-debugger-server call will only have one dash:
              "--start-debugger-server", debug_port
            )
          )
        }
      }),

      # pass through
      stop("Browser value not implemented. Browser: ", browser)
    )
  }

  op_browser <- getOption("browser")
  on.exit({
    options(browser = op_browser)
  }, add = TRUE)
  options(browser = browser)

  ret <- run_jster_apps(apps = apps, port = port, host = host, type = match.arg(type))

  if (assert) {
    assert_jster(ret)
  } else {
    ret
  }
}


gh_actions_system <- function() {
  if (.Platform[["OS.type"]] == "unix") {
    if (Sys.info()[["sysname"]] == "Darwin") {
      "macOS"
    } else {
      "Linux"
    }
  } else {
    "Windows"
  }
}

browse_url <- function(url, program, args, ..., wait = FALSE) {
  if (gh_actions_system() == "Windows") {
    system2(program, c(args, url), ..., wait = wait)
  } else {
    browseURL(url, paste0(c(paste0("'", program, "'"), args), collapse = " "))
  }
}
