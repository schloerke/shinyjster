#' Run an application with shinyjster enabled
#'
#' @inheritParams shiny::runApp
#' @rdname run_jster
#' @export
run_jster <- function(appDir, port = 8000, host = "127.0.0.1") {
  url <- paste0("http://", host, ":", port, "/?shinyjster=1")
  later::later(delay = 0.5, function() {
    utils::browseURL(url)
  })
  shiny::runApp(appDir, port, host = host, launch.browser = FALSE)
}


#' Run many applications with shinyjster enabled
#'
#' @param apps Vector of `appDir` values
#' @param type Single value to determine how applications are executed. \describe{
#'  \item{\code{'parallel'}}{Runs apps using \code{parallel::mclapply} using \code{cores} cores}
#'  \item{\code{'callr'}}{Runs apps using \code{callr::r_bg} using \code{cores} cores}
#'  \item{\code{'serial'}}{Runs apps one after another using \code{lapply}. \code{port} is only used with option \code{'serial'}}
#' }
#' @param cores Number of cores (if needed) to execute on.
#' @rdname run_jster
#' @export
run_jster_apps <- function(
  apps,
  type = c("parallel", "callr", "serial"),
  cores = parallel::detectCores(),
  port = 8000,
  host = "127.0.0.1"
) {

  switch(match.arg(type),
    "parallel" = run_jster_apps_parallel(apps, cores = cores, host = host),
    "callr" = run_jster_apps_callr(apps, cores = cores, host = host),
    run_jster_apps_lapply(apps, cores = cores, port = port, host = host)
  )
}

run_jster_apps_lapply <- function(
  apps = apps_to_test(),
  cores = parallel::detectCores(),
  port = 8000,
  host = "127.0.0.1"
){
  lapply(apps, function(app) {
    cat("shinyjster - ", "launching app: ", basename(app), "\n", sep = "")
    run_jster(app, port = port, host = host)
    cat("shinyjster - ", "closing app: ", basename(app), "\n", sep = "")
  })
  invisible(TRUE)
}


run_jster_apps_parallel <- function(
  apps = apps_to_test(),
  cores = parallel::detectCores(),
  host = "127.0.0.1"
) {

  if (!requireNamespace("httpuv", quietly = TRUE)) {
    stop("httpuv must be installed for this function to work")
  }

  callr::r(
    function(apps_, cores_, host_) {
      parallel::mclapply(
        apps_,
        mc.cores = cores_,
        mc.preschedule = FALSE,
        FUN = function(app) {
          cat("shinyjster - ", "launching app: ", basename(app), "\n", sep = "")
          port <- httpuv::randomPort()
          url <- paste0("http://", host_, ":", port, "/?shinyjster=1")
          later::later(delay = 0.5, function() {
            utils::browseURL(url)
          })

          # utils::browseURL(url)
          shiny::runApp(app, port, host = host_, launch.browser = FALSE)
          cat("shinyjster - ", "closing app: ", basename(app), "\n", sep = "")
        }
      )
    },
    list(
      apps_ = apps,
      cores_ = cores,
      host_ = host
    ),
    env = callr::rcmd_safe_env()[! names(callr::rcmd_safe_env()) %in% "R_BROWSER"],
    supervise = TRUE,
    show = TRUE
  )

  invisible()
}



run_jster_apps_callr <- function(
  apps = apps_to_test(),
  cores = parallel::detectCores(),
  host = "127.0.0.1"
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
        function(app_, host_, i_) {
          cat("shinyjster - ", "launching app", "\n", sep = "")

          port <- httpuv::randomPort()
          url <- paste0("http://", host_, ":", port, "/?shinyjster=1")
          later::later(delay = 0.5, function() {
            utils::browseURL(url)
          })

          # utils::browseURL(url)
          shiny::runApp(app_, port, host = host_, launch.browser = FALSE)
          cat("shinyjster - ", "closing app", "\n", sep = "")
        },
        list(
          app_ = app,
          host_ = host,
          i_ = i
        ),
        env = callr::rcmd_safe_env()[! names(callr::rcmd_safe_env()) %in% "R_BROWSER"],
        supervise = TRUE,
        stderr = "2>&1"
        # ,
        # cmdargs = c("--no-save", "--no-restore")
      )
    )
  }

  print_process_output = function(i) {
    cat(
      paste(
        paste0("core[", i, "]: ", basename(processes[[i]]$app), " - "),
        processes[[i]]$p$read_output_lines(),
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

  invisible(TRUE)
}







apps_to_test <- function() {
  bad_apps <- c(
    "01-hello-fail",
    "132-async-events"
  )

  app_dir <- system.file("shinyjster", package = "shinyjster")
  apps <- dir(app_dir, full.names = TRUE)

  bad_pos <- basename(apps) %in% bad_apps
  apps <- apps[!bad_pos]

  apps
}
