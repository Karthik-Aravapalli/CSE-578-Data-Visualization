import pandas as pd

# Read the CSV file
df = pd.read_csv("C:\\Users\\karavapa\\Documents\\DV\\extra-credit-karavapa\\completed\\data\\global_development.csv")

# Rename the column names
df = df.rename(columns={"Country": "country",
                        "Year": "year",
                        "Data.Health.Birth Rate": "Birth_Rate",
                        "Data.Health.Death Rate": "Death_Rate",
                        "Data.Health.Fertility Rate": "Fertility_Rate",
                        "Data.Health.Population Growth": "Population_Growth"})

renamed_df = df[["country", "year", "Birth_Rate", "Death_Rate", "Fertility_Rate", "Population_Growth"]]

# Save the updated dataframe to a new CSV file on global_development
renamed_df.to_csv("C:\\Users\\karavapa\\Documents\\DV\\extra-credit-karavapa\\completed\\data\\global_development.csv", index=False)
