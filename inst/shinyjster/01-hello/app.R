library(shiny)
library(shinyjster)

ui <- fluidPage(

  shinyjster_ui(),
  
  titlePanel("Button Example - Do NOT Touch application"),

  sidebarLayout(

    sidebarPanel(
      actionButton("button", "Do not click me")
    ),

    mainPanel(
      verbatimTextOutput("number")
    )
  ),

  # include shinyjster JS at end of UI definition
  shinyjster_js(
    "var jst = jster(1000)",
    "jst.add(function(done) { $('#button').click(); done() });",
    "jst.add(function(done) { $('#button').click(); done() });",
    "jst.add(function(done) { $('#button').click(); done() });",
    "jst.add(function(done) { if ($('#number').text() == '3') done(); throw 'text does not equal three' });",
    "jst.test()"
  )

)

server <- function(input, output, session) {

  # include shinyjster_server call at top of server definition
  shinyjster_server(input, output, session)

  output$number <- renderText({
    input$button
  })
}

# Create Shiny app ----
shinyApp(ui = ui, server = server)
