
selenium_browser <- function(
  url,
  browser_name = c("chrome", "firefox", "edge", "iexplorer"),
  timeout = 2 * 60,
  dimensions = "1800x1200",
  verbose = TRUE,
  ...
) {

  # check and download

  if (!is.character(url) || length(timeout) != 1) {
    stop("`url` must be a character value of size 1")
  }
  browser_name <- match.arg(browser_name)
  if (!is.numeric(timeout) || length(timeout) != 1) {
    stop("`timeout` must be a numeric value of size 1")
  }
  if (timeout < 30) {
    # message("`timeout` should be at least 30 seconds. Setting `timeout` to 30 seconds")
    # timeout <- 30
  } else if (timeout > 600) {
    message("`timeout` should not be more than 10 minutes (600 seconds). Setting `timeout` to 600 seconds")
    timeout <- 600
  }
  if (!is.character(dimensions)) {
    stop("`dimensions` should be a character string in the form of `WIDTHxHEIGHT")
  }

  selenium_file <- system.file("selenium/selenium.jar", package = "shinyjster")

  # java -jar selenium.jar chrome 1200x800 https://news.google.com/ 30 --headless
  p <- processx::process$new(
    "java",
    c(
      "-jar",
      selenium_file,
      browser_name,
      dimensions,
      url,
      timeout,
      ...
    ),
    stdout = "|",      # be able to read stdout
    stderr= "2>&1",    # put error output in stdout
    echo_cmd = TRUE,   # display command
    supervise = TRUE,  # do not supervise process
    cleanup = FALSE    # do not kill on gc
  )

  if (isTRUE(verbose)) {
    # display output
    p_output <- function() {
      output <- p$read_output_lines()
      if (length(output) > 0) {
        cat("pxjava - ", output, "\n")
      }

      if (p$is_alive()) {
        later::later(delay = 0.1, p_output)
      } else {
        cat("pxjava - Selenium Processx closed\n")
      }

      invisible()
    }
    p_output()
  }

  invisible(p)
}


#' Selenium browsers
#'
#' Opens a selenium driven browser and waits until shinyjster is finished.
#'
#' This function assumes selenium is installed and all appropriate web browsers are installed.
#'
#' @param timeout Number of seconds before selenium closes the browser
#' @param dimensions A string in the form of \verb{"WIDTHxHEIGHT"}. Ex: \code{"1800x1200"}
#' @param headless Logical which determines if the browser can run headless. Defaults to \code{TRUE} where possible.
#' @param verbose Logical which determines if the selenium output is displayed as it's received
#' @describeIn selenium Opens a Chrome web browser
#' @export
selenium_chrome <- function(timeout = 2 * 60, dimensions = "1200x1200", headless = FALSE, verbose = TRUE) {
  function(url) {
    selenium_browser(
      url = url,
      browser_name = "chrome",
      timeout = timeout,
      dimensions = dimensions,
      verbose = verbose,
      if (isTRUE(headless)) "--headless"
    )
  }
}
#' @describeIn selenium Opens a Firefox web browser
#' @export
selenium_firefox <- function(timeout = 2 * 60, dimensions = "1200x1200", headless = FALSE, verbose = TRUE) {
  function(url) {
    selenium_browser(
      url = url,
      browser_name = "firefox",
      timeout = timeout,
      dimensions = dimensions,
      verbose = verbose,
      if (isTRUE(headless)) "-headless"
    )
  }
}
#' @describeIn selenium Opens an Edge web browser
#' @export
selenium_edge <- function(timeout = 2 * 60, dimensions = "1200x1200", verbose = TRUE) {
  function(url) {
    selenium_browser(
      url = url,
      browser_name = "edge",
      timeout = timeout,
      dimensions = dimensions,
      verbose = verbose
    )
  }
}
#' @describeIn selenium Opens an IE web browser
#' @export
selenium_ie <- function(timeout = 2 * 60, dimensions = "1200x1200", verbose = TRUE) {
  function(url) {
    selenium_browser(
      url = url,
      browser_name = "iexplorer",
      timeout = timeout,
      dimensions = dimensions,
      verbose = verbose
    )
  }
}



selenium_build <- function() {
  selenium_folder <- system.file("selenium", package = "shinyjster")

  system(paste0(
    "cd '", selenium_folder, "' && ",
    "mvn package"
  ))

  # find file
  with_deps_file <- dir(file.path(selenium_folder, "target"), full.names = TRUE, pattern = "with-dependencies.jar$")[1]
  # copy file
  jar_save_file <- file.path(selenium_folder, "selenium.jar")
  file.copy(with_deps_file, jar_save_file, overwrite = TRUE)
}
