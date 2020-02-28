package com.rstudio.seleniumRunner

import io.github.bonigarcia.wdm.DriverManagerType
import io.github.bonigarcia.wdm.WebDriverManager
import org.openqa.selenium.By
import org.openqa.selenium.Dimension
import org.openqa.selenium.WebDriver
import org.openqa.selenium.support.ui.ExpectedConditions
import org.openqa.selenium.support.ui.WebDriverWait
import kotlin.system.exitProcess

// Types are chrome,firefox,opera,edge,phantomjs,iexplorer,selenium_server_standalone,chromium
val types = enumValues<DriverManagerType>().map { it.name.toLowerCase() }.joinToString(",")

fun help() {
    println("""
            Usage:
                selenium DRIVER DIMENSIONS URL XPATH TIMEOUT [OPTION]...
                
                DRIVER: Name of a Selenium driver. Valid names are: $types
                DIMENSIONS: Window dimension, in pixels, of the format 1200x800
                URL: URL to visit.
                XPATH: XPath selector string. When the selector matches any elements on the page, this tool exits successfully.
                TIMEOUT: The number of seconds to wait for the selector to match before exiting with an error.
                OPTION: Zero or more arguments to add as Selenium driver options.
                
            Example:
                java -jar selenium.jar chrome 1200x800 https://news.google.com/ '//body' 30 --headless
        """.trimIndent())
    exitProcess(0)
}

fun driverOptions(driverName: String, args: List<String>): Any? {
    if (args.isEmpty()) return null
    val className = when(driverName) {
        "chrome" -> "org.openqa.selenium.chrome.ChromeOptions"
        "firefox" -> "org.openqa.selenium.firefox.FirefoxOptions"
        "opera" -> "org.openqa.selenium.opera.OperaOptions"
        "iexplorer" -> "org.openqa.selenium.ie.InternetExplorerOptions"
        else -> error("$driverName does not support options.")
    }
    val klass = Class.forName(className)
    val inst = klass.getDeclaredConstructor().newInstance()
    val meth = klass.getMethod("addArguments", Array<String>::class.java)
    meth.invoke(inst, args.toTypedArray())
    return inst
}

fun main(args: Array<String>) {
    if (args.size < 5) {
        println("Missing required arguments.")
        help()
    }

    val (driverName, dims, url, xPath, timeoutStr) = args
    val timeout = timeoutStr.toLong()
    val (x, y) = dims.split("x").map { it.toInt() }
    val opts = args.drop(5)

    val driverType = enumValueOf<DriverManagerType>(driverName.toUpperCase())
    WebDriverManager.getInstance(driverType).setup()
    val driverClass = Class.forName(driverType.browserClass())
    val optionsObject = driverOptions(driverName, opts)
    val driver = if (optionsObject == null) {
        driverClass.getDeclaredConstructor().newInstance()
    } else {
        driverClass.getDeclaredConstructor(optionsObject::class.java).newInstance(optionsObject)
    } as WebDriver

    driver.manage().window().size = Dimension(x, y)
    driver.get(url)

    val sel = By.xpath(xPath)

    try {
        WebDriverWait(driver, timeout).until(ExpectedConditions.presenceOfElementLocated(sel))
    } finally {
        driver.quit()
    }
}