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
  return(
    run_app(
      appDir,
      port = port,
      host = host,
      launch.browser = FALSE
    )
  )
}

run_app <- function(appDir, ...) {
  ret <- shiny::runApp(appDir, ...)
  tibble::tibble(
    appDir = appDir,
    successful = identical(ret$type, "success"),
    returnValue = list(ret)
  )
}


#' @param apps Vector of `appDir` values
#' @param type Single value to determine how applications are executed. \describe{
#'  \item{`'parallel'`}{Runs apps using `parallel::mclapply` using `cores` cores}
#'  \item{`'callr'`}{Runs apps using `callr::r_bg` using `cores` cores}
#'  \item{`'serial'`}{Runs apps one after another using `lapply`. `port` is only used with option `'serial'`}
#' }
#' @param cores Number of cores (if needed) to execute on.
#' @rdname run_jster
#' @export
run_jster_apps <- function(
  apps,
  type = c("parallel", "callr", "lapply"),
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
  ret <- lapply(apps, function(app) {
    cat("shinyjster - ", "launching app: ", basename(app), "\n", sep = "")
    on.exit({
      cat("shinyjster - ", "closing app: ", basename(app), "\n", sep = "")
    }, add = TRUE)
    run_jster(app, port = port, host = host)
  })
  do.call(rbind, ret)
}


run_jster_apps_parallel <- function(
  apps = apps_to_test(),
  cores = parallel::detectCores(),
  host = "127.0.0.1"
) {

  if (!requireNamespace("httpuv", quietly = TRUE)) {
    stop("httpuv must be installed for this function to work")
  }

  ret <- parallel::mclapply(
    apps,
    mc.cores = cores,
    mc.preschedule = FALSE,
    FUN = function(app) {
      cat("shinyjster - ", "launching app: ", basename(app), "\n", sep = "")
      on.exit({
        cat("shinyjster - ", "closing app: ", basename(app), "\n", sep = "")
      }, add = TRUE)
      port <- httpuv::randomPort()
      url <- paste0("http://", host, ":", port, "/?shinyjster=1")
      later::later(delay = 0.5, function() {
        utils::browseURL(url)
      })

      # utils::browseURL(url)
      run_app(app, port = port, host = host, launch.browser = FALSE)
    }
  )

  do.call(rbind, ret)
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
          on.exit({
            cat("shinyjster - ", "closing app", "\n", sep = "")
          }, add = TRUE)

          port <- httpuv::randomPort()
          url <- paste0("http://", host_, ":", port, "/?shinyjster=1")
          later::later(delay = 0.5, function() {
            utils::browseURL(url)
          })

          # utils::browseURL(url)
          shinyjster:::run_app(app_, port, host = host_, launch.browser = FALSE)
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

  ret <- NULL
  print_process_output = function(i) {
    pr <- processes[[i]]$p
    ret <<- rbind(ret, pr$get_result())
    cat(
      paste(
        paste0("core[", i, "]: ", basename(processes[[i]]$app), " - "),
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
