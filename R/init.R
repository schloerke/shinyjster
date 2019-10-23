
#' shinyjster HTML Dependencies
#' 
#' @return \code{htmltools::\link[htmltools]{htmlDependency}}s to allow shinyjster to function.
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

#' JavaScript helper
#' 
#' Wraps supplied text in an \code{htmltools::tags$script} call after turning it into \code{JS} code.
#' 
#' @param ... JavaScript text to be put in a script.
#' @export
js_script <- function(...) {
  htmltools::tags$script(JS(...))
}





#' Shiny UI helper
#' 
#' Function to be called first inside the definition of the Shiny UI.
#' 
#' This function will add the shinyjster JS dependencies and add a text based progress bar in the bottom left corner of the application.
#' 
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

#' Shiny JavaScript helper
#' 
#' Function to be called first inside the definition of the Shiny UI.
#' 
#' This function also includes \code{\link{shinyjster_ui}} and wraps all JavaScript using \code{\link{js_script}}.
#' 
#' @param ... JavaScript text to be put in a script.
#' @param set_timeout If \code{TRUE} (default), the JavaScript provided is executed 250 milliseconds after the document is ready.  Otherwise, code is included as is. 
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


#' Shiny server helper
#' 
#' Function to be called within the shiny server
#' @param input,output,session Shiny server function parameters
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
    message("Browser window has been closed. Stopping Shiny Application now.")
    shiny::stopApp()
  })
}
