from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
import time
import os

# Create screenshots directory
os.makedirs('screenshots', exist_ok=True)

# Chrome options
chrome_options = Options()
chrome_options.add_argument('--start-maximized')
chrome_options.add_argument('--disable-blink-features=AutomationControlled')

# Initialize driver
driver = webdriver.Chrome(options=chrome_options)

try:
    # Screenshot 1: Home Page
    print("📸 Taking Home Page screenshot...")
    driver.get('http://localhost:5173/')
    time.sleep(3)
    driver.save_screenshot('screenshots/01_home_page.png')
    print("✅ Home page screenshot saved")
    
    # Screenshot 2: Login Page
    print("📸 Taking Login Page screenshot...")
    driver.get('http://localhost:5173/login')
    time.sleep(2)
    driver.save_screenshot('screenshots/02_login_page.png')
    print("✅ Login page screenshot saved")
    
    # Screenshot 3: Register Page
    print("📸 Taking Register Page screenshot...")
    driver.get('http://localhost:5173/register')
    time.sleep(2)
    driver.save_screenshot('screenshots/03_register_page.png')
    print("✅ Register page screenshot saved")
    
    # Screenshot 4: Donation Camps Page
    print("📸 Taking Donation Camps Page screenshot...")
    driver.get('http://localhost:5173/camps')
    time.sleep(3)
    driver.save_screenshot('screenshots/04_donation_camps.png')
    print("✅ Donation camps screenshot saved")
    
    # Screenshot 5: Heroes Page
    print("📸 Taking Heroes Page screenshot...")
    driver.get('http://localhost:5173/heroes')
    time.sleep(3)
    driver.save_screenshot('screenshots/05_heroes_page.png')
    print("✅ Heroes page screenshot saved")
    
    # Login for dashboard screenshots
    print("📸 Logging in for dashboard screenshots...")
    driver.get('http://localhost:5173/login')
    time.sleep(2)
    
    # Enter credentials
    email_field = driver.find_element(By.NAME, 'email')
    password_field = driver.find_element(By.NAME, 'password')
    email_field.send_keys('rajputdhruv385@gmail.com')
    password_field.send_keys('password123')
    
    # Click login button
    login_button = driver.find_element(By.XPATH, "//button[contains(text(), 'Login')]")
    login_button.click()
    time.sleep(3)
    
    # Screenshot 6: User Dashboard
    print("📸 Taking User Dashboard screenshot...")
    driver.get('http://localhost:5173/dashboard')
    time.sleep(3)
    driver.save_screenshot('screenshots/06_user_dashboard.png')
    print("✅ User dashboard screenshot saved")
    
    print("\n✅ All screenshots captured successfully!")
    print("📁 Screenshots saved in: screenshots/ directory")
    
finally:
    driver.quit()
