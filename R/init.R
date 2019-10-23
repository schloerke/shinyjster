
#' @export
shinyjster_js_dependencies <- function() {
  list(
    htmltools::htmlDependency(
      name = "shinyjster-assets", 
      version = packageVersion("shinyjster"),
      package = "shinyjster",
      src = "assets",
      script = "js/shinyjster.js"
    )
  )
}

# htmlwidgets::JS
JS <- function(...) {
  x <- c(...)
  if (is.null(x)) {
    return()
  }
  if (!is.character(x)) {
    stop("The arguments for JS() must be a character vector")
  }
  x <- paste(x, collapse = "\n")
  structure(x, class = unique(c("JS_EVAL", oldClass(x))))
}

#' @export
js_script <- function(...) {
  htmltools::tags$script(JS(...))
}


#' @export
shinyjster_js <- function(..., set_timeout = TRUE) {
  js <- if (isTRUE(set_timeout)) {
    c(
      "$(function() {
        setTimeout(
          function(){",
            ...,
      "   }, 
          250
        )
      });"
    )
  } else {
    c(...)
  }

  htmltools::tagList(
    shinyjster_ui(),
    js_script(js)
  )
}



#' @export
shinyjster_ui <- function() {
  htmltools::tagList(
    shinyjster_js_dependencies(),

    htmltools::tags$div(
      id = "shinyjster_progress",
      style = "position: absolute; left: 0px; bottom: 0px;"
    )
  )

}

#' @importFrom utils packageVersion str
#' @export
shinyjster_server <- function(input, output, session) {
  shiny::observeEvent(input$jster_done, {
    val <- input$jster_done
    str(val)

    if (identical(val$type, "success")) {
      message("Success! Closing Browser window")
      session$sendCustomMessage("shinyjster_msg_close_window", TRUE)
    } else {
      stop(val$error)
    }
  })

  shiny::observeEvent(input$jster_closing_window, {
    message("Browser window has been closed. Stopping Shiny Application.")
    shiny::stopApp()
  })
}
