
#' Run an application with shinyjster enabled
#'
#' @inheritParams shiny::runApp
#' @inheritParams utils::browseURL
#' @describeIn run_jster Run a single shiny application with shinyjster enabled
#' @export
run_jster <- function(appDir, port = 8000, host = "127.0.0.1", browser = getOption("browser")) {
  ######
  # START-NAMESPACED-CODE
  # # MUST be written to namespace all outside functions... allows for use when passed into callr
  ######

  if (is.null(port)) {
    port <- httpuv::randomPort()
  }

  # if the dir contains index.Rmd
  has_index_rmd_file <- (dir.exists(appDir) && any(grepl("^index\\.Rmd$", dir(appDir))))

  url <- paste0("http://", host, ":", port, "/", if (has_index_rmd_file) "index.Rmd", "?shinyjster=1")
  force(browser)
  force(url)
  proc <- NULL
  later::later(delay = 0.5, function() {
    proc <<- utils::browseURL(url, browser = browser)
  })

  # check to see if the browser did not start properly
  check_if_bad_exit <- function() {
    if (!inherits(proc, "process")) {
      # not a processx obj.
      return()
    }

    if (proc$is_alive()) {
      # process is working after 10 seconds, success!
      return()
    }
    # proc is dead
    # This should only happen on a failure to start the browser application
    # Therefore Shiny did not get a chance to load a url / test
    if (!identical(proc$get_exit_status(), 0L)) {
      # had a bad exit.
      message("")
      cat("Output:\n")
      cat(proc$read_all_output())
      stop("Browser process exited with a non-zero status before Shiny closed. Status: ", proc$get_exit_status())
    }
  }
  # cancel the check if shiny has finished
  cancel_check <- later::later(delay = 10, check_if_bad_exit)

  if (has_index_rmd_file) {
    # use the index.Rmd file
    appDir <- file.path(appDir, "index.Rmd")
  }
  # if the dir is actually an Rmd file
  is_rmd_file <- (file.exists(appDir) && grepl("\\.rmd$", tolower(appDir)))

  if (is_rmd_file) {
    res <- rmarkdown::run(
      appDir,
      shiny_args = list(
        port = port,
        host = host,
        launch.browser = FALSE
      )
    )
  } else {
    # Run like a regular shiny app
    res <- shiny::runApp(
      appDir,
      port = port,
      host = host,
      launch.browser = FALSE
    )
  }
  # Shiny has finished. Don't care how the process exited
  cancel_check()

  # check process every so often and see if it has died
  # if dead, return FALSE. All function to return before full time has elapsed
  # if alive, return TRUE
  proc_is_alive <- function(after, verbose = FALSE) {
    sleep_val <- 0.2
    max_n <- after / sleep_val
    for (i in seq_len(floor(max_n))) {
      Sys.sleep(sleep_val)
      if (verbose) message("shinyjster - Checking browser...")
      if (!proc$is_alive()) {
        if (verbose) message("shinyjster - Browser is closed!")
        return(FALSE)
      }
    }
    return(TRUE)
  }

  # Try to clean up any processx calls
  if (inherits(proc, "process")) {
    if (proc_is_alive(after = 3)) {
      # If the process is still running, kill it.
      # The proc is not needed at this point and should not exist.
      message("shinyjster - Browser process is still alive. Sending SIGINT!")
      proc$signal(tools::SIGINT)
      if (proc_is_alive(after = 2, verbose = TRUE)) {
        message("shinyjster - Browser process is still alive after 2 seconds!!!")
      }
    }
  }

  tibble::tibble(
    appDir = appDir,
    successful = identical(res$type, "success"),
    returnValue = list(res)
  )
  ######
  # END-NAMESPACED-CODE
  ######
}



#' @param apps Vector of `appDir` values
#' @param type Single value to determine how applications are executed. \describe{
# '  \item{`'parallel'`}{Runs apps using `parallel::mclapply` using `cores` cores}
#'  \item{`'serial'`}{Runs apps one after another using `lapply`. `port` will be random for each app unless specified.}
#'  \item{`'callr'`}{Runs apps using `callr::r_bg` using `cores` cores. `port` will be random for each app to allow concurrent execution.}
#'  \item{`'lapply'`}{Runs apps in succession using `lapply`. `port` will be random for each app unless specified.}
#' }
#' @param cores Number of cores (if needed) to execute on.
#' @describeIn run_jster Run a set of Shiny applications with shinyjster enabled
#' @export
run_jster_apps <- function(
  apps,
  type = c("serial", "callr", "lapply"),
  cores = parallel::detectCores(),
  port = NULL,
  host = "127.0.0.1",
  browser = getOption("browser")
) {

  switch(match.arg(type),
    # "parallel" = run_jster_apps_parallel(apps, cores = cores, host = host, browser = browser),
    "callr" = run_jster_apps_callr(apps, cores = cores, host = host, browser = browser),
    "serial" = run_jster_apps_serial(apps, port = port, host = host, browser = browser),
    "lapply" = ,
    run_jster_apps_lapply(apps, port = port, host = host, browser = browser)
  )
}

run_jster_apps_lapply <- function(
  apps = apps_to_test(),
  port = NULL,
  host = "127.0.0.1",
  browser = getOption("browser")
) {
  ret <- lapply(apps, function(app) {
    cat("shinyjster - ", "starting app: ", basename(app), "\n", sep = "")
    on.exit({
      cat("shinyjster - ", "stopping app: ", basename(app), "\n", sep = "")
    }, add = TRUE)
    run_jster(app, port = port, host = host, browser = browser)
  })
  do.call(rbind, ret)
}

