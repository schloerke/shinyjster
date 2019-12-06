run_headless <- function(
  apps = apps_to_test(),
  port = 8000,
  host = "127.0.0.1",
  debug_port = 9222
) {
  op_browser <- getOption("browser")
  on.exit({
    options(browser = op_browser)
  }, add = TRUE)
  options(
    browser = paste(
      "/Applications/Google\\ Chrome.app/Contents/MacOS/Google\\ Chrome",
        "--headless",
        "--disable-gpu",
        paste0("--remote-debugging-port=", debug_port)
    )
  )

  run_jster_apps_lapply(apps = apps, port = port, host = host)
}
