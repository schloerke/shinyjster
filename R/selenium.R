
selenium_browser <- function(
  url,
  browser_name = c("chrome", "firefox", "edge", "ie"),
  headless = TRUE,
  timeout = 2 * 60
) {

  # check and download

  if (!is.character(url) || length(timeout) != 1) {
    stop("`url` must be a character value of size 1")
  }
  browser_name <- match.arg(browser_name)
  headless <- isTRUE(headless)
  if (!is.numeric(timeout) || length(timeout) != 1) {
    stop("`timeout` must be a numeric value of size 1")
  }
  if (timeout < 30) {
    message("`timeout` should be at least 30 seconds. Setting `timeout` to 30 seconds")
    # timeout <- 30
  } else if (timeout > 600) {
    message("`timeout` should not be more than 10 minutes (600 seconds). Setting `timeout` to 600 seconds")
    timeout <- 600
  }

  selenium_file <- system.file("selenium/selenium.jar", package = "shinyjster")
  p <- processx::process$new(
    "java",
    c(
      "-jar",
      selenium_file,
      "--url", url,
      "--timeout", floor(timeout),
      if (headless) "--headless",
      "--browser", browser_name
    ),
    stdout = "|",     # be able to read stdout
    stderr= "2>&1",   # put error output in stdout
    echo_cmd = TRUE,  # display command
    supervise = FALSE, # kill when R process is terminated
    cleanup = FALSE   # do not kill on gc
  )
  p_check <- function() {
    if(p$is_alive()) {
      later::later(p_check, delay = 0.1)
      return()
    }
    if (!identical(p$get_exit_status(), 0L)) {
      cat("Output:\n")
      cat(
        p$read_output()
      )
      stop("Browser did not exit with a status of 0. Status: ", p$get_exit_status())
    }
  }
  p_check()

}


#' Selenium browsers
#'
#' Opens a selenium driven browser and waits until shinyjster is finished.
#'
#' This function assumes selenium is installed and all appropriate web browsers are installed.
#'
#' @param timeout Number of seconds before selenium closes the browser
#' @param headless Logical which determines if the browser can run headless
#' @describeIn selenium Opens a Chrome web browser
#' @export
selenium_chrome <- function(timeout = 2 * 60, headless = FALSE) {
  function(url) {
    selenium_browser(url, "chrome", headless, timeout)
  }
}
#' @describeIn selenium Opens a Firefox web browser
#' @export
selenium_firefox <- function(timeout = 2 * 60, headless = FALSE) {
  function(url) {
    selenium_browser(url, "firefox", headless, timeout)
  }
}
#' @describeIn selenium Opens an Edge web browser
#' @export
selenium_edge <- function(timeout = 2 * 60, headless = FALSE) {
  function(url) {
    selenium_browser(url, "edge", headless, timeout)
  }
}
#' @describeIn selenium Opens an IE web browser
#' @export
selenium_ie <- function(timeout = 2 * 60, headless = FALSE) {
  function(url) {
    selenium_browser(url, "ie", headless, timeout)
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