run_jster_apps_serial <- function(
  apps = apps_to_test(),
  port = NULL,
  host = "127.0.0.1",
  browser = getOption("browser")
){
  ret <- lapply(apps, function(app) {
    cat("shinyjster - ", "starting callr: ", basename(app), "\n", sep = "")
    on.exit({
      cat("shinyjster - ", "stopping callr: ", basename(app), "\n", sep = "")
    }, add = TRUE)

    callr::r(
      function(run_jster_, app_, port_, host_, browser_) {
        cat("shinyjster - ", "starting app: ", basename(app_), "\n", sep = "")

        on.exit({
          cat("shinyjster - ", "stopping app: ", basename(app_), "\n", sep = "")
        }, add = TRUE)

        run_jster_(app = app_, port = port_, host = host_, browser = browser_)
      },
      list(
        run_jster_ = run_jster,
        app_ = app,
        port_ = port,
        host_ = host,
        browser_ = browser
      ),
      show = TRUE,
      spinner = TRUE
    )
  })

  do.call(rbind, ret)
}


# run_jster_apps_parallel <- function(
#   apps = apps_to_test(),
#   cores = parallel::detectCores(),
#   host = "127.0.0.1",
#   browser = getOption("browser")
# ) {

#   if (!requireNamespace("httpuv", quietly = TRUE)) {
#     stop("httpuv must be installed for this function to work")
#   }

#   run_jster_ <- run_jster
#   ret <- parallel::mclapply(
#     apps,
#     mc.cores = cores,
#     mc.preschedule = FALSE,
#     FUN = function(app) {
#       cat("shinyjster - ", "launching app: ", basename(app), "\n", sep = "")
#       on.exit({
#         cat("shinyjster - ", "closing app: ", basename(app), "\n", sep = "")
#       }, add = TRUE)

#       run_jster_(
#         app,
#         port = httpuv::randomPort(),
#         host = host,
#         browser = browser
#       )
#     }
#   )

#   do.call(rbind, ret)
# }



run_jster_apps_callr <- function(
  apps = apps_to_test(),
  cores = parallel::detectCores(),
  host = "127.0.0.1",
  browser = getOption("browser")
) {

  if (!requireNamespace("httpuv", quietly = TRUE)) {
    stop("httpuv must be installed for this function to work")
  }
  if (!requireNamespace("callr", quietly = TRUE)) {
    stop("callr must be installed for this function to work")
  }
  original_apps <- apps

  processes <- replicate(cores, NULL)
  on.exit({
    for (i in seq_len(cores)) {
      if (!is.null(processes[[i]])) {
        if (processes[[i]]$p$is_alive()) {
          jster_message("killing core[", i, "]")
          processes[[i]]$p$kill()
        }
      }
    }
  })

  do_process <- function(i) {
    if (length(apps) == 0) return();

    app <- apps[length(apps)]
    apps <<- apps[-length(apps)]
    jster_message(cat = TRUE, "launching app on core[", i, "]: ", basename(app))
    processes[[i]] <<- list(
      app = app,
      p = callr::r_bg(
        function(run_jster_, app_, host_, i_, browser_) {
          cat("shinyjster - ", "starting app", "\n", sep = "")
          on.exit({
            cat("shinyjster - ", "stopping app", "\n", sep = "")
          }, add = TRUE)

          run_jster_(
            app = app_,
            port = NULL,
            host = host_,
            browser = browser_
          )
        },
        list(
          run_jster_ = run_jster,
          app_ = app,
          host_ = host,
          i_ = i,
          browser_ = browser
        ),
        env = callr::rcmd_safe_env()[! names(callr::rcmd_safe_env()) %in% "R_BROWSER"],
        supervise = TRUE,
        stderr = "2>&1"
        # ,
        # cmdargs = c("--no-save", "--no-restore")
      )
    )
  }

  ret <- NULL
  print_process_output = function(i) {
    pr <- processes[[i]]$p
    appDir <- processes[[i]]$app
    ret <<- rbind(ret, pr$get_result())
    cat(
      paste(
        paste0("core[", i, "]: ", basename(appDir), " - "),
        pr$read_output_lines(),
        sep = "", collapse = "\n"
      ),
      "\n"
    )
  }

  # while any processes exists
  repeat {
    for (i in seq_len(cores)) {
      if (is.null(processes[[i]])) {
        # will not do anything if no app exists
        do_process(i) # start first
      } else if (!processes[[i]]$p$is_alive()) {
        print_process_output(i) # print prior
        processes[i] <- list(NULL) # clean up
        do_process(i) # start next
      }
    }

    if (all(vapply(processes, is.null, logical(1)))) {
      break
    }
    Sys.sleep(0.5)
  }

  ret
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
apps_to_test <- function() {
  bad_apps <- c(
    "01-hello-fail",
    "132-async-events"
  )
  if (gh_actions_system() == "Windows") {
    bad_apps <- c(bad_apps, "022-unicode-chinese")
  }

  app_dir <- system.file("shinyjster", package = "shinyjster")
  apps <- dir(app_dir, full.names = TRUE)

  bad_pos <- basename(apps) %in% bad_apps
  apps <- apps[!bad_pos]

  sample(apps, length(apps))
}
