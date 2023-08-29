# Homework #Extra Credit: D3 Joins and Interactions

In this homework, you'll apply knowledge about D3 Interactions and joins to create a Stacked Area Chart that interactively updates as countries for the dataset are changed. By the end of this assignment you should be able to:

- Download the Global Development dataset (`global_development.csv`) from the CORGIS website for use in your visualization. Select four Health attributes of interest that you want to visualize.
- Display a stacked area chart on your webpage that shows a user-selected country over the dataset's time range of 1980-2013.
- Using HTML controls, the user can change (1) which country is shown in the stacked area chart.

## Dataset Description

The global_development.csv dataset contains information on various economic, social, and demographic indicators for countries around the world. The data covers a wide range of topics, including population, GDP, education, health, energy, and environment. The dataset includes data from various sources, such as the World Bank, United Nations, and World Health Organization, and covers a period of several decades. The dataset can be used for various analyses and visualizations related to global development and socio-economic trends across countries.

The screenshot below shows an example of what your finished interface will look like.

![alt text](https://github.com/Karthik-Aravapalli/extra-credit-karavapa/blob/main/images/extra_credit_image.gif)

## Overview

The starter code for this assignment is given in the template folder named as `index.html`. This starter code is just basic HTML code to show the homework name and name of the student and details. Please continue to develop the code as per the given following steps to complete the homework.

## Step 1: Create your dataset and initial webpage

![alt text](https://github.com/Karthik-Aravapalli/extra-credit-karavapa/blob/main/images/Control_Panel_Image_1.JPG)

Download the Global Development dataset from the [CORGIS website](https://corgis-edu.github.io/corgis/csv/) and pick four health attributes that you would like to visualize.

There's a `data` folder in the completed folder parent folder where you should place the downloaded CSV file.

Create an `index.html` or use the given basic 'index.heml' page for your interface in the root directory of this assignment repository. Link to the D3 library (remember, you must use D3 v7!), and if desired, create external CSS or JS files to put your code. You may also use Bootstrap if you like, though this is not required.

The exact design of your webpage is up to you, but it should include the following.

- Simlar to previous homeworks, at the top of the page, title your page and add your name and email.
- You'll need an SVG to hold your chart. The size should be between 900 x 600 and 2048 x 1080.
- You'll also need a control panel to hold the HTML elements for manipulating your visualization. The control panel should have the following controls (with text labels):
    - **Country Selection:** Under this Country Selection your five selected countries are displayed to show the selected country health data for the selected attributes.
    - **Health Attributes:** Choose any four Health or any different category attributes. In this example I chose four health attributes.
    - **Health Data Summary:** Under the Health Data Summary, show the average of the choosen attributes data for the selected country. You need to compute this average based on the selected data in Javascript.
   
My suggestion is to place these elements in a control panel area, either to the side of the chart or above or below it, so they can be organized in a way that makes sense. Controls should use consistent styling/theme. Feel free to use Bootstrap or custom CSS to do this.

## Step 2: Import (and wrangle?) your dataset

Import the two CSV files into your page: the CORGIS `global_development.csv` file. You may do any data wrangling you feel is necessary, either before or after importing your csv files. The point of this step is to get the dataset to a point where, based on the user interacting with the HTML controls, the stacked area chart can update appropriately.

> 🔍 The dataset goes from 1980-2013, though some countries may be missing data for certain years. If a country attribute starts after 1980, or stops prior to 2013, you can stop drawing the area at that point. If a country has a "gap" year (e.g., say there's data for 1990 and 1992, but not 1991), you can either (1) directly connect the area between the existing years (i.e., connect the area from 1990 to 1992), (2) make the area go to a value of 0 for the gap year, or (3) you can stop drawing the area for the missing year, and pick it back up at the next year (i.e., the area would stop drawing at 1990, and re-start at 1992). Also, you are allowed to use Python libraries to pre-process the data for selected attributes and renaming the attributes to knownable names and allowed to filter out the data to reduce the size of data set i.e. re-load global_development.csv for chosen countries data only.

## Step 3: Stacked Area chart encodings
The default encodings for your area chart should be the following:
- The x-axis will be bottom aligned, and the y-axis will be left-aligned. The x-axis should go from 1980-2013. The y-axis will go from 0 to the max value of the currently selected global development attribute, based on the current selected country.
- For each selected country, draw the stacked area chart for the choosen global development attributes. The y- axis has to change when a country is selected based on the maximum value of the attributes.

When your page initially loads, it's up to you whether you want the chart to be blank (i.e., no regions selected), or pre-populated with data.

## Step 4: Stacked chart interactions

![alt text](https://github.com/Karthik-Aravapalli/extra-credit-karavapa/blob/main/images/Full_Image_1.JPG)

Based on the user interacting with the control panel, your chart should perform the following actions:
- **Selecting a Country**: If the user selected a new country by clicking/checking it on the control panel, you will reload the data to have the selected country data and re-draw the stacked area chart. In doing this, you might also need to adjust your y-axis (in the case that the new country has the new max value for the y-axis). Follow this sequence of actions when selecting a new country from the choosen five countries.
- **Changing the y-attribute:** If the y-attribute is changed, you'll need to transition the y-scale's domain based on the new attribue. Compute the new max for the current selected country in the chart, and transition both the y-axis and the area based on this scale. (This transition should look like the axis transitions you might do in the "add a new country" and the "changing a country" steps.)
- **Hover on a Area chart legends:** When a user hovers on a stacked area legends, square boxes, or text label, you should highlight that country area and de-emphasize the other countries in the chart.


## Step 5: Extra credit opportunities

![alt text](https://github.com/Karthik-Aravapalli/extra-credit-karavapa/blob/main/images/Full_Image_2.JPG)

There are ways you can potentially receive extra credit for this assignment:

Your webpage should get the computed average values from the javascript -

- **Return Health Data Summary:** When a user selectes a country in a control panel script should return the average values of the choosen global data attributes and this average values needs to be displayed in the control panel under the Return Health Data Summary same as the above picture. (+1) 

- Your webpage and visualization is designed/styled in an attractive way that the grader likes. Note that this E.C. opportunity is not applicable for a grade appeal. (+1)

## Grading

This assignment is worth ten points.

- Step 1 is worth 2 point
- Step 2 is worth 2 point
- Step 3 is worth 3 points
- Step 4 is worth 3 points
- Step 5 is worth up to 2 extra credit points
