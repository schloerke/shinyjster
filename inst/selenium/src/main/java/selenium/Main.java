package selenium;

import io.github.bonigarcia.wdm.WebDriverManager;
import org.apache.commons.cli.*;
import org.openqa.selenium.By;
import org.openqa.selenium.Dimension;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;
import org.openqa.selenium.edge.EdgeDriver;
import org.openqa.selenium.edge.EdgeOptions;
import org.openqa.selenium.firefox.FirefoxDriver;
import org.openqa.selenium.firefox.FirefoxOptions;
import org.openqa.selenium.ie.InternetExplorerDriver;
import org.openqa.selenium.ie.InternetExplorerOptions;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

class Main {

  private static Options cliOptions = new Options();
  private static String shinyjsterXpath = "//span[@id='shinyjster_progress_val' and contains(., 'done!')]";

  public static void help() {
    HelpFormatter formatter = new HelpFormatter();
    formatter.printHelp("Main", cliOptions);
    System.exit(0);
  }

  public static void main(String... args) throws Exception {
    cliOptions.addOption("h", "help", false, "Show help.");
    cliOptions.addOption("u", "url", true, "Target URL.");
    cliOptions.addOption("b", "browser", true, "Browser. Available browsers: firefox, chrome, edge, ie");
    cliOptions.addOption("H", "headless", false, "Whether or not to run headless.");
    cliOptions.addOption("t", "timeout", true, "Timeout in seconds, defaults to 60.");

    CommandLineParser parser = new DefaultParser();
    CommandLine cmd = parser.parse(cliOptions, args);

    if (cmd.hasOption("h")) help();
    if (!cmd.hasOption("u")) {
      System.out.println("Missing --app or --url");
      help();
    }

    WebDriver driver = null;

    switch(cmd.getOptionValue("browser", "chrome")) {
      case "chrome":
        WebDriverManager.chromedriver().setup();
        ChromeOptions chromeOptions = new ChromeOptions();
        if (cmd.hasOption("H")) chromeOptions.addArguments("--headless");
        driver = new ChromeDriver(chromeOptions);
        break;
      case "firefox":
        WebDriverManager.firefoxdriver().setup();
        FirefoxOptions ffOptions = new FirefoxOptions();
        if (cmd.hasOption("H")) ffOptions.addArguments("-headless");
        driver = new FirefoxDriver(ffOptions);
        break;
      case "edge":
        if (cmd.hasOption("H")) throw new IllegalArgumentException("edge doesn't have headless support");
        WebDriverManager.edgedriver().setup();
        EdgeOptions edgeOptions = new EdgeOptions();
        driver = new EdgeDriver(edgeOptions);
        break;
      case "ie":
        if (cmd.hasOption("H")) throw new IllegalArgumentException("ie doesn't have headless support");
        WebDriverManager.iedriver().setup();
        InternetExplorerOptions ieOptions = new InternetExplorerOptions();
        driver = new InternetExplorerDriver(ieOptions);
        break;
      default:
        throw new IllegalArgumentException("Unknown browser argument: " + cmd.getOptionValue("browser"));
    }

    driver.manage().window().setSize(new Dimension(1200, 800));
    driver.get(cmd.getOptionValue("u"));

    By body = By.xpath(shinyjsterXpath);
    int timeout = Integer.parseInt(cmd.getOptionValue("timeout", "60"));

    try {
      new WebDriverWait(driver, timeout).until(ExpectedConditions.presenceOfElementLocated(body));
    } finally {
      driver.quit();
    }
  }
}
