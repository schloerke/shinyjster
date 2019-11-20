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

test_working_apps_parallel <- function(cores = parallel::detectCores(), host = "127.0.0.1") {

  if (!requireNamespace("httpuv", quietly = TRUE)) {
    stop("httpuv must be installed for this function to work")
  }

  apps <- apps_to_test()

  parallel::mclapply(
    apps, mc.cores = cores, mc.preschedule = FALSE,
    FUN = function(app) {
      jster_message("launching app: ", basename(app))
      port <- httpuv::randomPort()
      url <- paste0("http://", host, ":", port, "/?shinyjster=1")
      later::later(delay = 0.5, function() {
        utils::browseURL(url)
      })

      # utils::browseURL(url)
      shiny::runApp(app, port, host = host, launch.browser = FALSE)
      jster_message("closing app: ", basename(app))
    }
  )

  invisible()
}



test_working_apps_callr <- function(cores = parallel::detectCores(), host = "127.0.0.1") {
  if (!requireNamespace("httpuv", quietly = TRUE)) {
    stop("httpuv must be installed for this function to work")
  }
  if (!requireNamespace("callr", quietly = TRUE)) {
    stop("callr must be installed for this function to work")
  }
  apps <- apps_to_test()

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

  while (length(apps) > 0) {
    for (i in seq_len(cores)) {
      if (is.null(processes[[i]])) {
        do_process(i)
      } else if (!processes[[i]]$p$is_alive()) {
        print_process_output(i)
        do_process(i)
      }
    }
    Sys.sleep(0.5)
  }

  for (i in seq_len(cores)) {
    if (!is.null(processes[[i]])) {
      if (processes[[i]]$p$is_alive()) {
        # jster_message("waiting for core[", i, "]")
        processes[[i]]$p$wait()
      }
      print_process_output(i)
    }
  }

  TRUE
}
