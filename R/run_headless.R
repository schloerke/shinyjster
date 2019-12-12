#' Run many applications with shinyjster enabled
#'
#' @inheritParams shiny::runApp
#' @param apps Vector of `appDir` values
#' @param debug_port Port for chrome debugger
#' @param browser Browser to be set for testing.  If using `"chrome"` or `"firefox"`, the system application will be used.
#' @rdname run_headless
#' @export
run_headless <- function(
  apps = apps_to_test(),
  port = 8000,
  host = "127.0.0.1",
  debug_port = 9222,
  browser = c("chrome", "firefox")
) {
  system <-
    if (.Platform[["OS.type"]] == "unix") {
      if (Sys.info()[["sysname"]] == "Darwin") {
        "macOS"
      } else {
        "Linux"
      }
    } else {
      "Windows"
    }

  browser <- switch(
    # only match on the first element... avoids having to use missing or pmatch
    browser[1],
    "chrome" = paste(
        switch(system,
          "macOS" = "/Applications/Google\\ Chrome.app/Contents/MacOS/Google\\ Chrome",
          "Linux" = "google-chrome",
          stop("Google chrome not implemented for system: ", system)
        ),
        "--headless",
        "--disable-gpu",
        "--remote-debugging-port=", debug_port
    ),
    "firefox" = paste0(
      switch(system,
        "macOS" = "/Applications/Firefox.app/Contents/MacOS/firefox-bin",
        "Linux" = "firefox",
        stop("Firefox not implemented for system: ", system)
      ),
      " -headless", # it is a single dash
      " --start-debugger-server ", debug_port
    ),
    # pass through
    browser
  )
  op_browser <- getOption("browser")
  on.exit({
    options(browser = op_browser)
  }, add = TRUE)
  options(browser = browser)

  run_jster_apps_lapply(apps = apps, port = port, host = host)
}
